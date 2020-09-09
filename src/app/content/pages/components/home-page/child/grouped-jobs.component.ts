import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, ViewChild } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { Subject } from 'rxjs';
import { delay, takeUntil } from 'rxjs/operators';
import { Filter, FilterCondition, GroupedJobsModel, JobServiceTypeModel, QueryModel, ResponseModel, OpeningModel } from '../../../../../models';
import { collectionInOut, fadeIn } from '../../../../../utils';
import { CustomUtil } from '../../../../../utils/generators/custom-utility';
import { SharedJobService } from '../../shared/services/shared-jobs.service';

@Component({
    selector: 'grouped-jobs',
    templateUrl: './grouped-jobs.component.html',
    animations: [collectionInOut, fadeIn],
    styles: [`
        .parent-btn-hover-child-transform span{
            transition: all .2s ease-in-out;
        }
        .parent-btn-hover-child-transform:hover span{
            transform:  translate(4px,-2px) scale(1.05) rotate(6deg);
            box-shadow: 0px 0px 2px 0px rgba(81, 77, 92, 0.7);
        }
        .type-fixed-size{
            height:22px;
            width:22px;
        }
        .border-roundless{
            border-radius:0;
        }
	`]
})
export class GroupedJobsComponent implements OnChanges, AfterViewInit, OnDestroy {

    private toDestroy$ = new Subject<void>();

    @Input() jobServiceTitle: JobServiceTypeModel;

    updated: JobServiceTypeModel;

    @ViewChild(MatExpansionPanel) panel: MatExpansionPanel;
    isExpanded: boolean = true;
    isLoading: boolean = true;

    chunkL: GroupedJobsModel[] = []; // left items
    chunkR: GroupedJobsModel[] = []; // right items

    query: QueryModel = {
        filters: [],
        paginator: { pageSize: 24 }
    };

    hasMore: boolean;
    isContent: boolean = true;

    @Output() dataInit = new EventEmitter();

    constructor(
        private cdr: ChangeDetectorRef,
        private sjService: SharedJobService,
        private customUtil: CustomUtil) { }

    ngOnChanges() {
        this.cdr.markForCheck();
        this.updated = this.jobServiceTitle;
    }

    togglePanels() {
        if (!this.panel) return;
        this.panel.expanded ?
            this.panel.accordion.closeAll() : this.panel.accordion.openAll();
        this.isExpanded = this.panel.expanded;
    }

    onAnimDone() {
        setTimeout(() => {
            if (this.panel)
                this.panel.accordion.openAll();
        }, 200);
    }

    createCompanyLink(job: OpeningModel) {
        let str = job.companyName.toLocaleLowerCase().replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '-').replace(/\-{2,}/g, '-');
        if (str.lastIndexOf('-') > -1)
            str = str.substring(0, str.lastIndexOf('-'));
        return `/company/${job.employerId}/${str}`;
    }

    ngAfterViewInit() { this.init();  }

    private init(value?: string) {

        this.cdr.markForCheck();
        // cleanup and loader
        this.isLoading = true;
        this.chunkL = [];
        this.chunkR = [];

        this.query.filters = [...this.prepFilters(value)];

        this.sjService.getGroupedJobs(this.query).pipe(takeUntil(this.toDestroy$), delay(800)).subscribe({
            next: this.result,
            error: _ => [
                this.cdr.markForCheck(),
                this.isLoading = false,
                this.isContent = this.jobServiceTitle.keyword === 'top-jobs'
            ]
        });
    }

    /**
     * Search char in these columns
     * @param searchTerm Search term char
     */
    private prepFilters(searchTerm: string): Filter[] {

        const defaultFl: Filter[] = [];

        if (!searchTerm)
            defaultFl.unshift({
                column: 'openingServiceType', condition: FilterCondition.Equal, firstValue: this.jobServiceTitle.keyword
            });

        const filters: Filter[] = [
            {
                column: 'jobTitle', condition: FilterCondition.Contains, firstValue: searchTerm, keyword: 'or'
            },
            {
                column: 'skillKeywords', condition: FilterCondition.Contains, firstValue: searchTerm, keyword: 'or'
            },
            {
                column: 'companyName', condition: FilterCondition.Contains, firstValue: searchTerm, keyword: 'or'
            },
            {
                column: 'companyAddress', condition: FilterCondition.Contains, firstValue: searchTerm, keyword: 'or'
            }];

        if (searchTerm)
            return defaultFl.concat(filters);

        return defaultFl;

    }

    private result = (res: ResponseModel) => {
        this.cdr.markForCheck();

        this.isLoading = false;
        const r: GroupedJobsModel[] = (res.contentBody && res.contentBody.items);
        const hasLen = (r && r.length > 0);
        this.dataInit.emit({ hasLen: hasLen, keyword: this.jobServiceTitle.keyword });
        this.isContent = hasLen;
        if (!hasLen) return;

        this.hasMore = res.contentBody.hasMore;
        const ch = this.customUtil.SplitToChunk<GroupedJobsModel>(r, 2);
        this.chunkL = ch[0];
        this.chunkR = ch[1];

    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }
}
