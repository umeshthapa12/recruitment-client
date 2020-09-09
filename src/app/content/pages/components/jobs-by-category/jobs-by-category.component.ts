import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { debounceTime, delay, filter, takeUntil, tap } from 'rxjs/operators';
import { QueryModel } from '../../../../models';
import { collectionInOut } from '../../../../utils';
import { ActionType, JobListActionBase } from '../shared/services/job-list-action-base.extension';
import { SharedJobService } from '../shared/services/shared-jobs.service';

@Component({
	templateUrl: './jobs-by-category.component.html',
	styleUrls: ['../shared-styles.scss'],
	animations: [collectionInOut, ]
})
export class JobsByCategoryComponent extends JobListActionBase implements OnDestroy, AfterViewInit {

	private toDestroy$ = new Subject<void>();

	searchInputCtrl = new FormControl();

	jobLists = [];

	isLoading = true;
	clearAllInputs: boolean;
	showClearBtn = false;

	@ViewChild(MatPaginator, { static: true })
	paginator: MatPaginator;

	private query: QueryModel = { filters: [] };

	// callback event of list component's action
	onListActionChange = new EventEmitter<ActionType>();

	constructor(
		private router: Router,
		public jobService: SharedJobService,
		private cdr: ChangeDetectorRef,
		private route: ActivatedRoute,
		public store: Store
	) {
		super(store, jobService);

		this.prepFilterByCatId();
	}
	private prepFilterByCatId = () => {

		const catId = this.route.snapshot.params['categoryId'];
		const index = this.query.filters.findIndex(_ => _.column === 'jobCategoryId');

		if (index > -1)
			this.query.filters[index].firstValue = catId;
		else
			this.query.filters.push(
				{
					column: 'jobCategoryId',
					firstValue: catId,
					condition: 'eq'
				}
			);
	}


	updateSearchInput() {
		if ((this.searchInputCtrl.value || '').trim().length > 0)
			this.searchInputCtrl.updateValueAndValidity({ onlySelf: true });
	}

	ngAfterViewInit() {
		this.router.events.pipe(
			filter(e => e instanceof NavigationEnd),
			takeUntil(this.toDestroy$),
		).subscribe({ next: _ => [this.prepFilterByCatId(), this.initList()] });

		this.query.paginator = {
			pageIndex: this.paginator.pageIndex + 1,
			pageSize: this.paginator.pageSize
		};

		this.initList();
		this.onSearchInputChange();
		this.initEvents();
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

		this.jobService.getJobLists(this.query, null, this.searchInputCtrl.value, null).pipe(
			delay(800), takeUntil(this.toDestroy$)
		).subscribe({
			next: res => {
				this.cdr.markForCheck();

				this.jobLists = res.contentBody && res.contentBody.items;
				this.paginator.length = (res.contentBody && res.contentBody.total || 0);
				this.isLoading = false;
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
				this.query.paginator = { pageIndex: this.paginator.pageIndex + 1, pageSize: this.paginator.pageSize };
				this.initList();
			}
		});
	}
}
