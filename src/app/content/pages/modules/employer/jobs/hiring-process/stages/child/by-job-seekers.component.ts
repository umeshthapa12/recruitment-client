import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { merge, of, Subject } from 'rxjs';
import { AjaxResponse } from 'rxjs/ajax';
import { debounceTime, delay, filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { QueryModel } from '../../../../../../../../models';
import { ApplicantModel } from '../../../../../../../../models/appointment.model';
import { fadeIn, fadeInX } from '../../../../../../../../utils';
import { ChangesConfirmComponent } from '../../../../../../components/shared/changes-confirm/changes-confirm.component';
import { SnackToastService } from '../../../../../../components/shared/snakbar-toast/toast.service';
import { JobSeekerStageService } from '../../../../../shared/js-stage.service';
import { StageChangeFormComponent } from './stage-change-form.component';
import { StageHistoryComponent } from './stage-history.component';

@Component({
    selector: 'job-seeker-view',
    templateUrl: './by-job-seekers.component.html',
    styleUrls: ['../../../../../shared/shared.scss'],
    animations: [fadeIn, fadeInX]
})
export class ByJobSeekerComponent implements AfterViewInit {

    private readonly toDestroy$ = new Subject<void>();

    @Input() selection = new SelectionModel<ApplicantModel>(true, []);
    @Input() reload: EventEmitter<QueryModel>;

    dataSource: MatTableDataSource<ApplicantModel> = new MatTableDataSource(null);
    query: QueryModel = { filters: [], sort: [] };
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    isLoadingResults = false;
    isFileDownloading: boolean;

    displayedColumns = [
        'select',
        'fullName',
        'stage',
        'jobTitle',
        'isEligible',
        'action'
    ];

    isSelectionEmpty: boolean;
    selectedId: string;

    constructor(
        private cdr: ChangeDetectorRef,
        private aService: JobSeekerStageService,
        private dialog: MatDialog,
        private notify: SnackToastService,
    ) { }

    ngAfterViewInit() {

        // init default
        this.query.paginator = {
            pageIndex: (this.paginator && this.paginator.pageIndex + 1 || 1),
            pageSize: (this.paginator && this.paginator.pageSize || 50)
        };

        setTimeout(_ => this.initData(), 0);

        // executes when table sort/paginator change happens.
        this.initEvents();

        this.reload.pipe(
            debounceTime(200), takeUntil(this.toDestroy$)
        ).subscribe({ next: query => [this.query = { ...this.query, ...query }, this.initData()] });

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
                ).subscribe({ next: res => [this.notify.when('success', res), this.initData()] });
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

    initData() {

        this.cdr.markForCheck();
        this.dataSource.data = [];
        this.isLoadingResults = true;
        this.selection.clear();

        this.aService.getApplicants(0, this.query)
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
