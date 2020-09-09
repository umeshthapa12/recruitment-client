import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Select, Store } from '@ngxs/store';
import { merge, Observable, of, Subject } from 'rxjs';
import { debounceTime, delay, filter, switchMap, takeUntil } from 'rxjs/operators';
import { Filter, OpeningModel, QueryModel, ResponseModel } from '../../../../../../models';
import { collectionInOut, ExtendedMatDialog, fadeIn, fadeInOutStagger, ParamGenService } from '../../../../../../utils';
import { DeleteConfirmComponent } from '../../../../components/shared/delete-confirm/delete-confirm.component';
import { SnackToastService } from '../../../../components/shared/snakbar-toast/toast.service';
import { MainComponent } from '../../../shared/openings/main.component';
import { JobService } from '../jobs/job.service';
import { AddOrUpdateAction, LoadLazyOpeningAction } from '../jobs/store/opening.store';
import { DraftService } from './draft.service';

@Component({
    templateUrl: './drafts.component.html',
    styleUrls: ['../../../shared/shared.scss'],
    animations: [fadeInOutStagger, fadeIn, collectionInOut],
})
export class DraftsComponent implements AfterViewInit, OnDestroy {
    private readonly toDestroy$ = new Subject<void>();

    constructor(
        private dService: DraftService,
        private jService: JobService,
        private cdr: ChangeDetectorRef,
        private dialog: MatDialog,
        private notify: SnackToastService,
        private dialogUtil: ExtendedMatDialog,
        private paramGen: ParamGenService,
        private store: Store,
    ) { }

    displayedColumns = ['details', 'jobTitle', 'jobCategory', 'createdOn', 'action'];
    dataSource: MatTableDataSource<OpeningModel> = new MatTableDataSource(null);
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    expandedElement: OpeningModel | null;

    isLoadingResults = true;
    query: QueryModel = { filters: [] };
    hasFilter: boolean = this.paramGen.hasFilter;

    @Select('openings', 'AddOrUpdate') addOrUpdate$: Observable<ResponseModel>;

    private instance: MatDialogRef<MainComponent, ResponseModel>;

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
            filter(res => res && res.contentBody)).subscribe({
                next: res => [
                    this.notify.when('success', res),
                    this.dataSpliceUpdate(res.contentBody.id),
                    this.instance ? this.instance.close() : null
                ],
                error: e => this.notify.when('danger', e)
            });

    }

    rowDetailExpand(row: any) {
        this.expandedElement = this.expandedElement === row ? null : row;
        this.store.dispatch(new LoadLazyOpeningAction(row.id));
    }

    trackById = (_: number, item: any) => item.id;

    rowHeight(row: any) {
        return this.expandedElement === row ? { 'min-height': 'auto' } : { 'min-height': '0', 'border': '0' };
    }

    onAction(id: number, guid: string, action: string) {
        const isDelete = action === 'delete';
        if (isDelete) {
            this.onDelete(id);
            return;
        }

        this.instance = this.dialog.open(MainComponent, {
            width: 'calc(100% - 20px)',
            maxHeight: '99%',
            data: {
                id: id, guid: guid,
                isEdit: id > 0,
                editType: 'draft-edit',
            },
            autoFocus: false,
        });

        this.dialogUtil.animateBackdropClick(this.instance);

    }

    private onDelete(id: number) {

        const instance = this.dialog.open(DeleteConfirmComponent);
        instance.afterClosed()
            .pipe(
                takeUntil(this.toDestroy$),
                filter(yes => yes),
                switchMap(_ => this.jService.deleteOpening(id))
            ).subscribe({
                next: res => {
                    this.dataSpliceUpdate(id);

                    this.notify.when('success', res);

                    // since we keep track on added/updated object, we have to cleanup from the history too.
                    this.store.dispatch(new AddOrUpdateAction({}));
                },
                error: e => this.notify.when('danger', e)
            });

    }

    private dataSpliceUpdate(id: number) {
        const index = this.dataSource.data.findIndex(_ => _.id === id);
        if (index > -1) {
            this.dataSource.data.splice(index, 1);
            // decrease the length of total items
            this.paginator.length--;
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
        this.dService.getDrafts(this.query).pipe(takeUntil(this.toDestroy$), delay(600)).subscribe({
            next: res => {
                this.cdr.markForCheck();
                const data: OpeningModel[] = (res.contentBody.items || []);
                this.dataSource.data = data;
                this.paginator.length = (res.contentBody.totalItems || 0);
                this.isLoadingResults = false;
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
        ).subscribe(event => {
            if ((<Sort>event).active) {
                this.query.paginator = { pageIndex: 1, pageSize: this.paginator.pageSize };
                this.query.sort = [{ column: this.sort.active, direction: this.sort.direction }];
            } else {
                this.query.paginator = { pageIndex: this.paginator.pageIndex + 1, pageSize: this.paginator.pageSize };
            }
            this.initData();
        });
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }
}
