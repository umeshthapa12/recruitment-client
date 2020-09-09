import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PublicNavDirectionTypes, PublicNavModel } from '../../../models';
import { fadeInX } from '../../../utils';

@Component({
	selector: 'page-cover-desktop',
	templateUrl: './page-cover-desktop.component.html',
	styleUrls: ['./page-cover.component.scss'],
	animations: [fadeInX]
})
export class PageCoverDesktopComponent implements OnDestroy, AfterViewInit {

	private readonly toDestroy$ = new Subject<void>();

	isCoverPage: boolean;
	@Select('pageCoverNavBar', 'navData')
	readonly nav$: Observable<PublicNavModel[]>;

	constructor(private router: Router) { }

	mappedNavForCoverPage = (nav: PublicNavModel[] = []) => {
		const d = nav.find(_ => +_.direction === PublicNavDirectionTypes.OverCoverImageHorizontal);
		if (!d) return [];

		return d.items;
	}
	ngAfterViewInit() {
		this.router.events.pipe(takeUntil(this.toDestroy$))
			.subscribe({ next: _ => this.isCoverPage = this.router.url === '/' });
		setTimeout(_ => this.isCoverPage = this.router.url === '/', 400);
	}
	ngOnDestroy() {
		this.toDestroy$.next();
		this.toDestroy$.complete();
	}
}
