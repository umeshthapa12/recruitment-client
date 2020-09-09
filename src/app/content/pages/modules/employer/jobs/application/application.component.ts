import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Store } from '@ngxs/store';
import * as moment from 'moment';
import { merge, of, range, Subject } from 'rxjs';
import { debounceTime, delay, filter, map, mergeMap, switchMap, takeUntil } from 'rxjs/operators';
import { Filter, QueryModel } from '../../../../../../models';
import { ApplicationsModel } from '../../../../../../models/application.model';
import { JobSeekerMessage } from '../../../../../../models/job-seeker-message.model';
import { collectionInOut, CustomAnimationPlayer, ExtendedMatDialog, fadeIn, fadeInOutStagger, ParamGenService } from '../../../../../../utils';
import { DeleteConfirmComponent } from '../../../../components/shared/delete-confirm/delete-confirm.component';
import { SnackToastService } from '../../../../components/shared/snakbar-toast/toast.service';
import { ApplicationService } from '../../../shared/application.service';
import { MessageFormComponent } from '../../../shared/messaging/message-form.component';

@Component({
    templateUrl: './application.component.html',
    animations: [fadeInOutStagger, fadeIn, collectionInOut],
    styleUrls: ['../../../shared/shared.scss']
})
export class ApplicationComponent implements AfterViewInit, OnDestroy {

    private readonly toDestroy$ = new Subject<void>();

    displayedColumns = ['details', 'select', 'id', 'jobTitle', 'fullName', 'appliedOn', 'isEligible', 'status', 'action'];
    dataSource: MatTableDataSource<ApplicationsModel> = new MatTableDataSource(null);
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    selection = new SelectionModel<ApplicationsModel>(true, []);
    expandedElement: ApplicationsModel | null;

    isLoadingResults = true;

    // request query
    query: QueryModel = { filters: [] };

    get hasFilter() {
        return this.paramGen.hasFilter;
    }

    expandUpdate: boolean;

    isDownloading: boolean;

    constructor(
        private mService: ApplicationService,
        private cdr: ChangeDetectorRef,
        private dialog: MatDialog,
        private notify: SnackToastService,
        private dialogUtil: ExtendedMatDialog,
        private paramGen: ParamGenService,
        private store: Store,
        private cap: CustomAnimationPlayer,
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

    rowDetailExpand(row: ApplicationsModel) {
        this.expandedElement = this.expandedElement === row ? null : row;
    }

    trackById = (_: number, item: ApplicationsModel) => item.id;

    rowHeight(row: ApplicationsModel) {
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
        this.cdr.markForCheck();
        this.isAllSelected() ?
            this.selection.clear() :
            this.dataSource.data.forEach(row => this.selection.select(row));
    }

    onAction(id: number, jsGuid: string, action: string) {
        let instance: any;
        const mapped = this.selection.selected.map(a => <JobSeekerMessage>{ applicationId: a.id, jobSeekerGuid: a.jobSeekerGuid });
        // we post a list of user details to send message so we share fn for checked lists too
        const d: JobSeekerMessage[] = this.selection.hasValue()
            ? mapped
            : [{ applicationId: id, jobSeekerGuid: jsGuid }];

        const config = {
            width: '1000px',
            maxHeight: '90vh',
            data: d,
            autoFocus: false,

        };
        switch (action) {
            case 'message':

                // create instance and reuse
                const ins = this.dialog.open(MessageFormComponent, config);
                instance = ins;

                // do after close
                ins.afterClosed().pipe(
                    takeUntil(this.toDestroy$),
                    filter(_ => _)
                ).subscribe({
                    next: res => [
                        this.cdr.markForCheck(),
                        this.selection.clear(),
                        this.notify.when('success', res)
                    ],
                    error: e => this.notify.when('danger', e)
                });

                break;
        }

        this.dialogUtil.animateBackdropClick(instance);

    }

    onDelete(id: number) {

        const instance = this.dialog.open(DeleteConfirmComponent);
        instance.afterClosed()
            .pipe(
                takeUntil(this.toDestroy$),
                filter(yes => yes),
                switchMap(() => this.mService.deleteApp(id)
                    .pipe(takeUntil(this.toDestroy$)))
            )
            .subscribe({
                next: res => {
                    this.cdr.markForCheck();
                    const index = this.dataSource.data.findIndex(_ => _.id === id);
                    if (index > -1) {
                        this.dataSource.data.splice(index, 1);
                        // decrease the length of total items
                        this.paginator.length--;
                    }
                    this.expandUpdate = this.dataSource.data.length <= 10;

                    this.notify.when('success', res);
                    this.dataSource._updateChangeSubscription();
                },
                error: e => this.notify.when('danger', e)
            });

    }

    getPdfLink(id: number, uuid: string) {
        return `/Employer/api/v2.0/Application/GetApplicantPdf/${id}/${uuid}`;
    }

    downloadPdf() {

        if (this.isDownloading) return;

        this.cdr.markForCheck();

        const sLen = this.selection.selected.length;
        let indexer = 0;
        this.isDownloading = sLen >= 1;

        range(0, sLen).pipe(
            map(index => this.selection.selected[index]),
            mergeMap(row => this.mService.generatePdf(row.id, row.jobSeekerGuid)),
            takeUntil(this.toDestroy$),
            delay(sLen + 90),
        ).subscribe({
            next: blob => {
                this.cdr.markForCheck();
                const info = this.selection.selected[indexer];

                let downloadURL = window.URL.createObjectURL(blob);
                let link = <HTMLAnchorElement>document.querySelector('#pdf-downloader');
                link.href = downloadURL;
                link.download = `${info.fullName.replace(' ', '-')}_${info.jobTitle.replace(' ', '-')}_${moment(new Date()).format('YYYY-MM-DDThh:mm:ss:sss')}`;

                link.click();

                indexer++;
                this.isDownloading = indexer !== sLen;

                // clear the selection
                if (indexer === sLen) {
                    this.selection.clear();
                    this.notify.when('success', { messageBody: 'Selected applications are converted to PDF.' });
                }
            }
        });
    }

    resetFilters() {
        this.cdr.markForCheck();
        this.selection.clear();

        if (this.sort) {
            this.sort.active = null;
            this.sort.direction = null;
        }
        this.query = { filters: [], sort: null };
        this.paramGen.clearParams();

        setTimeout(_ => this.initData(), 200);

        this.dataSource._updateChangeSubscription();
    }

    filter(f: Filter, column: string) {

        this.cdr.markForCheck();

        this.selection.clear();

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

        this.mService.getApps(this.query).pipe(takeUntil(this.toDestroy$), delay(600)).subscribe({
            next: res => {
                this.cdr.markForCheck();
                const data: ApplicationsModel[] = (res.contentBody.items || []);
                this.dataSource.data = data;
                this.paginator.length = (res.contentBody.totalItems || 0);
                this.isLoadingResults = false;
                this.expandUpdate = data.length <= 10;
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
            if ((<Sort>event).direction) {

                // reset paginator to default when sort happens
                this.query.paginator = { pageIndex: 1, pageSize: this.paginator.pageSize };

                this.query.sort = [{ column: this.sort.active, direction: this.sort.direction }];
            } else {
                this.query.sort = null;
                this.query.paginator = { pageIndex: this.paginator.pageIndex + 1, pageSize: this.paginator.pageSize };
            }


            this.initData();
        });
    }
}
