import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, OnDestroy } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { debounceTime, filter, takeUntil, tap } from 'rxjs/operators';
import { ResponseModel, VwSitePageNavStoreModel, PublicNavDirectionTypes, PublicNavModel } from '../../../models';
import { SingleJobTopMetadata } from '../../../models/job-title-metadata';
import { fadeIn } from '../../../utils';
import { DropdownProviderService } from '../../pages/components/shared/services/dropdown-provider.service';
import { ContentRef } from '../../pages/store/page-store/display-type.enum';
import { JobsContentModel } from '../../pages/store/page-store/page-model';
import { JobsState } from '../../pages/store/page-store/page-state';
@Component({
    selector: 'simple-page-cover',
    templateUrl: './simple-page-cover.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [fadeIn],
    styles: [`
        .simple-cover-wrapper{
            min-height: 150px;
            position: relative;
            background:rgba(47,120,218,1);
			background: -webkit-linear-gradient(34deg, rgba(47,120,218,1) 0%, rgba(57,194,212,1) 100%);
			background: linear-gradient(34deg, rgba(47,120,218,1) 0%, rgba(57,194,212,1) 100%);
			width: 100%;
			margin-top: 70px;
            color: #fff;
            display: flex;
            flex-wrap: wrap;
            align-items: flex-end;
        }

        .cover-bg{
            background-image:url(assets/app/media/img/bg/building.jpg);
            background-repeat:no-repeat;
            background-size:cover;
            background-position:bottom;
            height: 100%;
            width: 100%;
        }

        .cover-overlay{
            background: linear-gradient(90deg, rgba(22, 38, 53, 0.75) 0%, rgba(5, 37, 85, 0.77) 50%, rgba(255, 255, 255, 0) 100%);
        }

        @media (min-width: 1400px){
            .container-wrapper-max-with {
            width: 1280px !important;
        }}

        @media(min-width: 1025px){
            .simple-cover-wrapper-desktop{
                margin-bottom: -120px;
                margin-top: 105px;
            }


        }
        .x-container{
            height: 100%;     padding-top: 0px !important;
        }

    `]
})
export class SimplePageCoverComponent implements OnDestroy, AfterViewInit {

    @HostBinding('class') s = 'd-block';

    private toDestroy$ = new Subject<void>();

    // slice of a simple cover state
    @Select(JobsState) coverContent: Observable<JobsContentModel>;

    // job type information of listing
    displayContent: string;

    // display the listing content initially
    isListContent = true;

    // information of single job
    jobMeta: SingleJobTopMetadata;

    // display the content placeholder based on the state (.displayLoading) passed from the dispatched
    isLoading: boolean;

    @Select('userLogin', 'employerInfo')
    readonly employer$: Observable<ResponseModel>;

    @Select('pageCoverNavBar', 'navData')
    readonly nav$: Observable<PublicNavModel[]>;

    constructor(private cdr: ChangeDetectorRef) { }

    ngAfterViewInit() {

        this.coverContent.pipe(
            debounceTime(100),
            takeUntil(this.toDestroy$),
            tap(_ => [this.clearLocalStates(_), this.isLoading = _ && _.displayLoading]),
            filter(_ => _ && _ !== null)
        ).subscribe(_ => {
            this.cdr.markForCheck();
            _.contentRef === ContentRef.Single
                ? this.jobMeta = _.contentModel
                : this.displayContent = _.content;
        });

    }

    // clear the local states
    private clearLocalStates(_: JobsContentModel) {
        this.cdr.markForCheck();
        this.displayContent = null;
        this.isListContent = _ && _.contentRef === ContentRef.List;
        this.jobMeta = null;
    }

    updateMinHeight() {
        this.cdr.markForCheck();
        return { 'min-height': !this.isListContent ? '250px' : '' };
    }

    externalUrl(url: string) {
        if (!url) return '';

        return url.search(/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g) > -1 ? url
            : `http://${url}`;
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
        this.clearLocalStates(null);
    }

    mappedNavForCoverPage = (nav: PublicNavModel[] = []) => {
		const d = nav.find(_ => +_.direction === PublicNavDirectionTypes.OverCoverImageHorizontal);
		if (!d) return [];

		return d.items;
	}

}


