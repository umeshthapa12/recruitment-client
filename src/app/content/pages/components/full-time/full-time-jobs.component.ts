import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { debounceTime, delay, filter, takeUntil, tap } from 'rxjs/operators';
import { JobTypeRouteEnums, OpeningModel, QueryModel } from '../../../../models';
import { ContentRef } from '../../store/page-store/display-type.enum';
import { PageContentAction } from '../../store/page-store/page-actions';
import { ActionType, JobListActionBase } from '../shared/services/job-list-action-base.extension';
import { SharedJobService } from '../shared/services/shared-jobs.service';

@Component({
	selector: 'full-time-jobs',
	templateUrl: './full-time-jobs.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	styleUrls: ['../shared-styles.scss']
})
export class FullTimeJobsComponent extends JobListActionBase implements OnDestroy, AfterViewInit {

	private toDestroy$ = new Subject<void>();

	searchInputCtrl = new FormControl();

	jobLists: OpeningModel[] = [];

	isLoading = true;

	@ViewChild(MatPaginator, { static: true })
	paginator: MatPaginator;

	private query: QueryModel = { filters: [] };

	// callback event of list component's action
	onListActionChange = new EventEmitter<ActionType>();

	constructor(
		public jobService: SharedJobService,
		private cdr: ChangeDetectorRef,
		public store: Store,
	) {
		super(store, jobService);

		window.scrollTo({ top: 0, behavior: 'smooth' });
		const d = { content: 'Full-time Jobs', contentRef: ContentRef.List };
		this.store.dispatch(new PageContentAction(d));
	}

	updateSearchInput() {
		if ((this.searchInputCtrl.value || '').trim().length > 0)
			this.searchInputCtrl.updateValueAndValidity({ onlySelf: true });
	}

	ngAfterViewInit() {

		this.query.paginator = {
			pageIndex: this.paginator.pageIndex + 1,
			pageSize: this.paginator.pageSize
		};

		this.initList();
		this.onSearchInputChange();
		this.initEvents();

		// Reference type params
		this.onListAction(this.onListActionChange, this.jobLists);
	}

	private onSearchInputChange() {
		this.searchInputCtrl.valueChanges.pipe(
			filter(value => (value || '').trim().length > 0),
			tap(_ => [this.jobLists = [], this.isLoading = true]),
			debounceTime(800),
			takeUntil(this.toDestroy$)
		).subscribe({ next: this.initList });
	}

	ngOnDestroy() {
		this.toDestroy$.next();
		this.toDestroy$.complete();
	}

	private initList = () => {

		this.cdr.markForCheck();

		this.isLoading = true;
		this.jobLists = [];

		this.jobService.getJobLists(this.query, JobTypeRouteEnums.FT, this.searchInputCtrl.value, null).pipe(
			delay(800), takeUntil(this.toDestroy$)
		).subscribe({
			next: res => {
				this.cdr.markForCheck();
				this.isLoading = false;
				this.jobLists = res.contentBody && res.contentBody.items;
				this.paginator.length = (res.contentBody && res.contentBody.total || 0);
			},
			error: _ => [this.cdr.markForCheck(), this.isLoading = false]

		});
	}

	private initEvents() {

		this.paginator.page.pipe(
			debounceTime(100),
			takeUntil(this.toDestroy$)
		).subscribe({
			next: _ => {
				this.cdr.markForCheck();
				// scroll to top when paging event get fired.
				window.scrollTo({ top: 30 });
				this.query.paginator = { pageIndex: _.pageIndex + 1, pageSize: _.pageSize };
				this.initList();
			}
		});
	}
}
