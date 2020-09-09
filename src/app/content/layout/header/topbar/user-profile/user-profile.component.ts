import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { delay, filter, takeUntil, tap } from 'rxjs/operators';
import { environment } from '../../../../../../environments/environment';
import { FileUrlsModel, PicTypes } from '../../../../../models';
import { CookieKeys, ResponseModel, UsersModel, UserType } from '../../../../../models/app.model';
import { CookieService } from '../../../../../services/cookie.service';
import { LogoutAction, ActivateOverlayAction } from '../../../../../store/app-store';

@Component({
	selector: 'm-user-profile',
	templateUrl: './user-profile.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	styles: [`
		.custom-bg{
			background: #36a3f7;background: -webkit-linear-gradient(to right, #36a3f7, #00c5dc);background: linear-gradient(to right, #36a3f7, #00c5dc);
		}
	`]
})
export class UserProfileComponent implements AfterViewInit, OnDestroy {
	@HostBinding('class')
	classes = 'm-nav__item m-topbar__user-profile m-topbar__user-profile--img m-dropdown m-dropdown--medium m-dropdown--arrow m-dropdown--header-bg-fill m-dropdown--align-right m-dropdown--mobile-full-width m-dropdown--skin-light';

	@HostBinding('attr.m-dropdown-toggle') attrDropdownToggle = 'click';

	private toDestroy$ = new Subject<void>();

	// j_sub is equivalent to jobharu_subject
	private userType = this.cookieService.get(CookieKeys.Subject);

	// base path segment for link.
	userHrefBase: string = this.userType;

	isEmployer = this.userType === UserType.Employer;

	// active user info
	userInfo: UsersModel = {};

	// getter prop, since we need to update change state in realtime, Angular automatically checks for the getter prop
	get avatar() {

		if (!this.userInfo) return;

		// when user clicks to the make profile picture button from the profile component, we update local storage value.
		if (this.userInfo.avatar instanceof Array) {
			const p = this.userInfo.avatar.find(_ => (_.type || '').toLocaleLowerCase() === PicTypes.avatar.toLocaleLowerCase());
			return p && environment.baseUrl + '/' + p.getUrl;
		}

		const a = this.userInfo.avatar && (<FileUrlsModel>this.userInfo.avatar).getUrl ||
			'https://api.adorable.io/avatars/face/eyes7/nose10/mouth9/7e7acc/100';

		return a;
	}

	// name of the slice -> state.action
	@Select('userLogin', 'userSession')
	// returned model
	userSession$: Observable<ResponseModel>;

	constructor(
		private store: Store,
		private cookieService: CookieService,
		private cdr: ChangeDetectorRef,
	) {

	}

	ngAfterViewInit() {

		this.userSession$.pipe(
			filter(_ => _ && _.contentBody),
			tap(model => this.userInfo = model.contentBody),
			takeUntil(this.toDestroy$)
		).subscribe({ next: _ => this.cdr.detectChanges() });


	}

	ngOnDestroy() {
		this.toDestroy$.next();
		this.toDestroy$.complete();
	}

	logout() {

		this.store.dispatch(new LogoutAction({ contentBody: { userType: this.userType, user: null } }));
	}
}
