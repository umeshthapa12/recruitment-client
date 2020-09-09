import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, Input } from '@angular/core';
import { Subject, timer } from 'rxjs';
import { delay, takeUntil, switchMap } from 'rxjs/operators';
import { GroupedJobsModel, JobServiceTypeModel } from '../../../../../models';
import { CustomUtil } from '../../../../../utils/generators/custom-utility';
import { SharedJobService } from '../../shared/services/shared-jobs.service';

@Component({
    selector: 'newspaper-jobs',
    templateUrl: './newspaper.component.html',
    styles: [`
        .font-dark{
            color:#575962 !important
        }
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
export class NewsPapersComponent implements OnInit, AfterViewInit, OnDestroy {

    private readonly toDestroy$ = new Subject<void>();

    hasItems: boolean;

    chunkL: GroupedJobsModel[] = []; // left items
    chunkR: GroupedJobsModel[] = []; // right items

    @Input() jobServiceTitle: JobServiceTypeModel;
    hasMore: boolean;


    constructor(
        private cdr: ChangeDetectorRef,
        private customUtil: CustomUtil,
        private sjService: SharedJobService
    ) { }

    ngOnInit() { }

    ngAfterViewInit() {
        /**-----------------------------------------------------
             Note: To list all of the available opening service type keywords,
             refer to this @link /shared/api/v2.0/Dropdowns/GetOpeningServiceTypes
         ----------------------------------------------------- */
        timer(100).pipe(
            switchMap(_ => this.sjService.getNewspaperJobs({
                filters: [{
                    column: 'openingServiceType',
                    condition: 'eq',

                    firstValue: 'newspaper-jobs'
                }]
            })),
            takeUntil(this.toDestroy$),
            delay(2000)
        ).subscribe({
            next: res => {
                this.cdr.markForCheck();
                const r: GroupedJobsModel[] = res.contentBody.items;
                const hasLen = r && r.length > 0;
                this.hasItems = hasLen;
                this.hasMore = res.contentBody.hasMore;

                if (!hasLen) return;

                const ch = this.customUtil.SplitToChunk<GroupedJobsModel>(r, 2);
                this.chunkL = ch[0];
                this.chunkR = ch[1];
            }
        });
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

}
