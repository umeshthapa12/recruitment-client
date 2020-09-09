import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { interval, Observable, of, Subject, timer } from 'rxjs';
import { catchError, debounceTime, delay, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { DropdownModel, FileUrlsModel, OpeningModel, OpeningTitles, ResponseModel, UsersModel } from '../../../../models';
import { collectionInOut } from '../../../../utils';
import { copyToClipboard } from '../../../../utils/generators/custom-utility';
import { ProblemFormComponent } from '../../../pages/components/shared/problem-reporter/form.component';
import { DropdownProviderService } from '../../../pages/components/shared/services/dropdown-provider.service';
import { SharedJobService } from '../../../pages/components/shared/services/shared-jobs.service';
import { ApplyForJobAction, RightAsideApplyCardClickedCallbackAction, ScrollIntoApplySectionAction, UpdateFavJobIdsAction } from '../../../pages/store/page-store/page-actions';
import { ApplyClickedOptions, JobActions } from '../../../pages/store/page-store/page-model';
import { RightAsideApplyCardButtonState, RightAsideApplyCardState, RightAsideApplySimilarOpeningsState } from '../../../pages/store/page-store/page-state';
interface CategoryDto { counts: number; category: DropdownModel; }

@Component({
	selector: 'm-aside-right',
	templateUrl: './aside-right.component.html',
	animations: [collectionInOut],
	styleUrls: ['./aside-right.component.scss']
})
export class AsideRightComponent implements OnInit, AfterViewInit, OnDestroy {

	private toDestroy$ = new Subject<void>();

	@HostBinding('class') classes = 'm-grid__item m-aside-right px-3 pt-0 pb-0 border-0 right-aside-box-shadow';

	// slice of a page state
	@Select(RightAsideApplyCardState) applyCardConfig$: Observable<{ config: ApplyClickedOptions }>;
	@Select(RightAsideApplySimilarOpeningsState) similarTitle$: Observable<{ similar: OpeningTitles }>;
	@Select(RightAsideApplyCardButtonState) btnSlice$: Observable<RightAsideApplyCardClickedCallbackAction>;

	jobCategories: CategoryDto[] = [];

	minimalCategories = [];
	state: string = 'more';
	isCatLoading: boolean;

	jobMightLiked: OpeningTitles[] = [];

	isRenderApplyCard: boolean;
	isLoadingApplyCard: boolean;
	isSpining: boolean;
	activatedBtn: string;

	jsFavIds: number[] = [];
	@Select('listingJobs', 'favJobIds')
	jsFavJobId$: Observable<number[]>;

	appliedIds: number[] = [];
	@Select('listingJobs', 'appliedJobIds')
	readonly appliedJobId$: Observable<number[]>;

	private currentTitle: OpeningTitles;

	currentId: number = +this.route.firstChild.snapshot.params['jobId'];

	private delay: number;

	// active user info
	userInfo: UsersModel = {};
	profileStrength: { percentage: number, status: string };
	@Select('userLogin', 'profileStrength')
	readonly jsProfileStrength$: Observable<{ percentage: number, status: string }>;
	// name of the slice -> state.action
	@Select('userLogin', 'userSession')
	// returned model
	userSession$: Observable<ResponseModel>;

	// getter prop, since we need to update change state in realtime, Angular automatically checks for the getter prop
	get avatar() {
		const a = (localStorage.getItem('js-avatar') || this.userInfo.avatar && (<FileUrlsModel>this.userInfo.avatar).getUrl || 'https://api.adorable.io/avatars/face/eyes7/nose10/mouth9/7e7acc/100');
		return a;
	}

	isAvatarContentLoaded = false;
	isClientContentLoaded = false;
	avatarUrl = 'https://api.adorable.io/avatars/face/eyes7/nose10/mouth9/7e7acc/150';
	private readonly interval = 1000 * 60;

	constructor(
		private dropdown: DropdownProviderService,
		private cdr: ChangeDetectorRef,
		private jobService: SharedJobService,
		private store: Store,
		private route: ActivatedRoute,
		private router: Router,
		private dialog: MatDialog,
		private snack: MatSnackBar) {

		this.jsFavJobId$.pipe(takeUntil(this.toDestroy$))
			.subscribe({ next: ids => [this.jsFavIds = ids ? [...ids] : []] });

		// update opening ID from the param when routing.
		this.router.events.pipe(debounceTime(100), takeUntil(this.toDestroy$))
			.subscribe({
				next: _ => {
					this.cdr.markForCheck();
					const id = +this.route.firstChild.snapshot.params['jobId'];
					if (!Number.isNaN(id))
						this.currentId = id;
				}
			});

		// just for simulation.
		timer(800).pipe(
			tap(_ => [this.cdr.markForCheck(), this.isAvatarContentLoaded = true]),
			delay(1000),
			takeUntil(this.toDestroy$)
		).subscribe(_ => [this.cdr.markForCheck(), this.isClientContentLoaded = true]);
	}

	ngOnInit() {
		this.userSession$.pipe(
			filter(_ => _ && _.contentBody),
			map(_ => <UsersModel>_.contentBody),
			takeUntil(this.toDestroy$),
		).subscribe(model => {
			this.cdr.markForCheck();
			this.userInfo = model;
		});

		this.jsProfileStrength$.pipe(
			delay(1000), filter(_ => _ && _.percentage >= 0),
			takeUntil(this.toDestroy$)).subscribe({
				next: res => {
					this.cdr.markForCheck();
					this.profileStrength = res;
				}
			});

		this.applyCardConfig$.pipe(
			tap(s => this.resetStates(s ? s.config : null)),
			debounceTime(1000),
			filter(_ => _ && _.config.render),
			takeUntil(this.toDestroy$),
		).subscribe(_ => [this.cdr.markForCheck(), this.resetStates(_.config)]);

		// clear any states that reflected to the apply btns
		this.btnSlice$.pipe(
			debounceTime(200),
			filter(_ => !!(_ && _.callback)),
			map(_ => _.callback),
			takeUntil(this.toDestroy$),
		).subscribe({ next: _ => [this.cdr.markForCheck(), this.isSpining = false] });
	}

	ngAfterViewInit() {
		this.cdr.markForCheck();
		this.isCatLoading = true;
		this.dropdown.getActiveCategories().pipe(
			delay(1000),
			takeUntil(this.toDestroy$),
		).subscribe({
			next: j => {
				this.cdr.markForCheck();
				this.jobCategories = j;
				this.minimalCategories = j.slice(0, 6);
				this.isCatLoading = false;
			},
			error: _ => {
				this.cdr.markForCheck();
				this.isCatLoading = false;
			}
		});

		this.similarTitle$.pipe(
			debounceTime(800),
			filter(_ => _ && _.similar != null),
			tap(_ => this.currentTitle = _.similar),
			switchMap(_ => this.jobService.getSimilarOpeningsTitleOnly(_.similar.jobTitle).pipe(takeUntil(this.toDestroy$))),
			takeUntil(this.toDestroy$),
		).subscribe({

			next: _ => {
				const d: OpeningTitles[] = _.contentBody;
				// remove self (currently selected job)
				d.splice(d.findIndex(y => y.id === this.currentTitle.id), 1);

				this.jobMightLiked = d;
			}
		});

		this.appliedJobId$.pipe(
			debounceTime(300),
			takeUntil(this.toDestroy$)
		).subscribe({ next: res => [this.appliedIds = res] });

		interval(this.interval).pipe(takeUntil(this.toDestroy$)).subscribe({
			next: _ => {
				this.cdr.markForCheck();
				const x = Math.floor(Math.random() * (11 - 1) + 1);
				const y = Math.floor(Math.random() * (11 - 1) + 1);
				const z = Math.floor(Math.random() * (11 - 1) + 1);
				this.avatarUrl = `https://api.adorable.io/avatars/face/eyes${x}/nose${y}/mouth${z}/7e7acc/150`;
			}
		});

	}

	appliedDisabled = () => this.appliedIds.includes(this.currentId);

	ngOnDestroy() {

		this.toDestroy$.next();
		this.toDestroy$.complete();
	}

	seeMoreJobs() {
		if (this.state === 'more') {
			this.minimalCategories = this.jobCategories.slice();
			this.state = 'less';
		} else {
			this.minimalCategories = this.jobCategories.slice(0, 6);
			this.state = 'more';
		}
	}

	createJobLink(job: OpeningModel) {
		const str = job.jobTitle.toString().toLocaleLowerCase().replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '-').replace(/\-{2,}/g, '-');
		const url = `/job/${job.id}/${str}`;
		return url;
	}

	createCategoryLink(id: number, category: string) {
		const str = category
			.toLocaleLowerCase()
			.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '-')
			.replace(/\-{2,}/g, '-');

		return `/job-category/${id}/${str}`;

	}

	scrollIntoToApplySection() {

		this.store.dispatch(new ScrollIntoApplySectionAction(true));
	}

	onActionButtonsClick(action: string) {
		this.activatedBtn = action;
		const config: ApplyClickedOptions = { actionClicked: true };

		switch (action) {

			case 'apply':
				// start spinner
				this.isSpining = true;
				config.selectedAction = JobActions.ApplyNow;

				this.store.dispatch(new ApplyForJobAction(config));
				break;

			case 'save':
			case 'unsave':
				if (this.delay > 0) return;

				this.delay = 1000;
				const x2 = this.jsFavIds.findIndex(i => i === this.currentId);
				this.jobService.updateFav(this.currentId, x2 <= -1)
					.pipe(delay(this.delay),
						catchError(e => of(e)),
						filter(res => !(res instanceof HttpErrorResponse)),
						takeUntil(this.toDestroy$)
					).subscribe({
						next: _ => [this.delay = 0, this.store.dispatch(new UpdateFavJobIdsAction(this.currentId))]
					});
				break;

			case 'share-via-email':
				config.selectedAction = JobActions.ShareViaEmail;
				this.store.dispatch(new ApplyForJobAction(config));
				break;

			case 'share-via-facebook':
			case 'share-via-twitter':
				copyToClipboard((window.location.href || document.location.href));
				this.snack.open('Link copied to clipboard.', 'Close', { panelClass: ['bg-info'], duration: 10000 });
				return;

			case 'report-problem':
				this.dialog.open(ProblemFormComponent, {
					disableClose: true,

				});
				break;
			case 'download-pdf':
				config.selectedAction = JobActions.DownloadPdf;
				this.store.dispatch(new ApplyForJobAction(config));
				break;
		}
	}

	hasValue(prev: number[], currentId: number) {
		return prev && prev.indexOf(currentId) > -1;
	}

	containsPath = (path: string) => this.router.url.search(path) > -1;

	private resetStates(_: ApplyClickedOptions) {
		this.cdr.markForCheck();
		this.isRenderApplyCard = _ && _.render;
		this.isLoadingApplyCard = _ && _.displayLoading;
	}
}
