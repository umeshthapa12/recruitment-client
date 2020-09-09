import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { Subject } from 'rxjs';
import { delay, takeUntil } from 'rxjs/operators';
import { OpeningModel, ResponseModel } from '../../../../../../models';
import { collectionInOut, fadeIn, RandomUnique } from '../../../../../../utils';
import { SharedJobService } from '../../../shared/shared-jobs.service';

@Component({
    templateUrl: './vs-job-list.component.html',
    animations: [collectionInOut, fadeIn]
})
export class VsJobListComponent implements OnInit, OnDestroy {
    private readonly toDestroy$ = new Subject<void>();

    items: any[] = [];
    removedResponse: ResponseModel;

    constructor(
        private cdr: ChangeDetectorRef,
        @Inject(MAT_BOTTOM_SHEET_DATA)
        public data: string,
        private jService: SharedJobService,
        private rand: RandomUnique
    ) { }

    ngOnInit() {
        switch (this.data) {
            case 'fav':
                this.jService.getFavJobs(true).pipe(takeUntil(this.toDestroy$)).subscribe({
                    next: res => [this.cdr.markForCheck(),
                    this.items = res.contentBody.items,
                    this.items.forEach(el => el.uid = this.rand.uid())]
                });
                break;
            case 'match':
                this.jService.getMatchingJobs(true).pipe(takeUntil(this.toDestroy$)).subscribe({
                    next: res => [this.cdr.markForCheck(),
                    this.items = res.contentBody.items,
                    this.items.forEach(el => el.uid = this.rand.uid())]
                });
                break;
            case 'apply':
                this.jService.getAppliedJobs(true).pipe(takeUntil(this.toDestroy$)).subscribe({
                    next: res => [this.cdr.markForCheck(),
                    this.items = res.contentBody.items,
                    this.items.forEach(el => el.uid = this.rand.uid())]
                });
                break;
        }
    }

    trackByFn = (_: any, index: any) => index;

    createJobLink(job: OpeningModel) {
        const str = job.jobTitle.toLocaleLowerCase().replace(/[^\w\s]|\s+/g, '-').replace(/\-{2,}/g, '-');
        const url = `/job/${job.openingId}/${str}`;
        return url;
    }

    onRemove(id: number, uid: string) {

        this.clearMsg();

        this.jService.removeFavJob(id).pipe(
            delay(600),
            takeUntil(this.toDestroy$)
        ).subscribe({
            next: res => {
                this.cdr.markForCheck();
                this.removedResponse = res;
                const index = this.items.findIndex(_ => _.uid === uid);
                if (index > -1 && this.items) {
                    this.items.splice(index, 1);
                    this.items = [...this.items];
                }
            }
        });
    }

    clearMsg() {
        this.cdr.markForCheck();
        this.removedResponse = null;
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }
}
