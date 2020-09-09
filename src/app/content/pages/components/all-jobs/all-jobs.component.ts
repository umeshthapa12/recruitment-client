import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { debounceTime, delay, filter, takeUntil, tap } from 'rxjs/operators';
import { AdvFilterModel, JobTypeRouteEnums, OpeningModel, QueryModel } from '../../../../models';
import { fadeInX } from '../../../../utils';
import { JobListActionBase, ActionType } from '../shared/services/job-list-action-base.extension';
import { SharedJobService } from '../shared/services/shared-jobs.service';
import { MatExpansionPanel } from '@angular/material/expansion';

@Component({
	selector: 'all-jobs',
	templateUrl: './all-jobs.component.html',
	styleUrls: ['../shared-styles.scss'],
	animations: [fadeInX]
})
export class AllJobsComponent extends JobListActionBase implements OnDestroy, AfterViewInit {

	private readonly toDestroy$ = new Subject<void>();

	searchInputCtrl = new FormControl();

	jobLists: OpeningModel[] = [];

	isLoading = true;
	clearAllInputs = new EventEmitter<boolean>();
	showClearBtn = false;

	@ViewChild(MatPaginator, { static: true })
	paginator: MatPaginator;

	private query: QueryModel = { filters: [] };
	private adv: AdvFilterModel = {};

	// callback event of list component's action
	onListActionChange = new EventEmitter<ActionType>();

	@ViewChild(MatExpansionPanel) pnl: MatExpansionPanel;

	constructor(
		public jService: SharedJobService,
		private cdr: ChangeDetectorRef,
		public store: Store
	) {
		super(store, jService);
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

	resetAdvanceInputs() {
		this.clearAllInputs.emit(true);
	}

	onPnlExpandChange(expanded: boolean) {
		this.cdr.markForCheck();
		this.searchInputCtrl.reset(null, { emitEvent: false });
		expanded ? this.searchInputCtrl.disable({ emitEvent: false }) : this.searchInputCtrl.enable({ emitEvent: false });
	}

	toggleAdvanceSearchPanel() {

		this.pnl.toggle();

		if (this.pnl.expanded)
			this.cdr.detectChanges();
	}

	// this event get fired when the child input gets changed
	reloadFilteredJobs(formData: AdvFilterModel) {
		this.cdr.markForCheck();

		this.query.paginator.pageIndex = 1;
		this.paginator.length = 0;
		this.paginator.pageIndex = 0;


		this.adv = formData;
		this.updateActionBtn();
		this.initList();

	}

	private updateActionBtn() {
		const hasLen = Object.values(this.adv).filter(v => v && v.length > 0).length > 0;
		this.cdr.markForCheck();
		if (hasLen) {
			this.showClearBtn = true;
		} else {
			this.showClearBtn = false;

		}
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

		const hasLen = Object.values(this.adv).filter(v => v && v.length > 0).length > 0;

		this.jService.getJobLists(this.query,
			JobTypeRouteEnums.AJ,
			hasLen ? null : this.searchInputCtrl.value,
			hasLen ? this.adv : null
		).pipe(delay(800), takeUntil(this.toDestroy$)).subscribe({
			next: res => {
				this.cdr.markForCheck();
				this.isLoading = false;
				this.jobLists = res.contentBody && res.contentBody.items;
				this.paginator.length = (res.contentBody && res.contentBody.total || 0);
				// this.jobLists.forEach(_ => _.likeCounts = 0)
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
