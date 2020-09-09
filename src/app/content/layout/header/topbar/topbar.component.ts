import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { merge, Observable, Subject } from 'rxjs';
import { debounceTime, delay, filter, map, takeUntil, tap } from 'rxjs/operators';
import { CookieKeys, ResponseModel, UsersModel, UserType } from '../../../../models/app.model';
import { CookieService } from '../../../../services/cookie.service';
import { ActivateOverlayAction, DeactivateOverlayAction } from '../../../../store/app-store';
import { fadeIn } from '../../../../utils';
import { InitAppliedIdsAction } from '../../../pages/store/page-store/page-actions';

@Component({
	selector: 'm-topbar',
	templateUrl: './topbar.component.html',
	animations: [fadeIn],
	changeDetection: ChangeDetectionStrategy.OnPush,
	styles: [`
		.m-nav__item{
			transition: background .2s ease-in-out;
			padding-left:10px !important;
			padding-right:10px !important;
		}
		.m-nav__item:hover{
			background:#f7f7fb
		}
	`]
})
export class TopbarComponent implements OnInit, AfterViewInit, OnDestroy {
	@HostBinding('id') id = 'm_header_nav';
	@HostBinding('class')
	classes = 'm-stack__item m-stack__item--fluid m-header-head';

	private toDestroy$ = new Subject<void>();

	// name of the slice -> state.action
	@Select('userLogin', 'initLogin')
	// returned model
	userLogin$: Observable<ResponseModel>;

	// name of the slice -> state.action
	@Select('userLogin', 'userSession')
	// returned model
	userSession$: Observable<ResponseModel>;

	// name of the slice -> state.action
	@Select('userLogin', 'logout')
	// returned model
	onLogout$: Observable<ResponseModel>;

	isUserLoggedIn: boolean;

	@Select('userLogin', 'employerInfo')
	readonly emp$: Observable<ResponseModel>;
	userInfo: UsersModel;

	constructor(
		private cdr: ChangeDetectorRef,
		private store: Store,
		private cookieService: CookieService,
		private router: Router
	) { }

	ngOnInit() {

		this.onLogout$.pipe(
			filter(_ => !!_),
			tap(_ => this.store.dispatch(new ActivateOverlayAction(true))),
			debounceTime(100),
			tap(_ => {
				this.cdr.markForCheck();
				this.store.dispatch([new DeactivateOverlayAction(), new InitAppliedIdsAction([])]);
				const baseHref = this.cookieService.get(CookieKeys.Subject);
				const isProtected = this.router.url.match(/\b(?:employer|jobseeker)\b/gi);
				// when redirecting to the login page, there is separated pages for job seeker & employer so we must get value from cookie to recognize the user type. we may change this in future update.
				if (baseHref && isProtected)
					this.router.navigateByUrl(`/${baseHref}/login`);

				this.isUserLoggedIn = false;
			}),
			delay(600), takeUntil(this.toDestroy$)

		).subscribe({
			next: _ => {

				this.isUserLoggedIn = null;

				// cleanup: do after using the data of local storage.
				// cleanup. we won't be using this when moved to token based auth
				[CookieKeys.UUId, CookieKeys.Subject]
					.forEach(key => this.cookieService.delete(key, '/'));

				localStorage.removeItem(CookieKeys.UUId);
				localStorage.removeItem(CookieKeys.Subject);
				localStorage.removeItem(UserType.Employer);
				localStorage.removeItem(UserType.JobSeeker);
				localStorage.removeItem('js-avatar');

			}
		});

		this.emp$.pipe(
			filter(_ => _ && _.contentBody),
			map(_ => ({ ...<UsersModel>_.contentBody })),
		).subscribe({
			next: model => {
				this.cdr.markForCheck();
				this.userInfo = model;
			}
		});
	}

	ngAfterViewInit() {

		const events = [this.userLogin$, this.userSession$];

		// toggle logged in user nav links
		merge(...events).pipe(takeUntil(this.toDestroy$)).subscribe({
			next: res => [this.cdr.markForCheck(), this.isUserLoggedIn = res && res.contentBody],
			error: _ => [this.cdr.markForCheck(), this.isUserLoggedIn = false]
		});

		// simulate loader
		this.userLogin$.pipe(filter(_ => _?.contentBody), debounceTime(100)).subscribe({
			next: _ => [this.store.dispatch(new ActivateOverlayAction(true))]
		});
	}

	ngOnDestroy() {
		this.toDestroy$.next();
		this.toDestroy$.complete();
	}
}
