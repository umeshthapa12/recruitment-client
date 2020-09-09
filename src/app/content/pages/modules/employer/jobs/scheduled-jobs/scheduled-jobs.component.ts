import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Select, Store } from '@ngxs/store';
import { merge, Observable, of, Subject } from 'rxjs';
import { debounceTime, delay, filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Filter, OpeningModel, QueryModel } from '../../../../../../models';
import { collectionInOut, CustomAnimationPlayer, fadeIn, ParamGenService } from '../../../../../../utils';
import { ChangesConfirmComponent } from '../../../../components/shared/changes-confirm/changes-confirm.component';
import { SnackToastService } from '../../../../components/shared/snakbar-toast/toast.service';
import { JobService } from '../jobs/job.service';
import { ClearCachedOpeningOnDestroyAction, LoadLazyOpeningAction } from '../jobs/store/opening.store';
import { ScheduledService } from './scheduled.service';

@Component({
    templateUrl: './scheduled-jobs.component.html',
    styleUrls: ['../../../shared/shared.scss'],
    animations: [fadeIn, collectionInOut],
})
export class ScheduledJobsComponent implements AfterViewInit, OnDestroy {
    private readonly toDestroy$ = new Subject<void>();

    constructor(
        private dService: ScheduledService,
        private jService: JobService,
        private cdr: ChangeDetectorRef,
        private dialog: MatDialog,
        private notify: SnackToastService,
        private paramGen: ParamGenService,
        private store: Store,
        private cap: CustomAnimationPlayer
    ) { }

    displayedColumns = ['details', 'select', 'id', 'jobTitle', 'jobCategory', 'scheduledPublishDate', 'expiresOn', 'status', 'action'];
    dataSource: MatTableDataSource<OpeningModel> = new MatTableDataSource(null);

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    selection = new SelectionModel<OpeningModel>(true, []);
    expandedElement: OpeningModel | null;

    isLoadingResults = true;
    query: QueryModel = { filters: [] };
    hasFilter: boolean = this.paramGen.hasFilter;
    @Select('openings', 'AddOrUpdate') addOrUpdate$: Observable<any>;
    expandUpdate: boolean;

    ngAfterViewInit() {
        this.query.paginator = {
            pageIndex: this.paginator.pageIndex + 1,
            pageSize: this.paginator.pageSize
        };
        this.initData();
        this.initEvents();
        this.addOrUpdate$.pipe(
            debounceTime(200),
            takeUntil(this.toDestroy$),
            filter(res => res && res.contentBody),
            tap(res => {
                this.cdr.markForCheck();
                const d: any = { ...res.contentBody };
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
            delay(600),
            tap(res => {
                const el = document.querySelector(`#row${res.contentBody.id}`);
                el.scrollIntoView({ behavior: 'smooth' });
            }),
            delay(400)
        ).subscribe({
            next: res => [
                this.notify.when('success', res),
                this.dataSource._updateChangeSubscription(),
                res.contentBody.id > 0 ?
                    this.cap.animate('flash', document.querySelector(`#row${res.contentBody.id}`), 1500)
                    : null
            ],
            error: e => this.notify.when('danger', e)
        });
        // this.hubObject();
    }

    rowDetailExpand(row: OpeningModel) {
        this.expandedElement = this.expandedElement === row ? null : row;
        this.store.dispatch(new LoadLazyOpeningAction(row.id));
    }

    trackById = (_: number, item: any) => item.id;

    rowHeight(row: any) {
        return this.expandedElement === row ? { 'min-height': 'auto' } : { 'min-height': '0', 'border': '0' };
    }

    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.data.length;
        return numSelected === numRows;
    }

    masterToggle() {
        this.isAllSelected() ?
            this.selection.clear() :
            this.dataSource.data.forEach(row => this.selection.select(row));
    }

    onAction(id: number, guid: string, action: string) {
        let message: string;
        const s = !this.selection.isEmpty();
        let isPublish: boolean;
        switch (action) {
            case 'publish':
            case 'selected-publish':
                isPublish = true;
                message = `Are you sure you want to publish${s ? ' selected posts' : ''} immediately?`;
                break;
            case 'cancel-schedule':
            case 'cancel-selected-schedule':
                message = `Are you sure you want to cancel ${s ? 'selected' : ''} scheduled post${s ? 's' : ''}?`;
                break;
        }

        let instance: MatDialogRef<ChangesConfirmComponent>;
        instance = this.dialog.open(ChangesConfirmComponent, {
            data: { message: message },
            autoFocus: false,
        });
        instance.afterClosed().pipe(
            takeUntil(this.toDestroy$), filter(yes => yes),
            switchMap(_ => this.jService.updateStatus({
                // either single row or the selected rows has to be updated.
                id: id, status: isPublish ? 'Active' : 'Inactive',
                selectedId: this.selection.selected.map(_ => _.id)
            })
            )
        ).subscribe({
            next: _ => [
                this.notify.when('success', {
                    messageBody: `${s ? 'Selected openings' : 'An opening'} has been ${isPublish ? 'published' : 'cancelled'} successfully`
                }),
                this.dataSpliceUpdate(id)
            ],
            error: e => this.notify.when('danger', e)
        });
    }

    private dataSpliceUpdate(id: number) {
        const s = !this.selection.isEmpty();
        if (s) {
            this.selection.selected.forEach(x => {
                const index = this.dataSource.data.findIndex(_ => _.id === x.id);
                if (index > -1) {
                    this.dataSource.data.splice(index, 1);
                    // decrease the length of total items
                    this.paginator.length--;
                }
            });
        } else {
            const index = this.dataSource.data.findIndex(_ => _.id === id);
            if (index > -1) {
                this.dataSource.data.splice(index, 1);
                // decrease the length of total items
                this.paginator.length--;
            }
        }

        this.dataSource._updateChangeSubscription();
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
        this.dService.getSchedules(this.query).pipe(takeUntil(this.toDestroy$), delay(600)).subscribe({
            next: res => {
                this.cdr.markForCheck();
                const data: OpeningModel[] = (res.contentBody.items || []);
                this.dataSource.data = data;
                this.paginator.length = (res.contentBody.totalItems || 0);
                this.isLoadingResults = false;
                setTimeout(_ => [this.cdr.markForCheck(), this.expandUpdate = this.dataSource.data.length <= 10], 1000);
            }
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
        ).subscribe({
            next: event => {
                this.selection.clear();
                if ((<Sort>event).active) {
                    this.query.paginator = { pageIndex: 1, pageSize: this.paginator.pageSize };
                    this.query.sort = [{ column: this.sort.active, direction: this.sort.direction }];
                } else {
                    this.query.paginator = { pageIndex: this.paginator.pageIndex + 1, pageSize: this.paginator.pageSize };
                }
                this.initData();
            }
        });
    }

    ngOnDestroy() {
        this.store.dispatch(new ClearCachedOpeningOnDestroyAction());
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    // private hubObject() {

    //     const connection = new HubConnectionBuilder()
    //         .configureLogging(LogLevel.Information)
    //         .withUrl(`${environment.baseUrl}/notify`).build();

    //     connection.on('openingCreated', (response) => {
    //         console.log(response);

    //     });

    //     const restart = () => {
    //         connection.start().catch(function (err) {
    //             setTimeout(function () {
    //                 restart();
    //             }, 5000);
    //         });
    //     };
    //     connection.onclose(_ => {
    //         restart();
    //     });

    //     restart();

    //     setTimeout(() => {
    //         connection.invoke('JoinUserGroup', 'e3512b92-0fa3-42a8-b867-931dbfb72477')
    //             .catch(er => console.error(er));
    //     }, 2000);

    // }
}
