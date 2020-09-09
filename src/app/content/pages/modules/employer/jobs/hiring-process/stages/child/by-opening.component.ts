import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { merge, of, Subject } from 'rxjs';
import { AjaxResponse } from 'rxjs/ajax';
import { debounceTime, delay, filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { OpeningModel, QueryModel } from '../../../../../../../../models';
import { AppointmentModel } from '../../../../../../../../models/appointment.model';
import { fadeIn, ParamGenService } from '../../../../../../../../utils';
import { ChangesConfirmComponent } from '../../../../../../components/shared/changes-confirm/changes-confirm.component';
import { SnackToastService } from '../../../../../../components/shared/snakbar-toast/toast.service';
import { JobSeekerStageService } from '../../../../../shared/js-stage.service';
import { ApplicantsComponent } from './applicants.component';
import { StageHistoryComponent } from './stage-history.component';

@Component({
    selector: 'opening-view',
    templateUrl: './by-opening.component.html',
    animations: [fadeIn],
    styleUrls: ['../../../../../shared/shared.scss']
})
export class ByOpeningComponent implements AfterViewInit, OnDestroy {

    private readonly toDestroy$ = new Subject<void>();

    query: QueryModel = { filters: [] };
    hasFilter: boolean = this.paramGen.hasFilter;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    isLoadingResults = false;
    items: AppointmentModel[] = [];

    @Input() selection: SelectionModel<AppointmentModel>;

    isFileDownloading: boolean;

    constructor(
        private cdr: ChangeDetectorRef,
        private paramGen: ParamGenService,
        private dialog: MatDialog,
        private notify: SnackToastService,
        private aService: JobSeekerStageService
    ) { }

    ngAfterViewInit() {

        // init default
        this.query.paginator = {
            pageIndex: this.paginator.pageIndex + 1,
            pageSize: this.paginator.pageSize
        };

        this.initData();

        // executes when table sort/paginator change happens.
        this.initEvents();

    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    toggleSelection(item: AppointmentModel) {
        this.cdr.markForCheck();
        this.selection.toggle(item);
    }

    onAction(openingId: number, title: string, action: string) {
        const config = {
            width: '800px',
            maxHeight: '98vh',
            data: { isGroupBy: true, opening: <OpeningModel>{ id: openingId, jobTitle: title } }
        };

        if (action !== 'history') this.dialog.open(ApplicantsComponent, config);
        else this.dialog.open(StageHistoryComponent, { ...config, width: '1000px', disableClose: true });
    }

    exportTo(id: number, exportAs: string) {

        this.cdr.markForCheck();

        const ids = this.selection.isEmpty() && id > 0 ? [id]
            : !this.selection.isEmpty()
                ? this.selection.selected.map(_ => _.id) : null;

        if (ids == null) throw Error('IDs not found.');

        const instance = this.dialog.open(ChangesConfirmComponent, {
            autoFocus: false,
            data: { message: ` <strong>Note:</strong> When you receive a success message, but the exported excel-sheet or pdf file isn't downloading, it is probably your popup blocker preventing to download.<br><br> we recommend you disable your popup blocker or allow it to this page for downloading files.` },
            width: '500px'
        });

        instance.afterClosed().pipe(
            filter(yes => yes),
            tap(_ => [this.cdr.markForCheck(), this.isFileDownloading = true]),
            switchMap(_ => this.aService.exportStageData([... new Set(ids)], [], exportAs)),
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

    private initData() {
        this.cdr.markForCheck();
        this.items = [];
        this.isLoadingResults = true;

        this.aService.getView(this.query).pipe(delay(600), takeUntil(this.toDestroy$)).subscribe({
            next: res => {
                this.cdr.markForCheck();
                const data: AppointmentModel[] = (res.contentBody.items || []);
                this.items = data;
                this.paginator.length = (res.contentBody.totalItems || 0);
                this.isLoadingResults = false;
            },
            error: _ => [this.cdr.markForCheck(), this.isLoadingResults = false]

        });
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
                this.query.sort = [{ column: this.sort.active, direction: this.sort.direction }];
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
        this.paramGen.clearParams();
        this.hasFilter = false;
    }
}
