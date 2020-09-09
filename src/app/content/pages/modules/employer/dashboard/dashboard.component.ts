import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { BehaviorSubject, fromEvent, Subject, timer } from 'rxjs';
import { debounceTime, delay, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { DashboardService } from './services/dashboard.service';
interface Opening { items: any[]; totalItems: number; }

@Component({
	selector: 'm-dashboard',
	templateUrl: './dashboard.component.html',
	animations: [],
	changeDetection: ChangeDetectionStrategy.OnPush,
	styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

	private toDestroy$ = new Subject<void>();

	@ViewChild('actPnl', { static: true }) activeJobPanel: MatExpansionPanel;

	config: any;

	get isSmallScreen() { return new BehaviorSubject<boolean>(window.outerWidth <= 1024); }

	groupedFor: string;

	mockSkills = ['Networking', 'Web-designer', 'C#', 'DotNet-core', 'Content-Writer', 'Banking', 'Teaching', 'MS-SQL', 'Analysis', 'Key Accounts Management Jobs'];
	mockLocations = ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Dang', 'Hetauda', 'Dharan', 'Pokhara', 'Biratnagar', 'Dhading', 'Lamjung'];

	activeJobViewMode = 'grid';

	activeJobs: Opening;
	draftJobs: Opening;
	expiredJobs: Opening;
	pendingJobs: Opening;

	// dev only
	allMockJobs: any;

	isProfileIncomplete = false;

	// loading states
	isProfileLoading = false;
	isActiveJobLoading = true;

	constructor(
		private cdr: ChangeDetectorRef,
		private dashService: DashboardService
	) {
		// this should be removed after API call has been done;
		timer(0).pipe(
			tap(_ => [this.isProfileLoading = true]),
			delay(1000),
			takeUntil(this.toDestroy$)
		).subscribe(_ => [this.cdr.markForCheck(), this.isProfileIncomplete = true, this.isProfileLoading = false]);
	}

	ngOnInit() {

		fromEvent(window, 'resize')
			.pipe(
				debounceTime(400),
				map(_ => window.outerWidth <= 1024)
			).subscribe(small => this.isSmallScreen.next(small));
	}

	ngAfterViewInit() {

		setTimeout(() => {
			this.cdr.markForCheck();
			this.activeJobPanel.open();
		}, 1000);

		this.dashService.getJobs('active').pipe(
			tap(res => [this.cdr.markForCheck(), this.activeJobs = res.contentBody, this.isActiveJobLoading = false]),
			switchMap(_ => this.dashService.getJobs('archived')),
			tap(res => [this.cdr.markForCheck(), this.expiredJobs = res.contentBody]),
			switchMap(_ => this.dashService.getJobs('scheduled')),
			tap(res => [this.cdr.markForCheck(), this.pendingJobs = res.contentBody]),
			switchMap(_ => this.dashService.getJobs('drafted')),
		).subscribe(res => [this.cdr.markForCheck(), this.draftJobs = res.contentBody]);
	}

	ngOnDestroy() {
		this.toDestroy$.next();
		this.toDestroy$.complete();
	}

	onGroupByClicked(value: string) {
		this.cdr.markForCheck();
		this.groupedFor = value;
	}

	toggleView(modeFor: string) {
		this.cdr.markForCheck();
		switch (modeFor) {
			case 'active-job':
				this.activeJobViewMode = this.activeJobViewMode === 'list' ? 'grid' : 'list';
				break;
		}

	}
}
