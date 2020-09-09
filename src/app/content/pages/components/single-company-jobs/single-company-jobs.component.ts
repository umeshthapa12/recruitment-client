import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Quill from 'quill';
import { of, Subject } from 'rxjs';
import { catchError, delay, takeUntil } from 'rxjs/operators';
import { OpeningModel } from '../../../../models';
import { SharedJobService } from '../shared/services/shared-jobs.service';
interface SocialAccounts { name: string; url: string; }
@Component({
    templateUrl: './single-company-jobs.component.html',
    styleUrls: ['./single-company-jobs.component.scss']
})
export class SingleCompanyJobsComponent implements AfterViewInit, OnDestroy {

    private readonly toDestroy$ = new Subject<void>();

    // whether to insert animated floating background boxes on the dom.
    floatingBox: boolean;

    // small cover image
    bgImage = 'url(assets/app/media/img/bg/building.jpg)';

    // list of jobs
    jobLists: any[];

    // object of an employer info
    content: any;

    isLoading: boolean = true;
    isError: boolean;
    socialAccounts: SocialAccounts[];

    @ViewChild('aboutC')
    readonly aboutCompany: ElementRef<HTMLDivElement>;

    constructor(
        private cdr: ChangeDetectorRef,
        private sJobService: SharedJobService,
        private route: ActivatedRoute
    ) { }

    ngAfterViewInit() {

        // init floating box css animation
        this.floatingBox = true;

        this.initJobsWithInfo();
    }

    // get and init job with employer info
    private initJobsWithInfo() {
        const employerId = +this.route.snapshot.params['id'];
        const self = this;

        this.sJobService.getCompanyJobs(employerId).pipe(catchError(_ => {
            this.cdr.markForCheck();
            self.isError = true;
            return of({ contentBody: null });
        }), delay(1000), takeUntil(this.toDestroy$)).subscribe({
            next: res => [
                this.cdr.markForCheck(),
                this.jobLists = this.itemTransformation(res.contentBody),
                this.isLoading = false,
                this.isError = !(res && res.contentBody)
            ]
        });
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    private itemTransformation(o: any[]): OpeningModel[] {
        if (!(o instanceof Array && o.length > 0)) return [];

        // items contains same employer info.
        this.content = o[0];

        // init quill data by parsing as a valid JSON.
        this.initQuill(this.content.aboutCompany);

        // we receive social account string  e.g. `facebook#www.facebook, youtube#www.youtube`
        if (this.content && this.content.socialAccounts) {
            const acc = (<string>this.content.socialAccounts).split(',');
            this.socialAccounts = acc.map(_ => {
                const d = (<string>_).split('#');
                if (!d) return null;
                return { name: d[0], url: d[1] };
            });
        }

        // transformation
        o.forEach(j => {

            // Comma separated values
            j.jobTypes = j.jobTypes ? (<string>j.jobTypes).split(',') : [];

            // stringified JSON values.
            j.skillKeywords = j.skillKeywords ? JSON.parse(j.skillKeywords) : [];
            j.companyLogoUrl = j.brandLogoUrl;

            //  j.aboutCompany = ab;
        });
        return o;
    }

    // Quill js stringified JSON data
    private initQuill(d: string) {
        if (!this.aboutCompany.nativeElement || !d) return;
        const q = new Quill(this.aboutCompany.nativeElement, {
            readOnly: true
        });
        q.setContents(JSON.parse(d));
    }

    // prepare icon color for popular social link
    getColor(n: string) {
        n = (n || '').trim().toLowerCase();
        return n === 'facebook' ? 'info' : n === 'youtube' ? 'danger' : n === 'twitter' ? 'accent' : n === 'linkedin' ? 'brand' : 'primary';
    }

    // populate icon
    getIcon(name: string) {

        const n = (name || '').trim().toLowerCase();

        switch (n) {
            case 'facebook':
                return 'fa-facebook-f';
            case 'twitter':
                return 'fa-twitter';
            case 'youtube':
                return 'fa-youtube';
            case 'linkedin':
                return 'fa-linkedin';
            default:
                return 'la-globe';
        }
    }
}
