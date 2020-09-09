import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { debounceTime, delay, filter, switchMap, takeUntil } from 'rxjs/operators';
import { OpeningModel, ResponseModel } from '../../../../../models';
import { GetProfileStrengthAction } from '../../../../../store/app-store';
import { collectionInOut } from '../../../../../utils';
import { DeleteConfirmComponent } from '../../../components/shared/delete-confirm/delete-confirm.component';
import { SharedJobService } from '../../shared/shared-jobs.service';
import { VsJobListComponent } from './child/vs-job-list.component';

@Component({
	selector: 'm-dashboard',
	templateUrl: './dashboard.component.html',
	animations: [collectionInOut],
	styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {

	@ViewChild(MatExpansionPanel, { static: true }) panel: MatExpansionPanel;
	isExpanded: boolean = false;

	groupedFor: string;

	mockSkills = ['Networking', 'Web-designer', 'C#', 'DotNet-core', 'Content-Writer', 'Banking', 'Teaching', 'MS-SQL', 'Analysis', 'Key Accounts Management Jobs'];
	mockLocations = ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Dang', 'Hetauda', 'Dharan', 'Pokhara', 'Biratnagar', 'Dhading', 'Lamjung'];

	private toDestroy$ = new Subject<void>();

	matchingJobs: { items: OpeningModel[], total: number };
	favJobs: { items: any[], total: number };
	appliedJobs: { items: any[], total: number };

	dataSource = [];

	profile: any;
	estSpin: boolean;

	removedResponse: ResponseModel;

	profileStrength: { percentage: number, status: string };
	@Select('userLogin', 'profileStrength')
	readonly jsProfileStrength$: Observable<{ percentage: number, status: string }>;

	constructor(
		private cdr: ChangeDetectorRef,
		private jService: SharedJobService,
		private matBot: MatBottomSheet,
		private matSnack: MatSnackBar,
		private dialog: MatDialog,
		private store: Store
	) { }

	ngOnInit() {

		this.jService.getMatchingJobs().pipe(takeUntil(this.toDestroy$)).subscribe({
			next: res => [this.cdr.markForCheck(), this.matchingJobs = res.contentBody]
		});

		this.jService.getProfileStatus().pipe(takeUntil(this.toDestroy$)).subscribe({
			next: res => this.profile = res.contentBody
		});

		this.jService.getFavJobs().pipe(takeUntil(this.toDestroy$)).subscribe({
			next: res => this.favJobs = res.contentBody
		});

		this.jService.getAppliedJobs().pipe(takeUntil(this.toDestroy$)).subscribe({
			next: res => this.appliedJobs = res.contentBody
		});

	}

	ngAfterViewInit() {

		this.jsProfileStrength$.pipe(
			filter(_ => _ ? true : false),
			debounceTime(1000), takeUntil(this.toDestroy$)
		).subscribe({
			next: res => {
				this.cdr.markForCheck();
				this.profileStrength = res;
			}
		});

		setTimeout(_ => this.store.dispatch(new GetProfileStrengthAction()), 200);

	}

	onRemove(id: number) {

		const instance = this.dialog.open(DeleteConfirmComponent);

		instance.afterClosed().pipe(
			filter(yes => yes),
			switchMap(_ => this.jService.removeFavJob(id)),
			delay(600), takeUntil(this.toDestroy$),
		).subscribe({
			next: res => {
				this.cdr.markForCheck();
				this.removedResponse = res;
				const index = this.favJobs.items.findIndex(_ => _.openingId === id);
				if (index > -1 && this.favJobs && this.favJobs.items) {
					this.favJobs.items.splice(index, 1);
					this.favJobs.total--;
				}
			}
		});
	}

	clearMsg() {
		this.cdr.markForCheck();
		this.removedResponse = null;
	}

	updateEditable(profile: any, mt: MatMenuTrigger) {

		this.cdr.markForCheck();

		this.estSpin = true;

		this.jService.quickUpdate({ ...profile }).pipe(
			delay(1000), takeUntil(this.toDestroy$)
		).subscribe({
			next: res => {
				this.cdr.markForCheck();
				this.profile = { ...this.profile, ...profile };
				this.estSpin = false;
				this.matSnack.open(res.messageBody, 'Close', { duration: 10000 });
				mt.closeMenu();
			}
		});
	}

	onShowAll(actionOf: string) {
		this.matBot.open(VsJobListComponent, {
			autoFocus: false,
			restoreFocus: false,
			data: actionOf,
			panelClass: ['px-0', 'pt-0', 'pb-0', 'bg-transparent', 'shadow-none'],
		});
	}

	onGroupByClicked(value: string) {
		this.groupedFor = value;
	}

	createJobLink(job: OpeningModel) {
		const str = job.jobTitle.toLocaleLowerCase().replace(/[^\w\s]|\s+/g, '-').replace(/\-{2,}/g, '-');
		const url = `/job/${job.openingId}/${str}`;
		return url;
	}

	ngOnDestroy() {
		this.toDestroy$.next();
		this.toDestroy$.complete();
	}

}
