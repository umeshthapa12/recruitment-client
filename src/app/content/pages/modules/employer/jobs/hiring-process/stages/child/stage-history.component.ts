import { SelectionModel } from '@angular/cdk/collections';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { merge, of, Subject } from 'rxjs';
import { debounceTime, delay, filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Filter, OpeningModel, QueryModel } from '../../../../../../../../models';
import { StageHistoryModel } from '../../../../../../../../models/application.model';
import { ApplicantModel } from '../../../../../../../../models/appointment.model';
import { collectionInOut, ExtendedMatDialog, fadeIn, fadeInX, ParamGenService } from '../../../../../../../../utils';
import { DeleteConfirmComponent } from '../../../../../../components/shared/delete-confirm/delete-confirm.component';
import { SnackToastService } from '../../../../../../components/shared/snakbar-toast/toast.service';
import { JobSeekerStageService } from '../../../../../shared/js-stage.service';
import { MessageBodyComponent } from './message-body-view.component';

interface cachedDataType { id: number; guid: string; items?: StageHistoryModel[]; messageBody?: string; }

@Component({
    templateUrl: './stage-history.component.html',
    styleUrls: ['../../../../../shared/custom-styles-mat-table.scss'],
    animations: [collectionInOut, fadeIn, fadeInX]
})
export class StageHistoryComponent implements AfterViewInit, OnDestroy {

    private readonly toDestroy$ = new Subject<void>();

    private readonly cached: cachedDataType[] = [];
    private readonly cachedMessageBody: cachedDataType[] = [];

    displayedColumns = ['select', 'subject', 'stage', 'createdOn', 'remarks', 'messageBody', 'action'];
    items: StageHistoryModel[] = [];
    dataSource: MatTableDataSource<StageHistoryModel> = new MatTableDataSource(null);
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    isLoadingResults = true;
    isLazyListLoading: boolean;
    activatedId: number;
    selectedId: number;
    selectedGuid: string;

    selection = new SelectionModel<StageHistoryModel>(true, []);

    // request query
    query: QueryModel = { filters: [] };

    hasFilter: boolean = this.paramGen.hasFilter;

    @ViewChild(CdkDrag, { static: true })
    private readonly drag: CdkDrag;

    constructor(
        private jsmService: JobSeekerStageService,
        private cdr: ChangeDetectorRef,
        private dialog: MatDialog,
        private exDialog: ExtendedMatDialog,
        private paramGen: ParamGenService,
        private notify: SnackToastService,
        @Inject(MAT_DIALOG_DATA)
        public data: { isGroupBy: boolean, opening: OpeningModel, js: ApplicantModel },
        public dialogRef: MatDialogRef<StageHistoryComponent>
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

        this.exDialog.makeTransparentWhenDragMove(this.drag);

    }

    xpanChange(isExpanded: boolean, id: number, jsGuid: string) {

        this.selection.clear();

        if (!isExpanded) return;

        this.selectedGuid = jsGuid;

        this.cdr.markForCheck();

        this.dataSource.data = [];

        const index = this.cached.findIndex(_ => _.id === id && _.guid === jsGuid);
        if (index > -1) {
            this.dataSource.data = this.cached[index].items;
            this.dataSource._updateChangeSubscription();
            return;
        }

        this.isLazyListLoading = true;

        this.jsmService.getApplicantHistory(this.data.opening.id, jsGuid).pipe(
            takeUntil(this.toDestroy$),
            delay(300)
        ).subscribe({
            next: res => {
                this.cdr.markForCheck();
                this.isLazyListLoading = false;
                const d: StageHistoryModel[] = res.contentBody;
                this.cached.push({ id: id, guid: jsGuid, items: d });
                this.dataSource.data = d;
            }
        });
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {

        // by excluding current stage
        const numSelected = this.selection.selected.filter(_ => !_.isOngoing).length;
        const numRows = this.dataSource.data.filter(_ => !_.isOngoing).length;

        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
        this.isAllSelected() ?
            this.selection.clear() :
            this.dataSource.data.forEach(row => row.isOngoing ? null : this.selection.select(row));
    }

    trackById = (_: number, item: StageHistoryModel) => item.id;

    onAction(id: number, jsGuid: string) {

        this.cdr.markForCheck();
        this.selectedId = id;

        const index = this.cachedMessageBody.findIndex(_ => _.id === id && _.guid === jsGuid);
        if (index > -1) {
            this.dialog.open(MessageBodyComponent, { data: this.cachedMessageBody[index].messageBody, autoFocus: false })
                .afterClosed().subscribe({
                    next: _ => [this.cdr.markForCheck(), this.selectedId = null]
                });
            return;
        }

        this.activatedId = id;

        this.jsmService.getMessageBody(id, jsGuid).pipe(
            takeUntil(this.toDestroy$), delay(500)
        ).subscribe({
            next: res => {
                this.cdr.markForCheck();
                const b: string = res.contentBody;
                this.cachedMessageBody.push({ id: id, guid: jsGuid, messageBody: b });
                this.activatedId = null;
                this.dialog.open(MessageBodyComponent, { data: b, autoFocus: false })
                    .afterClosed().subscribe({
                        next: _ => [this.cdr.markForCheck(), this.selectedId = null]
                    });
            },
            error: _ => [this.cdr.markForCheck(), this.selectedId = null, this.activatedId = null]
        });

    }

    deleteHistory(id: number, jsGuid: string) {
        this.cdr.markForCheck();
        const empty = this.selection.isEmpty();

        if (empty && !(id > 0) && (jsGuid || '') === '') return;

        this.selectedId = id;

        const ids = empty && id > 0 && (jsGuid || '') !== '' ? [id] : this.selection.selected.map(_ => _.id);
        this.dialog.open(DeleteConfirmComponent).afterClosed()
            .pipe(tap(_ => [this.cdr.markForCheck(), this.selectedId = null]), filter(yes => yes),
                switchMap(_ => this.jsmService.deleteHistory([...new Set(ids)], [empty && id > 0 && (jsGuid || '') !== '' ? jsGuid : this.selectedGuid])),
                takeUntil(this.toDestroy$)).subscribe({
                    next: res => {
                        this.notify.when('success', res, () => this.resetFilters());
                        const index = this.cached.findIndex(_ => _.guid === this.selectedGuid);
                        if (index > -1) this.cached.splice(index, 1);
                        this.selection.clear();
                    }
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

        setTimeout(_ => this.initData(), 200);
    }

    filter(f: Filter, column: string) {

        this.cdr.markForCheck();

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

        this.items = [];
        this.isLoadingResults = true;

        of(this.data).pipe(
            filter(d => d ? true : false),
            // conditionally switch either grouped by job seekers with lazy load history or fully history
            switchMap(d => d && d.isGroupBy
                ? this.jsmService.getApplicantsHistory(d.opening.id, this.query)
                : this.jsmService.getApplicantHistory(d.js.openingId, d.js.jobSeekerGuid)),
            delay(600), takeUntil(this.toDestroy$)
        ).subscribe({
            next: res => {

                this.cdr.markForCheck();

                // either group by or full history
                const data: StageHistoryModel[] = this.data.isGroupBy
                    ? (res.contentBody.items || [])
                    : (res.contentBody || []);

                this.data && this.data.isGroupBy ? this.items = data : this.dataSource.data = data;

                if (this.data && this.data.isGroupBy)
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
        ).subscribe({
            next: event => {

                // sort event
                if ((<Sort>event).active) {
                    // reset paginator to default when sort happens
                    this.query.paginator = { pageIndex: 1, pageSize: this.paginator.pageSize };
                    this.query.sort = [{ column: this.sort.active, direction: this.sort.direction }];
                } else {
                    this.query.paginator = { pageIndex: this.paginator.pageIndex + 1, pageSize: this.paginator.pageSize };
                }

                this.initData();
            }
        });
    }
}
