import {Component, OnInit, HostBinding, Input, ChangeDetectorRef, OnDestroy} from '@angular/core';
import {NotificationModel} from '../../../../../../core/interfaces/NotificationModel';
import {BaseUrlCreator} from '../../../../../../utils';
import {HttpClient} from '@angular/common/http';
import {CookieService} from '../../../../../../services/cookie.service';
import {CookieKeys, ResponseModel} from '../../../../../../models';
import {delay, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
	selector: 'm-timeline-item',
	templateUrl: './timeline-item.component.html',
	styleUrls: ['./timeline-item.component.scss']
})
export class TimelineItemComponent implements OnInit, OnDestroy {
	private readonly toDestroy$ = new Subject<void>();
	@Input() item: NotificationModel;

	@HostBinding('class') classes = 'm-list-timeline__item ';

	private delay = 0;

	constructor(private cdr: ChangeDetectorRef,
				private url: BaseUrlCreator,
				private http: HttpClient,
				private cookie: CookieService) {
	}

	ngOnInit() {
		if (this.item.isRead) {
			this.classes += ' m-list-timeline__item--read';
		}
	}

	ngOnDestroy(): void {
		this.toDestroy$.next();
		this.toDestroy$.complete();
	}

	badgeClass() {
		const badges: any = {
			urgent: 'm-badge--info',
			important: 'm-badge--warning',
			resolved: 'm-badge--success',
			pending: 'm-badge--danger'
		};

		switch (this.item.type) {
			case 'warn':
				return badges[1];
			case 'success':
				return badges[2];
			case 'info':
				return badges[0];
			case 'danger':
				return badges[3];
		}
	}

	textClass() {
		if (this.item.isRead) return '';

		return this.item.type === 'warn' ? 'm--font-warning' :
			this.item.type === 'success' ? 'm--font-success' :
				this.item.type === 'info' ? 'm--font-info' :
					this.item.type === 'danger' ? 'm--font-danger' :
						'';
	}

	marAsRead() {
		const subject = this.cookie.get(CookieKeys.Subject);

		if (!subject || this.item.id === '') return;

		const api = this.url.createUrl('Notification', subject);

		if (this.delay > 0 && this.item.isRead) return;

		this.delay = 1000;

		this.http.put<ResponseModel>(`${api}/Update`, <NotificationModel>{...this.item, isRead: true})
			.pipe(takeUntil(this.toDestroy$), delay(this.delay))
			.subscribe({next: _ => [this.cdr.markForCheck(), this.item.isRead = true, this.delay = 0]});
	}
}
