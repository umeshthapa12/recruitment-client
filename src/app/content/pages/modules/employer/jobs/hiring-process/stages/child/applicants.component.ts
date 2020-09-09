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
import { merge, Observable, of, Subject } from 'rxjs';
import { AjaxResponse } from 'rxjs/ajax';
import { debounceTime, delay, filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Filter, OpeningModel, QueryModel } from '../../../../../../../../models';
import { ApplicantModel } from '../../../../../../../../models/appointment.model';
import { collectionInOut, ExtendedMatDialog, fadeIn, fadeInX } from '../../../../../../../../utils';
import { ChangesConfirmComponent } from '../../../../../../components/shared/changes-confirm/changes-confirm.component';
import { SnackToastService } from '../../../../../../components/shared/snakbar-toast/toast.service';
import { JobSeekerStageService } from '../../../../../shared/js-stage.service';
import { StageChangeFormComponent } from './stage-change-form.component';
import { StageHistoryComponent } from './stage-history.component';

interface FilterFormType {
    fullName: string;
    appliedStart: Date;
    appliedEnd: Date;
    appointmentStart: Date;
    appointmentEnd: Date;
    isEligible: boolean;
    stage: string;
}

@Component({
    templateUrl: './applicants.component.html',
    styleUrls: ['../../../../../shared/shared.scss'],
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
    isWorking: boolean;

    displayedColumns = [
        'select',
        'fullName',
        'stage',
        'isEligible',
        'action'
    ];

    isSelectionEmpty: boolean;

    @ViewChild(CdkDrag, { static: true })
    private readonly drag: CdkDrag;

    filterForm: FormGroup;

    @Select('dropdowns', 'stages') stage$: Observable<any[]>;
    selectedId: string;

    constructor(
        private cdr: ChangeDetectorRef,
        private route: ActivatedRoute,
        private router: Router,
        private aService: JobSeekerStageService,
        private exDialog: ExtendedMatDialog,
        private dialog: MatDialog,
        // @Optional()
        @Inject(MAT_DIALOG_DATA)
        public data: { opening: OpeningModel },
        // @Optional()
        public dialogRef: MatDialogRef<ApplicantsComponent>,
        private notify: SnackToastService,
        private fb: FormBuilder
    ) { }

    ngOnInit() {

        this.filterForm = this.fb.group({
            fullName: null,
            isEligible: null,
            stage: null,
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

    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    onAction(action: string, el: ApplicantModel) {

        this.isSelectionEmpty = this.selection.isEmpty() && !el;
        if (this.isSelectionEmpty) {
            return;
        }

        const mapped = this.selection.selected;
        const config = {
            width: '700px',
            maxHeight: '98vh',
            data: { ap: el ? [el] : mapped, isMessage: false },
            autoFocus: false,

        };

        this.selectedId = el && el.jobSeekerGuid;

        switch (action) {

            case 'excel':
            case 'pdf':
                this.dialogRef.disableClose = true;
                this.exportTo(action);
                break;

            case 'stage-only':
            case 'stage-message':

                if (action === 'stage-only')
                    config.width = '400px';

                if (action === 'stage-message')
                    config.data.isMessage = true;

                const x = this.dialog.open(StageChangeFormComponent, config);
                x.afterClosed().pipe(
                    tap(_ => [this.cdr.markForCheck(), this.selectedId = null]),
                    filter(res => res), takeUntil(this.toDestroy$),
                ).subscribe({
                    next: res => [this.notify.when('success', res),
                    this.initData()
                    ]
                });
                break;

            case 'history':
                this.dialog.open(StageHistoryComponent, {
                    ...config, width: '800px',
                    data: { js: el }
                }).afterClosed().pipe(takeUntil(this.toDestroy$))
                    .subscribe({ next: _ => [this.cdr.markForCheck(), this.selectedId = null] });
                break;
        }
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

        /* We're not going to preserve query parameters for the modal dialog list
           thus redirect to relative page by cleaning up the params.
         */
        setTimeout(_ => this.router.navigate(
            ['./employer/j/stages'], { relativeTo: this.route, queryParams: {} }
        ), 10);

        this.aService.getApplicants(this.data === null ? 0 : this.data.opening.id, this.query)
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

            const x:any = key === 'fullName' && d.fullName ? { column: 'fullName', condition: 'contains', firstValue: d.fullName }
                : key === 'isEligible' && d.isEligible ? { column: 'isEligible', condition: 'eq', firstValue: d.isEligible }
                    : key === 'stage' && d.stage ? { column: 'stage', condition: 'eq', firstValue: d.stage }
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
        const uid = this.selection.selected.map(_ => _.jobSeekerGuid);

        if (ids == null) throw Error('IDs not found.');

        const instance = this.dialog.open(ChangesConfirmComponent, {
            autoFocus: false,
            data: { message: ` <strong>Note!</strong> When you receive a success message, but the exported excel-sheet or pdf file isn't downloading, it is probably your popup blocker preventing to download.<br><br> we recommend you disable your popup blocker or allow it to this page for downloading files.` },
            width: '500px'
        });

        instance.afterClosed().pipe(
            filter(yes => yes),
            tap(_ => [this.cdr.markForCheck(), this.isFileDownloading = true]),
            switchMap(_ => this.aService.exportStageData([... new Set(ids)], [...new Set(uid)], exportAs)),
            delay(300), takeUntil(this.toDestroy$)
        ).subscribe({
            next: this.handleDownloadSuccess,
            error: (_: AjaxResponse) => [this.cdr.markForCheck(),
            this.isFileDownloading = false,
            this.notify.when('warn', { messageBody: _.status === 404 ? 'No Stage Data Found.' : 'Something went wrong.' })]
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
