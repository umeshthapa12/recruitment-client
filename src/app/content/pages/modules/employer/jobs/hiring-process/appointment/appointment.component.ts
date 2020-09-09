import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { Select } from '@ngxs/store';
import { interval, merge, Observable, of, Subject } from 'rxjs';
import { AjaxResponse } from 'rxjs/ajax';
import { debounceTime, delay, filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { OpeningModel, QueryModel } from '../../../../../../../models';
import { AppointmentModel } from '../../../../../../../models/appointment.model';
import { fadeIn, fadeInX, ParamGenService } from '../../../../../../../utils';
import { ChangesConfirmComponent } from '../../../../../components/shared/changes-confirm/changes-confirm.component';
import { SnackToastService } from '../../../../../components/shared/snakbar-toast/toast.service';
import { AppointmentService } from '../../../../shared/appointment.service';
import { ApplicantsComponent } from './applicants.component';
import { AttendeesComponent } from './attendees.component';
import { AppointmentState, AppointmentStateModel } from './store/appointments.store';

@Component({
    templateUrl: './appointment.component.html',
    animations: [fadeIn, fadeInX],
    styleUrls: ['../../../../shared/shared.scss']
})
export class AppointmentComponent implements AfterViewInit, OnDestroy {

    private readonly toDestroy$ = new Subject<void>();

    query: QueryModel = { filters: [] };
    hasFilter: boolean = this.paramGen.hasFilter;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    isLoadingResults = false;
    items: AppointmentModel[] = [];

    selection = new SelectionModel<AppointmentModel>(true, []);

    estSpin: boolean;

    /**
     * Emits after success post of appointment message form
     */
    @Select(AppointmentState) update$: Observable<AppointmentStateModel>;

    isFileDownloading: boolean;

    constructor(
        private cdr: ChangeDetectorRef,
        private paramGen: ParamGenService,
        private dialog: MatDialog,
        private notify: SnackToastService,
        // private aService: ApplicationService
        private aService: AppointmentService
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

        this.refreshTableDataInterval();

        this.update$.pipe(
            debounceTime(100),
            filter(_ => _.applicant ? true : false),
            takeUntil(this.toDestroy$),
        ).subscribe({ next: _ => this.initData() });

    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    updateEstimated(val: number, refItem: AppointmentModel, m: MatMenuTrigger) {
        // reject api call if the input value is same as grid value
        if (+val <= 0 || +val === refItem.estimated || this.estSpin) {
            m.closeMenu();
            return false;
        }

        this.estSpin = true;
        this.aService.updateOpeningMinorData({ id: refItem.id, estimated: val })
            .pipe(takeUntil(this.toDestroy$), delay(500)).subscribe({
                next: res => {
                    this.estSpin = false;
                    refItem.estimated = +val;
                    m.closeMenu();
                    this.notify.when('success', res);
                },
                error: e => [this.notify.when('danger', e), this.estSpin = false]
            });

    }

    toggleSelection(item: AppointmentModel) {
        this.cdr.markForCheck();
        this.selection.toggle(item);
    }

    onAction(openingId: number, title: string) {
        this.dialog.open(ApplicantsComponent, {
            width: '1200px',
            maxHeight: '98vh',
            data: <OpeningModel>{ id: openingId, jobTitle: title }
        });
    }

    updateAttendees(openingId: number, title: string) {
        this.dialog.open(AttendeesComponent, {
            width: '1200px',
            maxHeight: '98vh',
            data: <OpeningModel>{ id: openingId, jobTitle: title }
        });
    }

    exportTo(id: number, exportAs: string) {
        this.cdr.markForCheck();

        const ids = this.selection.isEmpty() && id > 0 ? [id]
            : !this.selection.isEmpty()
                ? this.selection.selected.map(_ => _.id) : null;

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

    cancelAppointmentTimer(id: number) {

        const mapped = id > 0 ? [id] : !this.selection.isEmpty() ? this.selection.selected.map(_ => _.id) : null;
        if (mapped === null) return;

        const instance = this.dialog.open(ChangesConfirmComponent, {
            autoFocus: false,
            data: { message: 'Timer of auto send appointment message will be removed if it isn\'t sent already.<br><br> Are you sure you want to cancel timer?' }
        });

        instance.afterClosed().pipe(
            filter(yes => yes),
            switchMap(_ => this.aService.cancelScheduledTimer(mapped))
        ).subscribe({
            next: res => [
                this.cdr.markForCheck(),
                this.notify.when('success', res),
                this.selection.clear(),
                this.initData()
            ]
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

        this.aService.getView(this.query).pipe(takeUntil(this.toDestroy$), delay(600)).subscribe({
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
        setTimeout(() => {
            // this.initData();
        }, 200);
        // this.dataSource._updateChangeSubscription();
    }

    /**
     * Gets latest updated data from the API after every 30 seconds.
     */
    private refreshTableDataInterval() {

        interval(30000).pipe(
            filter(_ => this.selection.isEmpty()),
            switchMap(_ => this.aService.getView(this.query)),
            takeUntil(this.toDestroy$)
        ).subscribe({
            next: res => {
                this.resetFilters();
                const data: AppointmentModel[] = (res.contentBody.items || []);
                this.items = data;
                this.paginator.length = (res.contentBody.totalItems || 0);
                this.selection.clear();
            }
        });
    }
}
