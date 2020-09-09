import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { merge, of, Subject } from 'rxjs';
import { debounceTime, delay, takeUntil } from 'rxjs/operators';
import { Filter, QueryModel } from '../../../../../../models';
import { JobSeekerSmsModel } from '../../../../../../models/js-message.model';
import { collectionInOut, ParamGenService } from '../../../../../../utils';
import { CandidateSmsService } from './candidate-sms.service';
import { MessageBodyComponent } from './message-body-view.component';

interface cachedDataType { id: number, guid: string, items?: JobSeekerSmsModel[], messageBody?: string }
@Component({
    templateUrl: './candidate-sms.component.html',
    styleUrls: ['../../../shared/custom-styles-mat-table.scss'],
    animations: [collectionInOut]
})
export class CandidateSmsComponent implements AfterViewInit, OnDestroy {

    private readonly toDestroy$ = new Subject<void>();

    private readonly cached: cachedDataType[] = [];
    private readonly cachedMessageBody: cachedDataType[] = [];

    displayedColumns = ['jobTitle', 'mobileNumber', 'sentDate', 'sentStatus', 'messageBody'];
    items: JobSeekerSmsModel[] = [];
    dataSource: MatTableDataSource<JobSeekerSmsModel> = new MatTableDataSource(null);
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    isLoadingResults = true;
    isLazyListLoading: boolean;
    activatedId: number;
    selectedId: number;

    query: QueryModel = { filters: [] };
    hasFilter: boolean = this.paramGen.hasFilter;

    constructor(
        private jsmService: CandidateSmsService,
        private cdr: ChangeDetectorRef,
        private dialog: MatDialog,
        private paramGen: ParamGenService,
    ) { }

    ngAfterViewInit() {
        this.query.paginator = {
            pageIndex: this.paginator.pageIndex + 1,
            pageSize: this.paginator.pageSize
        };

        this.initData();
        this.initEvents();

    }

    xpanChange(isExpanded: boolean, id: number, jsGuid: string) {

        if (!isExpanded) return;
        this.cdr.markForCheck();
        this.dataSource.data = [];
        const index = this.cached.findIndex(_ => _.id === id && _.guid === jsGuid);
        if (index > -1) {
            this.dataSource.data = this.cached[index].items;
            this.dataSource._updateChangeSubscription();
            return;
        }

        this.isLazyListLoading = true;

        this.jsmService.getSms(jsGuid).pipe(
            takeUntil(this.toDestroy$),
            delay(900)
        ).subscribe({
            next: res => {
                this.cdr.markForCheck();
                this.isLazyListLoading = false;
                const d: JobSeekerSmsModel[] = res.contentBody;
                this.cached.push({ id: id, guid: jsGuid, items: d });
                this.dataSource.data = d;
            }
        });
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    trackById = (_: number, item: JobSeekerSmsModel) => item.id;

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

        this.jsmService.getSmsBody(id, jsGuid).pipe(
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

        this.jsmService.getList().pipe(takeUntil(this.toDestroy$), delay(600)).subscribe({
            next: res => {
                this.cdr.markForCheck();
                const data: JobSeekerSmsModel[] = (res || []);
                this.items = data;
                this.paginator.length = (res.length || 0);
                this.isLoadingResults = false;
            },
            error: _ => [this.cdr.markForCheck(), this.isLoadingResults = false]

        });
    }

    // private initData() {
    //     this.cdr.markForCheck();
    //     this.items = [];
    //     this.isLoadingResults = true;

    //     this.jsmService.getGroupedSmsHeaders(this.query).pipe(takeUntil(this.toDestroy$), delay(600)).subscribe({
    //         next: res => {
    //             this.cdr.markForCheck();
    //             const data: JobSeekerSmsModel[] = (res.contentBody.items || []);
    //             this.items = data;
    //             this.paginator.length = (res.contentBody.totalItems || 0)
    //             this.isLoadingResults = false;
    //         },
    //         error: _ => [this.cdr.markForCheck(), this.isLoadingResults = false]

    //     });
    // }

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
