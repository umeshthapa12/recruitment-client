import { SelectionModel } from '@angular/cdk/collections';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
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
import { debounceTime, delay, filter, switchMap, takeUntil } from 'rxjs/operators';
import { Filter, OpeningModel, QueryModel, ResponseModel } from '../../../../../../../models';
import { ApplicantModel } from '../../../../../../../models/appointment.model';
import { JobSeekerMessage } from '../../../../../../../models/job-seeker-message.model';
import { collectionInOut, ExtendedMatDialog, fadeIn, fadeInX } from '../../../../../../../utils';
import { ChangesConfirmComponent } from '../../../../../components/shared/changes-confirm/changes-confirm.component';
import { SnackToastService } from '../../../../../components/shared/snakbar-toast/toast.service';
import { AppointmentService } from '../../../../shared/appointment.service';
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
    templateUrl: './attendees.component.html',
    styleUrls: ['../../../../shared/shared.scss'],
    animations: [fadeIn, fadeInX, collectionInOut]
})
export class AttendeesComponent implements OnInit {

    private readonly toDestroy$ = new Subject<void>();

    selection = new SelectionModel<ApplicantModel>(true, []);
    dataSource: MatTableDataSource<ApplicantModel> = new MatTableDataSource(null);
    query: QueryModel = { filters: [], sort: [] };
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    isLoadingResults = false;

    displayedColumns = [
        'select',
        'fullName',
        'appliedOn',
        'appointmentDate',
        'isAttended',
        'action'
    ];

    isSelectionEmpty: boolean;

    @ViewChild(CdkDrag, { static: true })
    private readonly drag: CdkDrag;

    @Select(AppointmentState) update$: Observable<AppointmentStateModel>;

    filterForm: FormGroup;
    isWorking: boolean;

    constructor(
        private cdr: ChangeDetectorRef,
        private route: ActivatedRoute,
        private router: Router,
        private aService: AppointmentService,
        private exDialog: ExtendedMatDialog,
        private dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA)
        public data: OpeningModel,
        public dialogRef: MatDialogRef<AttendeesComponent>,
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

    onAction(action: string, messageId: number, jsGuid: string) {

        this.isSelectionEmpty = this.selection.isEmpty() && messageId <= 0;
        if (this.isSelectionEmpty) return;

        const asAttend = action === 'attended';

        const mapped = messageId > 0
            ? [<JobSeekerMessage>{ id: messageId, jobSeekerGuid: jsGuid, isAttended: asAttend }]
            : this.selection.selected.filter(_ => _.appointmentDate).map(a => <JobSeekerMessage>{
                jobSeekerGuid: a.jobSeekerGuid, id: a.messageId,
                isAttended: asAttend
            });

        const reqSub = () => this.aService.updateAttendees(mapped);

        // no confirmation for single row action to mark as attended.
        if (asAttend && messageId > 0) {

            reqSub().pipe(takeUntil(this.toDestroy$))
                .subscribe({ next: res => this.singleUpdate(messageId, asAttend, res) });
            return;
        }

        // Either selected collection of rows (attended/unattended)
        // or a single row (only for unattended) flag updater requires the confirmation dialog
        let instance: MatDialogRef<ChangesConfirmComponent, boolean>;

        instance = this.dialog.open(ChangesConfirmComponent, {
            data: {
                message: asAttend ? 'Selected applicants will be marked as appointment attendees'
                    : 'Are you sure you want to change as unattended applicants?'
            },
            autoFocus: false
        });

        instance.afterClosed().pipe(
            filter(yes => yes),
            switchMap(reqSub),
            takeUntil(this.toDestroy$)
        ).subscribe({
            next: res => {
                this.cdr.markForCheck();
                if (messageId > 0) this.singleUpdate(messageId, asAttend, res);
                else {
                    this.selection.selected.filter(_ => _.appointmentDate).forEach(s => {
                        this.cdr.markForCheck();
                        s.isAttended = asAttend;
                    });
                    this.notify.when('success', res, () => this.clearErrors());
                    this.selection.clear();
                }
            }
        });
    }

    private singleUpdate(messageId: number, asAttend: boolean, res: ResponseModel) {

        const dataRef = this.dataSource.data;

        this.cdr.markForCheck();

        const index = dataRef.findIndex(_ => _.messageId === messageId);
        if (index > -1)
            dataRef[index].isAttended = asAttend;
        this.notify.when('success', res, () => this.clearErrors(), { horizontalPosition: 'center' });
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
            .pipe(delay(600), takeUntil(this.toDestroy$)).subscribe({
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

            const x: any = key === 'fullName' && d.fullName ? { column: 'fullName', condition: 'contains', firstValue: d.fullName }
                : key === 'appliedStart' && d.appliedStart ? { column: 'appliedOn', condition: 'bt', firstValue: moment(d.appliedStart).format('MM-DD-YYYY'), secondValue: moment(d.appliedEnd || new Date()).format('MM-DD-YYYY') }
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
        this.isWorking = null;
        this.isSelectionEmpty = null;
    }
}
