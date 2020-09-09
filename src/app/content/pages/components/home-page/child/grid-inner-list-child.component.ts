import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit } from '@angular/core';
import { OpeningModel } from '../../../../../models';
import { collectionInOut } from '../../../../../utils';



@Component({
    // tslint:disable-next-line:component-selector
    selector: 'grid-inner-list',
    templateUrl: './grid-inner-list-child.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [collectionInOut],
    styles: [`
    .font-dark{
        color:#575962 !important
    }
    `]
})
export class GridInnerListComponent implements OnInit, OnChanges {
    @Input()
    openings: any[] = [];

    limitedItems = [];
    state = 'more';
    constructor(private cdr: ChangeDetectorRef) { }

    ngOnChanges() {
        if (this.openings.length > 0) {
            this.limitedItems = this.openings.slice(0, 2);
        }
    }

    seeMoreJobs() {

        this.cdr.markForCheck();

        if (this.state === 'more') {
            this.limitedItems = this.openings.slice();
            this.state = 'less';
        } else {
            this.limitedItems = this.openings.slice(0, 2);
            this.state = 'more';
        }
    }

    ngOnInit() { }

    createJobLink(job: OpeningModel) {
        const str = job.jobTitle.toLocaleLowerCase().replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '-').replace(/\-{2,}/g, '-');
        const url = `/job/${job.id}/${str}`;
        return url;
    }

}
