import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Inject, Input, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import * as objectPath from 'object-path';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { ClassInitService } from '../../../../core/services/class-init.service';
import { LayoutConfigService } from '../../../../core/services/layout-config.service';
import { ResponseModel, UsersModel, PicTypes } from '../../../../models';

@Component({
	selector: 'm-brand',
	templateUrl: './brand.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrandComponent implements OnInit {
	@HostBinding('class') classes = 'm-stack__item m-brand';
	@Input() menuAsideLeftSkin: any = '';
	@Input() menuAsideMinimizeDefault: any = false;
	@Input() menuAsideMinimizToggle: any = false;
	@Input() menuAsideDisplay: any = false;
	@Input() menuHeaderDisplay: any = true;
	@Input() headerLogo: any = '';

	@Select('userLogin', 'employerInfo')
	readonly userSession$: Observable<ResponseModel>;
	userInfo: UsersModel;

	get brandPic() {

		if (!this.userInfo) return;

		// when user clicks to the make profile picture button from the profile component, we update local storage value.
		if (this.userInfo.avatar instanceof Array) {
			const p = this.userInfo.avatar.find(_ => (_.type || '').toLocaleLowerCase() === PicTypes.brand.toLocaleLowerCase());
			return p && environment.baseUrl + '/' + p.getUrl;
		}

		return this.userInfo.avatar;
	}

	constructor(
		private cdr: ChangeDetectorRef,
		private classInitService: ClassInitService,
		private layoutConfigService: LayoutConfigService,
		@Inject(DOCUMENT) private document: Document
	) {
		// subscribe to class update event
		this.classInitService.onClassesUpdated$.subscribe(classes => {
			this.classes = 'm-stack__item m-brand ' + classes.brand.join(' ');
		});

		this.layoutConfigService.onLayoutConfigUpdated$.subscribe(model => {
			this.menuAsideLeftSkin = objectPath.get(model, 'config.aside.left.skin');

			this.menuAsideMinimizeDefault = objectPath.get(model, 'config.aside.left.minimize.default');

			this.menuAsideMinimizToggle = objectPath.get(model, 'config.aside.left.minimize.toggle');

			this.menuAsideDisplay = objectPath.get(model, 'config.menu.aside.display');

			this.menuHeaderDisplay = objectPath.get(model, 'config.menu.header.display');

			const headerLogo = objectPath.get(model, 'config.header.self.logo');
			if (typeof headerLogo === 'object') {
				this.headerLogo = objectPath.get(headerLogo, this.menuAsideLeftSkin);
			} else {
				this.headerLogo = headerLogo;
			}
		});
	}

	ngOnInit() {
		this.userSession$.pipe(
			filter(_ => _ && _.contentBody),
			map(_ => ({ ...<UsersModel>_.contentBody })),
		).subscribe({
			next: model => {
				this.cdr.markForCheck();
				this.userInfo = model;
			}
		});
	}


	/**
	 * Toggle class topbar show/hide
	 * @param event
	 */
	clickTopbarToggle(event: Event): void {
		this.document.body.classList.toggle('m-topbar--on');
	}
}
