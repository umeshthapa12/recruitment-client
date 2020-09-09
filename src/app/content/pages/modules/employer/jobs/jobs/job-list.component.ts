import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Select, Store } from '@ngxs/store';
import moment from 'moment';
import { PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';
import { merge, Observable, of, Subject } from 'rxjs';
import { debounceTime, delay, filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Filter, OpeningModel, QueryModel, ResponseModel } from '../../../../../../models';
import { collectionInOut, CustomAnimationPlayer, ExtendedMatDialog, fadeIn, fadeInOutStagger, ParamGenService } from '../../../../../../utils';
import { MethodNames, SignalRHubService } from '../../../../../../utils/libraries/signalr-hub.service';
import { ChangesConfirmComponent } from '../../../../components/shared/changes-confirm/changes-confirm.component';
import { SnackToastService } from '../../../../components/shared/snakbar-toast/toast.service';
import { MainComponent } from '../../../shared/openings/main.component';
import { SchedulePostConfirmComponent } from '../../../shared/openings/schedule-post-confirm-inline.component';
import { JobService } from './job.service';
import { ClearCachedOpeningOnDestroyAction, LoadLazyOpeningAction } from './store/opening.store';

@Component({
    templateUrl: './job-list.component.html',
    animations: [fadeInOutStagger, fadeIn, collectionInOut],
    styleUrls: ['../../../shared/shared.scss']
})
export class JobListComponent implements AfterViewInit, OnDestroy {

    private readonly toDestroy$ = new Subject<void>();

    displayedColumns = ['details', 'select', 'id', 'jobTitle', 'jobCategory', 'publishedOn', 'expiresOn', 'status', 'action'];
    dataSource: MatTableDataSource<OpeningModel> = new MatTableDataSource(null);
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    selection = new SelectionModel<OpeningModel>(true, []);
    expandedElement: OpeningModel | null;

    isLoadingResults = true;

    // request query
    query: QueryModel = { filters: [] };

    hasFilter: boolean = this.paramGen.hasFilter;

    @Select('openings', 'AddOrUpdate') addOrUpdate$: Observable<ResponseModel>;

    @Select('notificationHub', 'openingResponse')
    readonly onCreated$: Observable<ResponseModel>;

    expandUpdate: boolean;

    @ViewChild(PerfectScrollbarDirective)
    psScroll: PerfectScrollbarDirective;

    constructor(
        private mService: JobService,
        private cdr: ChangeDetectorRef,
        private dialog: MatDialog,
        private notify: SnackToastService,
        private dialogUtil: ExtendedMatDialog,
        private paramGen: ParamGenService,
        private store: Store,
        private cap: CustomAnimationPlayer,
        private hub: SignalRHubService
    ) { }

    ngAfterViewInit() {

        // init default
        this.query.paginator = {
            pageIndex: this.paginator.pageIndex + 1,
            pageSize: this.paginator.pageSize
        };

        this.initData();

        // these two method names are used for receiving server notification when openings is created or updated.
        this.hub.listenHub<MethodNames>(['openingCreated', 'openingUpdated']);

        // executes when table sort/paginator change happens.
        this.initEvents();

        const obs = [this.onCreated$, this.addOrUpdate$];

        merge(...obs).pipe(
            debounceTime(800),
            takeUntil(this.toDestroy$),
            filter(res => res && res.contentBody),
            tap(res => {
                this.cdr.markForCheck();
                // since state context creates readonly props, we have to create a copy of it to modify
                const d: OpeningModel = { ...res.contentBody };

                const index = this.dataSource.data.findIndex(_ => _.id === d.id);
                if (index > -1) {
                    d.sn = this.dataSource.data[index].sn;
                    this.dataSource.data[index] = d;
                } else {
                    this.dataSource.data.unshift(d);
                }
                setTimeout(_ => [this.cdr.markForCheck(), this.expandUpdate = this.dataSource.data.length <= 10], 1000);
                this.dataSource._updateChangeSubscription();
            }),
            delay(300),
            tap(res => {

                this.psScroll.update();
                this.psScroll.scrollToElement(`#row${res.contentBody.id}`, -100, 200);
            }),
            delay(200)
        ).subscribe({
            next: res => [
                this.notify.when('success', res),
                this.dataSource._updateChangeSubscription(),
                res.contentBody.id > 0 ?
                    this.cap.animate('flash', document.querySelector(`#row${res.contentBody.id}`), 3500)
                    : null
            ],
            error: e => this.notify.when('danger', e)
        });

    }

    ngOnDestroy() {
        this.store.dispatch(new ClearCachedOpeningOnDestroyAction());
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    rowDetailExpand(row: OpeningModel) {
        this.expandedElement = this.expandedElement === row ? null : row;
        this.store.dispatch(new LoadLazyOpeningAction(row.id));
    }

    trackById = (_: number, item: OpeningModel) => item.id;

    updateStatus(s: string, id: number) {
        // operations
        const row = this.dataSource.data.find(_ => _.id === id);
        // the param value must match with the row value as `scheduled | schedule`
        const isScheduled = s && s.toLowerCase() === ('scheduled' || 'schedule');
        // prep payload
        let body: OpeningModel = { id: row.id, status: s };

        // re-usable fn //
        const subs = (res: ResponseModel) => [
            this.notify.when('success', res),
            this.cap.animate('rubberBand', document.querySelector(`#status${id}`))
        ];
        const sTap = (_: any) => {
            this.cdr.markForCheck();
            if (row) row.status = s;
        };

        // dialog instances
        let instance: MatDialogRef<ChangesConfirmComponent>;
        let ins: MatDialogRef<SchedulePostConfirmComponent>;

        // primary dialog to ensure confirmation.
        instance = this.dialog.open(ChangesConfirmComponent, {
            data: { message: `Updating status could lead this post to the different process and results.<br/> <br/>Are you sure you want to change the current status?` }
        });

        // capture primary dialog closed event whether to display another dialog for the user input.
        instance.beforeClosed().pipe(
            // is user clicks yes and the status value is scheduled
            takeUntil(this.toDestroy$), filter(yes => yes && isScheduled),
            switchMap(_ => {
                ins = this.dialog.open(SchedulePostConfirmComponent, { autoFocus: false });
                return ins.afterClosed();
            }),
            // if user clicks to yes from the data input dialog
            filter(yes => {
                body = {
                    ...body,
                    scheduledPublishDate: moment(ins.componentInstance.dControl.value).format('MM-DD-YYYY'),
                    expiresOn: moment(ins.componentInstance.expiryDControl.value).format('MM-DD-YYYY'),
                };
                return yes;
            }),
            // submit user input
            switchMap(_ => this.mService.updateStatus(body).pipe(
                takeUntil(this.toDestroy$)
            )),
            tap(sTap),
        ).subscribe({
            next: subs,
            error: e => this.notify.when('danger', e)
        });

        instance.afterClosed().pipe(
            // if the user clicks to yes and the status value isn't as `scheduled`
            takeUntil(this.toDestroy$), filter(yes => yes && row.status !== s && !isScheduled),
            switchMap(_ => this.mService.updateStatus(body).pipe(takeUntil(this.toDestroy$))),
            tap(sTap),
        ).subscribe({
            next: subs,
            error: e => this.notify.when('danger', e)
        });
    }

    rowHeight(row: OpeningModel) {
        return this.expandedElement === row ? { 'min-height': 'auto' } : { 'min-height': '0', 'border': '0' };
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

    onAction(openingId: number, guid: string) {
        let instance: MatDialogRef<MainComponent, ResponseModel>;
        instance = this.dialog.open(MainComponent, {
            width: 'calc(100% - 20px)',
            maxHeight: '99%',
            data: { id: openingId, guid: guid, isEdit: openingId > 0 },
            autoFocus: false,
        });

        this.dialogUtil.animateBackdropClick(instance);
    }

    toArchive(id: number) {

        this.mService.updateStatus({ id: id, status: 'Archived' })
            .pipe(takeUntil(this.toDestroy$))
            .subscribe({
                next: res => {
                    this.cdr.markForCheck();
                    const index = this.dataSource.data.findIndex(_ => _.id === id);
                    if (index > -1) {
                        this.dataSource.data[index].status = 'Archived';
                    }

                    setTimeout(_ => [this.cdr.markForCheck(), this.expandUpdate = this.dataSource.data.length <= 10], 1000);

                    this.notify.when('success', { messageBody: 'Moved to archived successfully!' });
                    this.dataSource._updateChangeSubscription();

                },
                error: e => this.notify.when('danger', e)
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
            this.initData();
        }, 200);
        this.dataSource._updateChangeSubscription();
    }

    filter(f: Filter, column: string) {
        const fl: Filter = { ...f, column: column };
        const index = this.query.filters.findIndex(_ => _.column === column);
        if (index > -1) {
            this.query.filters[index] = fl;
        } else {
            this.query.filters.push(fl);
        }

        this.initData();
    }

    private initData() {
        this.cdr.markForCheck();
        this.dataSource.data = [];
        this.isLoadingResults = true;

        this.mService.getOpenings(this.query).pipe(takeUntil(this.toDestroy$), delay(600)).subscribe({
            next: res => {
                this.cdr.markForCheck();
                const data: OpeningModel[] = (res.contentBody.items || []);
                this.dataSource.data = data;
                this.paginator.length = (res.contentBody.totalItems || 0);
                this.isLoadingResults = false;
                setTimeout(_ => [this.cdr.markForCheck(), this.expandUpdate = this.paginator.length <= 10], 1000);
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

}
