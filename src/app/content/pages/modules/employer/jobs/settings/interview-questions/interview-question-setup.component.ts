import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Store } from '@ngxs/store';
import { merge, of, Subject } from 'rxjs';
import { debounceTime, delay, filter, takeUntil } from 'rxjs/operators';
import { Filter, QueryModel } from '../../../../../../../models';
import { collectionInOut, ExtendedMatDialog, fadeIn, fadeInOutStagger, ParamGenService } from '../../../../../../../utils';
import { DeleteConfirmComponent } from '../../../../../components/shared/delete-confirm/delete-confirm.component';
import { SnackToastService } from '../../../../../components/shared/snakbar-toast/toast.service';
import { InterviewQuestionSetupFormComponent } from './interview-q-setup-form.component';
import { InterviewSetupService } from './interview-setup.service';

@Component({
    templateUrl: './interview-question-setup.component.html',
    styleUrls: ['../../../../shared/shared.scss'],
    animations: [collectionInOut, fadeIn, fadeInOutStagger]
})
export class InterviewQuestionSetupComponent implements AfterViewInit, OnDestroy {
    private readonly toDestroy$ = new Subject<void>();

    constructor(
        private dService: InterviewSetupService,

        private cdr: ChangeDetectorRef,
        private dialog: MatDialog,
        private notify: SnackToastService,
        private dialogUtil: ExtendedMatDialog,
        private paramGen: ParamGenService,
        private store: Store,
    ) { }

    displayedColumns = ['details', 'title', 'difficulty', 'noOfQuestions', 'pass', 'full', 'action'];
    dataSource: MatTableDataSource<any> = new MatTableDataSource(null);
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    expandedElement: any | null;

    isLoadingResults = true;
    query: QueryModel = { filters: [] };
    hasFilter: boolean = this.paramGen.hasFilter;

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
        //  this.store.dispatch(new LoadLazyOpeningAction(row.id));
    }

    trackById = (_: number, item: any) => item.id;

    rowHeight(row: any) {
        return this.expandedElement === row ? { 'min-height': 'auto' } : { 'min-height': '0', 'border': '0' };
    }

    onAction(id: number, action: string) {
        const isDelete = action === 'delete';
        const isAdd = action === 'add';
        const config: MatDialogConfig = {
            height: '700px',
            width: '900px'
        };

        if (isDelete) {
            this.onDelete(id);
            return;
        }
        if (isAdd) {
            this.dialog.open(InterviewQuestionSetupFormComponent, config);
            return;
        }

        // this.instance = this.dialog.open(MainComponent, {
        //     width: 'calc(100% - 20px)',
        //     maxHeight: '99%',
        //     data: {
        //         id: id, guid: guid,
        //         isEdit: id > 0,
        //         editType: 'draft-edit',
        //     },
        //     autoFocus: false,
        // });

        // this.dialogUtil.animateBackdropClick(this.instance);

    }

    textState(difficulty: string) {
        switch ((difficulty || '').toLocaleLowerCase()) {
            case 'beginner':
                return 'm--font-success';
            case 'easy':
            case 'normal':
                return 'm--font-info';
            case 'hard':
                return 'm--font-warning';
            case 'very hard':
                return 'm--font-danger';
        }
    }

    private onDelete(id: number) {

        const instance = this.dialog.open(DeleteConfirmComponent);
        instance.afterClosed()
            .pipe(
                takeUntil(this.toDestroy$),
                filter(yes => yes),
                //  switchMap(_ => this.jService.deleteOpening(id))
            ).subscribe({
                next: res => {
                    this.dataSpliceUpdate(id);

                    this.notify.when('success', res);

                    // since we keep track on added/updated object, we have to cleanup from the history too.
                    //   this.store.dispatch(new AddOrUpdateAction({}))
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
        this.dService.getInterviewQuestions(this.query).pipe(takeUntil(this.toDestroy$), delay(600)).subscribe({
            next: res => {
                this.cdr.markForCheck();
                const data: any[] = (res.contentBody.items || []);
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
