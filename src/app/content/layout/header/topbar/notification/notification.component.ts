import {HttpClient, HttpParams} from '@angular/common/http';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, OnInit} from '@angular/core';
import {interval} from 'rxjs';
import {delay, filter, switchMap} from 'rxjs/operators';
import {CookieKeys, ResponseModel} from '../../../../../models';
import {CookieService} from '../../../../../services/cookie.service';
import {BaseUrlCreator, collectionInOut} from '../../../../../utils';
import {NotificationModel} from '../../../../../core/interfaces/NotificationModel';

@Component({
	selector: 'm-notification',
	templateUrl: './notification.component.html',
	styleUrls: ['./notification.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	animations: [collectionInOut]
})
export class NotificationComponent implements OnInit {
	@HostBinding('class')
	classes = 'm-nav__item m-topbar__notifications m-topbar__notifications--img m-dropdown m-dropdown--large m-dropdown--header-bg-fill m-dropdown--arrow m-dropdown--align-center 	m-dropdown--mobile-full-width';

	@HostBinding('attr.m-dropdown-toggle') attrDropdownToggle = 'click';
	@HostBinding('attr.m-dropdown-persistent') adp = 'true';

	@Input() animateShake: any;
	@Input() animateBlink: any;

	notify: NotificationModel[];

	private readonly subject = this.cookie.get(CookieKeys.Subject);

	private readonly api = this.url.createUrl('Notification', this.subject);

	constructor(
		private cdr: ChangeDetectorRef,
		private url: BaseUrlCreator,
		private http: HttpClient,
		private cookie: CookieService
	) {

		// animate icon shake and dot blink
		setInterval(() => {
			this.cdr.markForCheck();
			if (!this.newCounts()) return;

			this.animateShake = 'm-animate-shake';
			this.animateBlink = 'm-animate-blink';
		}, 3000);
		setInterval(() => [this.cdr.markForCheck(), (this.animateShake = this.animateBlink = '')], 6000);
	}

	ngOnInit() {

		interval(10000).pipe(
			filter(_ => !!this.subject),
			switchMap(_ => this.http.get<ResponseModel>(`${this.api}/Get`))
		).subscribe({
			next: res => [this.cdr.markForCheck(), this.notify = (res && res.contentBody)]
		});
	}

	newCounts() {
		this.cdr.markForCheck();
		return this.notify ? this.notify.filter(_ => !_.isRead).length : 0;
	}

	deleteAll() {

		if (!this.subject && this.notify.length <= 0) return;

		let p = new HttpParams();
		this.notify.forEach(n => p = p.append('ids', n.id));

		this.http.delete<ResponseModel>(`${this.api}/Delete`, {params: p}).pipe(delay(800))
			.subscribe({next: res => [this.cdr.markForCheck(), this.notify = []]});
	}
}
