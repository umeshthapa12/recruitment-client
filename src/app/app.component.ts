import { AfterViewChecked, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostBinding, isDevMode, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import * as objectPath from 'object-path';
import { Observable } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { GetAppliedIdsAction, GetFavJobsIdsAction, GetLikedJobsIdsAction } from './content/pages/store/page-store/page-actions';
import { ClassInitService } from './core/services/class-init.service';
import { LayoutConfigService } from './core/services/layout-config.service';
import { PageConfigService } from './core/services/page-config.service';
import { CookieKeys, ResponseModel, UsersModel, UserType } from './models';
import { CookieService } from './services/cookie.service';
import { ActivateOverlayAction, DeactivateOverlayAction, GetEmployerInfoAction, GetPageCoverNavAction, IsUserLoggedInAction, InitGlobalData } from './store/app-store';
import { SignalRHubService } from './utils/libraries/signalr-hub.service';

@Component({
	selector: 'body[m-root]',
	templateUrl: './app.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements AfterViewInit, AfterViewChecked, OnInit {

	@HostBinding('style') style: any;
	@HostBinding('class') classes: any = '';

	@ViewChild('splashScreen', { read: ElementRef, static: true })
	splashScreen: ElementRef;
	splashScreenImage: string;
	private info: UsersModel;

	@Select('userLogin', 'initLogin') login$: Observable<ResponseModel>;

	@Select('userLogin', 'employerInfo')
	readonly employer$: Observable<ResponseModel>;

	constructor(
		private cdr: ChangeDetectorRef,
		private layoutConfigService: LayoutConfigService,
		private classInitService: ClassInitService,
		private sanitizer: DomSanitizer,
		private router: Router,
		private pageConfigService: PageConfigService,
		private store: Store,
		private cookieService: CookieService,
		private hubCon: SignalRHubService
	) {

		// Probably not the best solution
		this.store.dispatch(new GetEmployerInfoAction(true)).pipe(
			filter(_ => _ && _.userLogin && _.userLogin.employerInfo && _.userLogin.employerInfo.contentBody))
			.subscribe({ next: res => [this.info = res.userLogin.employerInfo.contentBody] });

		// subscribe to class update event
		this.classInitService.onClassesUpdated$.subscribe(classes => {
			// get body class array, join as string classes and pass to host binding class
			setTimeout(() => this.classes = classes.body.join(' '));
		});

		this.layoutConfigService.onLayoutConfigUpdated$.subscribe(model => {
			this.classInitService.setConfig(model);

			this.style = '';
			if (objectPath.get(model.config, 'self.layout') === 'boxed') {
				const backgroundImage = objectPath.get(model.config, 'self.background');
				if (backgroundImage) {
					this.style = this.sanitizer.bypassSecurityTrustStyle('background-image: url(' + objectPath.get(model.config, 'self.background') + ')');
				}
			}

			// splash screen image
			this.splashScreenImage = objectPath.get(model.config, 'loader.image');
		});

		// override config by router change from pages config
		this.router.events
			.pipe(filter(event => event instanceof NavigationEnd))
			.subscribe(e => {
				this.layoutConfigService.setModel({ page: objectPath.get(this.pageConfigService.getCurrentPageConfig(), 'config') }, true);
			});

		// warning on console for malicious activity
		this.warnConsole();

		this.init();

	}

	private applyConfig() {
		// this.cdr.markForCheck()
		const m = (this.info || {});
		if ((m.domain || '') === '') return;

		// dynamically update document default content based on company info
		const t = document.querySelector('#doc-title') as HTMLTitleElement;
		const f = document.querySelector('#doc-favicon') as HTMLAnchorElement;
		const x = m.about && JSON.parse(m.about).map(_ => _.insert).join(' ');

		if (t && m.about) t.innerText = x;
		if (f && m.favicon) f.href = m.favicon;
	}

	ngOnInit() {
		// checks on app start, set interval to check until it get expired

		let counter = 1;
		const fn = () => {
			this.checkSessionOnAppInit();
			setTimeout(fn, 5000 * counter);
			counter++;
		};
		setTimeout(fn, 0);
	}

	ngAfterViewChecked() { this.applyConfig(); }

	private checkSessionOnAppInit() {

		// There should be user. User might be a guest only so we don't check on each startup
		// until some user login and generates client accessible cookie
		const uuid = this.cookieService.get(CookieKeys.UUId);
		if ((uuid || '') === '') return;

		const userType = <UserType>this.cookieService.get(CookieKeys.Subject);
		// recursive action calls. After app startup, we keep checking for session expiration
		// where we can ask user to re-authenticate when it expires

		this.store.dispatch(new IsUserLoggedInAction(userType));

	}

	private initJobSeekerSavedData() {
		const uuid = this.cookieService.get(CookieKeys.UUId);
		const sub = this.cookieService.get(CookieKeys.Subject);

		if ((uuid || '') === '' || sub === 'employer') return;

		this.store.dispatch([new GetLikedJobsIdsAction(), new GetFavJobsIdsAction()]);
	}

	ngAfterViewInit() {

		this.store.dispatch(new GetPageCoverNavAction());

		this.store.dispatch(new ActivateOverlayAction(true));
		setTimeout(() => {
			this.store.dispatch(new DeactivateOverlayAction());
		}, 200);

		this.login$.pipe(debounceTime(200), filter(_ => !!_))
			.subscribe({
				next: _ => {
					const sub = this.cookieService.get(CookieKeys.Subject);
					// only for job seeker
					if (sub === 'jobseeker') {
						this.store.dispatch([
							new GetLikedJobsIdsAction(),
							new GetFavJobsIdsAction(),
							new GetAppliedIdsAction()
						]);
					}
				}
			});

		this.initJobSeekerSavedData();

		// if (typeof navigator.serviceWorker !== 'undefined') {
		// 	console.log('defined')
		// 	navigator.serviceWorker.register('assets/sw/sw.js')
		// }

		this.employer$.pipe(filter(_ => _ && _.contentBody), debounceTime(1000)).subscribe({
			next: res => {
				this.cdr.markForCheck();
				const u: UsersModel = res && res.contentBody;
				this.info = u;
				/*-------------------------------------------------------------

				When an employer add domain name for simple tenant feature, they should see the job listing page by default thus `/all-jobs` is set to default route. The list of jobs grouped by company is set to default for non-tenant feature.

				------------------------------------------------------------------*/
				const isRoot = (window.location.pathname === '/' || document.location.pathname === '/');
				const userDomain = (u && u.domain || '').replace('www.', '');
				const isAlreadyInRoute = (window.location.pathname) === '/all-jobs';

				// also check whether the request hostname is the same.
				const hn = (window.location.hostname.replace('www.', '') === userDomain);

				if (userDomain !== '' && isRoot && hn && !isAlreadyInRoute)
					this.router.navigate(['./all-jobs']);
			}
		});

		this.hubCon.initSignalR();
	}

	private warnConsole() {
		// warning message to the user whenever they open the developer console
		if (!isDevMode()) {
			console.log('%cStop! ', 'color: red; font-size:80px; text-shadow:3px 3px 0 #000, -1px -1px 0 #001,   1px -1px 0 #002,  -1px 1px 0 #003,1px 1px 0 #004;');
			console.log('%cThis is a browser feature intended for developers. If someone told you to copy-paste something here to enable a Jobharu feature or "hack" someone\'s account, it is a scam and will give them access to your Jobharu account.', 'color: black; font-size:18px;');
		}
	}

	/**
	 * Repeated datasets of multiple sections should load at once
	 * so we can access them from entire app using ngxs state management.
	 * @link https://github.com/ngxs/store
	 */
	init = () => this.store.dispatch(new InitGlobalData());
}
