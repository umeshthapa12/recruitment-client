import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { merge, of, Subject } from 'rxjs';
import { debounceTime, delay, takeUntil } from 'rxjs/operators';
import { environment } from '../../../../../../../../environments/environment';
import { Filter, QueryModel } from '../../../../../../../models';
import { QuestionnaireAnswersModel } from '../../../../../../../models/application.model';
import { collectionInOut, ParamGenService } from '../../../../../../../utils';
import { AnsListComponent } from './ans-list.component';
import { OnlineScreeningService } from './online-screening.service';

@Component({
    templateUrl: './online-screening.component.html',
    animations: [collectionInOut],
    styles: [`
        .mat-card-title {
            font-size: 16px;
        }
        .x-badge{
            position: absolute;
            top: 0;
            right: 0;
            border-radius: 0;
            box-shadow: 1px 1px 3px 0 #EEE;
        }
        .m-type{
            height: 24px;
            width: 24px;
        }

        .x-icon{
            transition: transform .2s cubic-bezier(.32,.8,.93,.79);
        }
        .x-btn:hover .x-icon{
            transform:  translate(3px,-3px) scale(1.05) rotate(15deg);
        }

        .list-wrap {
            display: block;
            position: relative;
            min-height: 50vh;
            overflow-y: auto;
            overflow-x: hidden;
            z-index: 1;
        }
    `]
})
export class OnlineScreeningComponent implements AfterViewInit, OnDestroy {

    private readonly toDestroy$ = new Subject<void>();

    items: QuestionnaireAnswersModel[] = [];
    private cachedItems: { jsGuid: string, items: QuestionnaireAnswersModel[] }[] = [];

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    isLoadingResults = true;

    // request query
    query: QueryModel = { filters: [] };
    hasFilter: boolean = this.paramGen.hasFilter;

    constructor(
        private cdr: ChangeDetectorRef,
        private oqService: OnlineScreeningService,
        private paramGen: ParamGenService,
        private dialog: MatDialog
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

    view(jsGuid: string) {

        const mConfig: MatDialogConfig = {
            autoFocus: false,
            minWidth: '45%',
            width: '800px',
        };

        const index = this.cachedItems.findIndex(_ => _.jsGuid === jsGuid);
        if (index > -1) {
            mConfig.data = this.cachedItems[index].items;
            this.dialog.open(AnsListComponent, mConfig);
            return;
        }

        this.oqService.getQuestionnaireOpeningTitles(jsGuid)
            .subscribe({
                next: res => {
                    this.cachedItems.push({ jsGuid: jsGuid, items: res.contentBody });
                    this.dialog.open(AnsListComponent, {
                        autoFocus: false,
                        minWidth: '45%',
                        width: '800px',
                        data: mConfig.data = res.contentBody
                    });
                }
            });

    }

    getUrl(u: string) {
        if (!u) return;
        return `${environment.baseUrl}/${u}`;
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

        if (index > -1) this.query.filters[index] = fl;
        else this.query.filters.push(fl);

        this.initData();
    }

    private initData() {
        this.cdr.markForCheck();
        this.items = [];
        this.isLoadingResults = true;

        this.oqService.getQuestionnaireAns(this.query).pipe(takeUntil(this.toDestroy$), delay(600)).subscribe({
            next: res => {
                this.cdr.markForCheck();
                const data: QuestionnaireAnswersModel[] = (res.contentBody.items || []);
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
