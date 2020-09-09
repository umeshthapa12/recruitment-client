import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Select, Store } from '@ngxs/store';
import moment from 'moment';
import { merge, Observable, of, range, Subject } from 'rxjs';
import { debounceTime, delay, filter, map, mergeMap, switchMap, takeUntil } from 'rxjs/operators';
import { Filter, OpeningModel, QueryModel } from '../../../../../../models';
import { collectionInOut, CustomAnimationPlayer, ExtendedMatDialog, fadeIn, fadeInOutStagger, ParamGenService } from '../../../../../../utils';
import { DeleteConfirmComponent } from '../../../../components/shared/delete-confirm/delete-confirm.component';
import { SnackToastService } from '../../../../components/shared/snakbar-toast/toast.service';
import { SchedulePostConfirmComponent } from '../../../shared/openings/schedule-post-confirm-inline.component';
import { JobService } from '../jobs/job.service';
import { AddOrUpdateAction, LoadLazyOpeningAction } from '../jobs/store/opening.store';
import { ArchivedService } from './archived.service';

@Component({
    templateUrl: './archived.component.html',
    styleUrls: ['../../../shared/shared.scss'],
    animations: [fadeInOutStagger, fadeIn, collectionInOut],
})

export class ArchivedComponent implements AfterViewInit, OnDestroy {
    private readonly toDestroy$ = new Subject<void>();

    constructor(
        private aService: ArchivedService,
        private mService: JobService,
        private cdr: ChangeDetectorRef,
        private dialog: MatDialog,
        private notify: SnackToastService,
        private dialogUtil: ExtendedMatDialog,
        private paramGen: ParamGenService,
        private store: Store,
        private cap: CustomAnimationPlayer,
    ) { }

    displayedColumns = ['details', 'select', 'id', 'jobTitle', 'jobCategory', 'expiresOn', 'action'];
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
    }

    rowDetailExpand(row: any) {
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

        switch (action) {
            case 'publish':
            case 'selected-publish':

                this.reopenPost(id, guid);

                break;

            case 'schedule':
            case 'selected-schedule':
                this.schedulePost(id, guid);
                break;

            case 'delete':
            case 'selected-delete':
                this.onDelete(id);
                break;

        }

    }

    private reopenPost(id: number, guid: string) {
        const s = !this.selection.isEmpty();
        let instance: MatDialogRef<RePostConfirmComponent, boolean>;
        instance = this.dialog.open(RePostConfirmComponent, {
            autoFocus: false,
        });
        instance.afterClosed().pipe(takeUntil(this.toDestroy$), filter(yes => yes), map(_ => {
            return <OpeningModel>{
                id: id, regGuid: guid,
                publishedOn: moment(instance.componentInstance.sControl.value).format('MM-DD-YYYY'),
                expiresOn: moment(instance.componentInstance.eControl.value).format('MM-DD-YYYY'),
                status: 'Active',
                // get updates all the items of IDs
                selectedId: this.selection.selected.map(_ => _.id)
            };
        }), switchMap(body => this.mService.updateStatus(body))).subscribe({
            next: _ => {
                this.dataSpliceUpdate(id);

                this.notify.when('success', {
                    messageBody: `${s ? 'Selected items' : 'An opening'} has been reopened successfully.`
                });
            }
        });
    }

    private schedulePost(id: number, guid: string) {
        const s = !this.selection.isEmpty();
        let sInstance: MatDialogRef<SchedulePostConfirmComponent, boolean>;
        sInstance = this.dialog.open(SchedulePostConfirmComponent, { autoFocus: false });

        sInstance.afterClosed().pipe(
            takeUntil(this.toDestroy$), filter(yes => yes),
            map(_ => {
                return <OpeningModel>{
                    id: id, regGuid: guid,
                    scheduledPublishDate: moment(sInstance.componentInstance.dControl.value).format('MM-DD-YYYY'),
                    expiresOn: moment(sInstance.componentInstance.expiryDControl.value).format('MM-DD-YYYY'),
                    status: 'Scheduled',
                    selectedId: this.selection.selected.map(_ => _.id)
                };
            }),
            switchMap(body => this.mService.updateStatus(body))
        ).subscribe({
            next: _ => {
                this.dataSpliceUpdate(id);

                this.notify.when('success', {
                    messageBody: `${s ? 'Selected items' : 'An opening'} has been scheduled to reopen successfully.`
                });

            }
        });

    }

    private onDelete(id: number) {
        const s = !this.selection.isEmpty();
        const instance = this.dialog.open(DeleteConfirmComponent);
        instance.afterClosed()
            .pipe(
                takeUntil(this.toDestroy$),
                filter(yes => yes),
                mergeMap(_ => range(0, s ? this.selection.selected.length : 1)),
                map((_, i) => s ? this.selection.selected[i].id : id),
                switchMap(_id => this.mService.deleteOpening(_id))
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
        this.aService.getArchives(this.query).pipe(takeUntil(this.toDestroy$), delay(600)).subscribe({
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
        ).subscribe(event => {
            this.selection.clear();
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

@Component({
    template: `
    <h2 mat-dialog-title>Reopen Confirm!</h2>
    <mat-dialog-content>
        <mat-form-field appearance="outline">
            <mat-label>Publish Date</mat-label>
            <input [min]="min" [formControl]="sControl" (focus)="sDt.open()" (click)="sDt.open()" #x [matDatepicker]="sDt" matInput placeholder="publish date" required>
            <mat-datepicker #sDt></mat-datepicker>
        </mat-form-field>
        <mat-form-field appearance="outline">
            <mat-label>Expiry Date</mat-label>
            <input [min]="(sControl.value || min)" [formControl]="eControl" (focus)="eDt.open()" (click)="eDt.open()" #x [matDatepicker]="eDt" matInput placeholder="Expiry date" required>
            <mat-datepicker #eDt></mat-datepicker>
        </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions class="mt-3 pb-4" align="center">
        <button [ngClass]="(sControl.invalid || eControl.invalid) ? 'btn-outline-metal':'btn-outline-accent'" [disabled]="(sControl.invalid || eControl.invalid)" [mat-dialog-close]="true" type="button" class="btn  btn-sm m-btn m-btn--icon mx-1">
            <span>
                <i class="la la-check"></i>
                <span>Reopen</span>
            </span>
        </button>
        <button mat-dialog-close type="button" class="btn btn-outline-warning btn-sm m-btn m-btn--icon mx-1">
            <span>
                <i class="la la-close"></i>
                <span>Cancel</span>
            </span>
        </button>
    </mat-dialog-actions>
    `
})
export class RePostConfirmComponent {
    // access and set value to parent prop from this prop
    sControl = new FormControl('', Validators.required);
    eControl = new FormControl('', Validators.required);

    min = new Date();
}
