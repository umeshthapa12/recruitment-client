import { SelectionModel } from '@angular/cdk/collections';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Select } from '@ngxs/store';
import moment from 'moment';
import { merge, Observable, of, Subject } from 'rxjs';
import { AjaxResponse } from 'rxjs/ajax';
import { debounceTime, delay, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Filter, OpeningModel, QueryModel, ResponseModel } from '../../../../../../../models';
import { ApplicantModel } from '../../../../../../../models/appointment.model';
import { JobSeekerMessage } from '../../../../../../../models/job-seeker-message.model';
import { collectionInOut, ExtendedMatDialog, fadeIn, fadeInX } from '../../../../../../../utils';
import { ChangesConfirmComponent } from '../../../../../components/shared/changes-confirm/changes-confirm.component';
import { SnackToastService } from '../../../../../components/shared/snakbar-toast/toast.service';
import { AppointmentService } from '../../../../shared/appointment.service';
import { MessageFormComponent } from '../../../../shared/messaging/message-form.component';
import { AppointmentState, AppointmentStateModel } from './store/appointments.store';


interface FilterFormType {
    fullName: string;
    appliedStart: Date;
    appliedEnd: Date;
    appointmentStart: Date;
    appointmentEnd: Date;
    isEligible: boolean;
}

@Component({
    templateUrl: './applicants.component.html',
    styleUrls: ['../../../../shared/shared.scss'],
    animations: [fadeIn, fadeInX, collectionInOut]
})
export class ApplicantsComponent implements OnInit, AfterViewInit, OnDestroy {

    private readonly toDestroy$ = new Subject<void>();

    selection = new SelectionModel<ApplicantModel>(true, []);
    dataSource: MatTableDataSource<ApplicantModel> = new MatTableDataSource(null);
    query: QueryModel = { filters: [], sort: [] };
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    isLoadingResults = false;
    isFileDownloading: boolean;

    displayedColumns = [
        'select',
        'fullName',
        'appliedOn',
        'appointmentDate',
        'timer',
        'isEligible',
        'action'
    ];

    isSelectionEmpty: boolean;

    @ViewChild(CdkDrag, { static: true })
    private readonly drag: CdkDrag;

    @Select(AppointmentState) update$: Observable<AppointmentStateModel>;

    filterForm: FormGroup;

    constructor(
        private cdr: ChangeDetectorRef,
        private route: ActivatedRoute,
        private router: Router,
        private aService: AppointmentService,
        private exDialog: ExtendedMatDialog,
        private dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA)
        public data: OpeningModel,
        public dialogRef: MatDialogRef<ApplicantsComponent>,
        private notify: SnackToastService,
        private fb: FormBuilder
    ) { }

    ngOnInit() {

        this.filterForm = this.fb.group({
            fullName: null,
            appliedStart: null,
            appliedEnd: null,
            appointmentStart: null,
            appointmentEnd: null,
            isEligible: null
        });

    }

    ngAfterViewInit() {

        // init default
        this.query.paginator = {
            pageIndex: this.paginator.pageIndex + 1,
            pageSize: this.paginator.pageSize
        };

        setTimeout(_ => this.initData(), 0);

        // executes when table sort/paginator change happens.
        this.initEvents();

        this.exDialog.makeTransparentWhenDragMove(this.drag);

        this.update$.pipe(
            debounceTime(100), takeUntil(this.toDestroy$),
            filter(_ => _.applicant ? true : false)
        ).subscribe({ next: _ => this.initData() });
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    onAction(action: string) {

        this.isSelectionEmpty = this.selection.isEmpty();
        if (this.selection.isEmpty()) {
            return;
        }

        const mapped = this.selection.selected.map(a => <JobSeekerMessage>{
            applicationId: a.applicationId, jobSeekerGuid: a.jobSeekerGuid
        });
        const config = {
            width: '850px',
            maxHeight: '98vh',
            data: mapped,
            autoFocus: false,

        };

        switch (action) {
            case 'stop-timer':
                this.cancelAppointmentTimer();
                break;
            case 'excel':
            case 'pdf':
                this.dialogRef.disableClose = true;
                this.exportTo(action);
                break;
            case 'send':
                const mInstance = this.dialog.open(MessageFormComponent, config);
                mInstance.afterClosed().pipe(
                    takeUntil(this.toDestroy$), filter(res => res), map(_ => <ResponseModel>_)
                ).subscribe({ next: res => this.notify.when('success', res) });
                break;
        }
    }

    private isValidTimer = (timer: Date) => timer && moment(timer).toDate() >= new Date();

    hasAppointments = () => this.selection.selected.some(_ => _.appointmentDate);

    isValidScheduled = () => this.selection.selected.some(_ => _.timer && this.isValidTimer(_.timer));

    hasScheduled = (item: ApplicantModel) => this.isValidTimer(item.timer);

    isMessageExist = () => this.selection.selected.some(_ => _.messageExist);

    unattendedExist = () => this.dataSource.data && this.dataSource.data.some(_ => !_.isAttended);

    selectedAttendees = () => this.selection.selected.some(_ => !_.isAttended);

    resendMessage(el: ApplicantModel) {

        const instance = this.dialog.open(ChangesConfirmComponent, {
            autoFocus: false,
            width: '200px',
            data: { message: 'Are you sure!' }
        });

        // we do not want send last message to the applicants who are attended for the appointment
        const mapped = this.selection.selected.filter(_ => !_.isAttended).map(_ => {
            return <ApplicantModel>{ messageId: _.messageId, jobSeekerGuid: _.jobSeekerGuid };
        });

        const body = mapped.length > 0 ? mapped : [{ messageId: el.messageId, jobSeekerGuid: el.jobSeekerGuid }];

        instance.afterClosed().pipe(
            filter(yes => yes),
            switchMap(_ => this.aService.sendMessageNow(body))
        ).subscribe({ next: res => this.notify.when('success', res) });
    }

    private cancelAppointmentTimer() {
        const mapped = !this.selection.isEmpty() ? this.selection.selected.map(_ => _.openingId) : null;
        if (mapped === null) return;

        const instance = this.dialog.open(ChangesConfirmComponent, {
            autoFocus: false,
            data: { message: 'Timer of auto send appointment message will be removed if it isn\'t sent already.<br><br> Are you sure you want to cancel timer?' }
        });

        instance.afterClosed().pipe(
            filter(yes => yes),
            switchMap(_ => this.aService.cancelScheduledTimer(mapped))
        ).subscribe({
            next: res => [this.notify.when('success', res), this.initData(true)]
        });
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {

        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.data.length;

        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
        this.isAllSelected() ?
            this.selection.clear() :
            this.dataSource.data.forEach(row => this.selection.select(row));
    }

    initData(isClearFilter?: boolean) {
        if (isClearFilter) this.resetFilters();

        this.cdr.markForCheck();
        this.dataSource.data = [];
        this.isLoadingResults = true;
        this.selection.clear();

        setTimeout(_ => this.router.navigate(
            ['./employer/j/appointment'], { relativeTo: this.route, queryParams: {} }
        ), 10);

        this.aService.getApplicantStatus(this.data.id, this.query)
            .pipe(takeUntil(this.toDestroy$), delay(600)).subscribe({
                next: res => {
                    this.cdr.markForCheck();
                    const data: ApplicantModel[] = (res.contentBody.items || []);
                    this.dataSource.data = data;
                    this.paginator.length = (res.contentBody.totalItems || 0);
                    this.isLoadingResults = false;
                },
                error: _ => [this.cdr.markForCheck(), this.isLoadingResults = false]

            });
    }

    filter(m: MatMenuTrigger) {

        const fl: Filter[] = [];

        const d: FilterFormType = this.filterForm.value;

        if (Object.values(d).filter(_ => _).length === 0) return;

        Object.keys(d).forEach(key => {

            const x: any = key === 'fullName' && d.fullName
             ? { column: 'fullName', condition: 'contains', firstValue: d.fullName }
             : key === 'appliedStart' && d.appliedStart
             ? { column: 'appliedOn', condition: 'bt', firstValue: moment(d.appliedStart).format('MM-DD-YYYY'), secondValue: moment(d.appliedEnd || new Date()).format('MM-DD-YYYY') }
                    : key === 'appointmentStart' && d.appointmentStart ? { column: 'appointmentDate', condition: 'bt', firstValue: moment(d.appointmentStart).format('MM-DD-YYYY'), secondValue: moment(d.appointmentEnd || new Date()).format('MM-DD-YYYY') }
                        : key === 'isEligible' && d.isEligible ? { column: 'isEligible', condition: 'eq', firstValue: d.isEligible }
                            : null;
            if (x)
                fl.push(x);
        });

        this.cdr.markForCheck();

        this.selection.clear();

        this.query.filters = fl;

        this.initData();
        m.closeMenu();
    }

    private exportTo(exportAs: string) {

        this.cdr.markForCheck();

        this.isSelectionEmpty = this.selection.isEmpty();
        if (this.selection.isEmpty()) {
            return;
        }

        const ids = this.selection.selected.map(_ => _.openingId);

        if (ids == null) throw Error('IDs not found.');

        const instance = this.dialog.open(ChangesConfirmComponent, {
            autoFocus: false,
            data: { message: ` <strong>Note!</strong> When you receive a success message, but the exported excel-sheet or pdf file isn't downloading, it is probably your popup blocker preventing to download.<br><br> we recommend you disable your popup blocker or allow it to this page for downloading files.` },
            width: '500px'
        });

        instance.afterClosed().pipe(
            filter(yes => yes),
            tap(_ => [this.cdr.markForCheck(), this.isFileDownloading = true]),
            switchMap(_ => this.aService.exportAppointment(ids, exportAs)),
            delay(500), takeUntil(this.toDestroy$)
        ).subscribe({
            next: this.handleDownloadSuccess,
            error: _ => [this.cdr.markForCheck(),
            this.isFileDownloading = false,
            this.notify.when('danger', _)]
        });
    }

    private handleDownloadSuccess = (response: AjaxResponse) => {

        this.cdr.markForCheck();

        const a = document.createElement('a');

        a.href = window.URL.createObjectURL(response.response);

        const disposition = response.xhr.getResponseHeader('Content-Disposition');

        if (disposition) {
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) {
                const filename = matches[1].replace(/['"]/g, '');
                a.download = filename;
            }
        }

        document.body.appendChild(a);
        this.isFileDownloading = false;
        a.target = '_blank';
        a.click();
        this.notify.when('success', { messageBody: 'File download success.' });
        document.body.removeChild(a);

    }

    private initEvents() {
        const obs = [
            this.sort ? this.sort.sortChange : of(),
            this.paginator.page
        ];
        merge(...obs).pipe(
            debounceTime(100),
            takeUntil(this.toDestroy$)
        ).subscribe(event => {
            // clear selection
            this.selection.clear();

            // sort event
            if ((<Sort>event).active) {
                // reset paginator to default when sort happens
                this.query.paginator = { pageIndex: 1, pageSize: this.paginator.pageSize };

                this.query.sort = [{ column: this.sort.active, direction: (this.sort.direction || 'asc').toUpperCase() }];

            } else {
                this.query.paginator = { pageIndex: this.paginator.pageIndex + 1, pageSize: this.paginator.pageSize };
            }

            this.initData();
        });
    }

    resetFilters() {
        this.cdr.markForCheck();
        if (this.sort) {
            this.sort.active = null;
            this.sort.direction = null;
        }
        this.query = { filters: [], sort: null };

        this.dataSource._updateChangeSubscription();
    }

    clearErrors() {
        this.isLoadingResults = null;
        this.isSelectionEmpty = null;
    }
}
