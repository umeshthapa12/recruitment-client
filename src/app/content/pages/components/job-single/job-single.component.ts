import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, HostBinding, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import Quill from 'quill';
import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';
import { catchError, debounceTime, delay, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ApplicationValidationModel, JobSeekerApplication, OpeningModel, ResponseModel, ValidationTypes } from '../../../../models';
import { ExtendedMatDialog, fadeIn } from '../../../../utils';
import { copyToClipboard } from '../../../../utils/generators/custom-utility';
import { ContentRef } from '../../store/page-store/display-type.enum';
import { ApplyForJobAction, PageContentAction, RightAsideApplyCardAction, RightAsideApplyCardClickedCallbackAction, RightAsideSimilarOpeningsAction, ScrollIntoApplySectionAction, UpdateFavJobIdsAction, GetAppliedIdsAction } from '../../store/page-store/page-actions';
import { ApplyClickedOptions, JobActions, JobsContentModel } from '../../store/page-store/page-model';
import { RightAsideApplyCardButtonState } from '../../store/page-store/page-state';
import { LoginComponent } from '../shared/login/login.component';
import { ProblemFormComponent } from '../shared/problem-reporter/form.component';
import { SharedJobService } from '../shared/services/shared-jobs.service';
import { SnackToastService } from '../shared/snakbar-toast/toast.service';
import { ApplyValidationInfoComponent } from './apply-validation-info.component';

@Component({
    selector: 'single-job',
    templateUrl: './job-single.component.html',
    animations: [fadeIn],
    styles: [`
        .mat-menu-item {
            line-height: 0 !important;
            height: 33px !important;
        }

        .icon-animator .icon-box {
            display: inline-flex;
            transition: transform .2s ease-in-out, box-shadow .2s ease-in-out;
        }

        .icon-animator a:hover .icon-box {
            transform: translate(-2px, 0px) scale(1.07) rotate(-5deg);
            box-shadow: 0.5px 0.5px 4px 0 rgba(100, 100, 100, 0.7);
        }

        .type-fixed-size {
            height: 22px;
            width: 22px;
        }

        .row-hover {
            transition: background .2s ease-in-out;
        }

        .row-hover .skills-badge {
            background: #f4f4f7;
        }

        .row-hover:hover {
            background: rgb(247, 250, 255);
        }

        .how-to-apply-wrapper {
            background: #304861;
            color: #fff;
            padding-top: 15px;
            padding-bottom: 15px;
            border-radius: 5px;
        }
	`]
})
export class JobSingleComponent implements OnInit, AfterViewInit, OnDestroy {
    @HostBinding('class') s = 'd-block';
    // cleanup
    private toDestroy$ = new Subject<void>();

    // job content
    content: OpeningModel;

    // more jobs from selected job's company
    moreJobsAtCurrentCompany = [];

    // job Id from the params -> :jobId
    currentId = +this.route.snapshot.params['jobId'];

    // invokes on each job selects to re-populate the component content
    private openingId = new BehaviorSubject<number>(+this.route.snapshot.params['jobId']);

    // slice of a simple cover state
    @Select((s: { scrollToApply: string; }) => s.scrollToApply)
    scrollToApply$: Observable<any>;

    // dark block of apply info
    @ViewChild('applySection')
    private applySection: ElementRef;

    @Select(RightAsideApplyCardButtonState)
    apply$: Observable<ApplyForJobAction>;

    isSpinning: boolean;
    activatedBtn: string;
    private matBotRef: MatBottomSheetRef<ApplyValidationInfoComponent, ResponseModel>;

    jsFavIds: number[] = [];
    @Select('listingJobs', 'favJobIds')
    jsFavJobId$: Observable<number[]>;

    appliedIds: number[] = [];
    @Select('listingJobs', 'appliedJobIds')
    readonly appliedJobId$: Observable<number[]>;

    private readonly cachedRenderedElKeys: string[] = [];

    constructor(
        private sJobService: SharedJobService,
        private store: Store,
        private route: ActivatedRoute,
        private router: Router,
        private notify: SnackToastService,
        private dialog: MatDialog,
        private exDialog: ExtendedMatDialog,
        private matBottom: MatBottomSheet,
        private snack: MatSnackBar

    ) {

        this.store.dispatch(new RightAsideSimilarOpeningsAction({
            jobTitle: this.route.snapshot.params['jobTitle'],
            id: this.currentId
        }));

        this.store.dispatch(new GetAppliedIdsAction());

        this.jsFavJobId$.pipe(takeUntil(this.toDestroy$))
            .subscribe({ next: ids => [this.jsFavIds = ids ? [...ids] : []] });

        // fromEvent(window, 'scroll').pipe(
        //     debounceTime(200),
        //     takeUntil(this.toDestroy$),
        //     map(_ => {

        //         const pageHeight = document.documentElement.offsetHeight,
        //             windowHeight = window.innerHeight,
        //             scrollPosition = window.scrollY || window.pageYOffset || document.body.scrollTop + (document.documentElement && document.documentElement.scrollTop || 0),
        //             totalScroll = (document.body.scrollHeight - pageHeight);


        //         if (scrollPosition === totalScroll) {
        //           console.log(pageHeight, windowHeight , scrollPosition, (document.body.scrollHeight - pageHeight));
        //         }
        //     })
        // ).subscribe();
    }

    ngOnInit() { this.initJob(); }

    appliedDisabled = () => this.appliedIds.includes(this.currentId);

    ngAfterViewInit() {

        this.initRouteEvent();

        this.initScrollToApply();

        this.rightAsideCardActions();

        this.appliedJobId$.pipe(
            debounceTime(300),
            takeUntil(this.toDestroy$)
        ).subscribe({ next: res => [this.appliedIds = res] });

    }

    renderQuillValue(el: HTMLElement, jsonValue: string, key: string) {

        // when angular change detection runs, quill might re-render. do not run multiple times
        if (this.cachedRenderedElKeys.includes(key)) return this.content.id;

        const q = new Quill(el, { readOnly: true });

        q.setContents(jsonValue ? JSON.parse(jsonValue) : []);
        el.contentEditable = 'false';
        const xel = el.querySelector('.ql-clipboard') as HTMLElement;
        if (xel) xel.contentEditable = 'false';

        this.cachedRenderedElKeys.push(key);

        return this.content.id;
    }

    scrollIntoToApplySection = () => this.store.dispatch(new ScrollIntoApplySectionAction(true));

    onActionButtonsClick(action: string) {
        this.activatedBtn = action;
        const config: ApplyClickedOptions = { actionClicked: true };

        switch (action) {

            case 'apply':
                // start spinner
                this.isSpinning = true;
                config.selectedAction = JobActions.ApplyNow;
                break;

            case 'save':
            case 'unsave':
                const x2 = this.jsFavIds.findIndex(i => i === this.currentId);
                this.sJobService.updateFav(this.currentId, x2 <= -1)
                    .pipe(
                        catchError(e => of(e)),
                        filter(res => !(res instanceof HttpErrorResponse)),
                        takeUntil(this.toDestroy$)
                    ).subscribe({ next: _ => this.store.dispatch(new UpdateFavJobIdsAction(this.currentId)) });
                return;

            case 'share-via-email':
                config.selectedAction = JobActions.ShareViaEmail;
                break;

            case 'share-via-facebook':
            case 'share-via-twitter':
                copyToClipboard((window.location.href || document.location.href));
                this.snack.open('Link copied to clipboard.', 'Close', { panelClass: ['bg-info'], duration: 10000 });
                return;

            case 'download-pdf':
                config.selectedAction = JobActions.DownloadPdf;
                break;
            case 'report-problem':
                this.dialog.open(ProblemFormComponent, { disableClose: true });
                return;
        }

        this.store.dispatch(new ApplyForJobAction(config));

    }

    ngOnDestroy() {

        this.cleanUpAndResetState();

        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    hasValue(prev: number[], currentId: number) {
        return prev && prev.indexOf(currentId) > -1;
    }

    private cleanUpAndResetState() {
        // remove the apply card from the dom
        this.store.dispatch(new RightAsideApplyCardAction({ render: false, displayLoading: false }));

    }

    private initScrollToApply() {
        this.scrollToApply$.pipe(
            takeUntil(this.toDestroy$), debounceTime(300),
            filter(_ => this.applySection && _ && _.scroll)
        ).subscribe({ next: _ => (<HTMLElement>this.applySection.nativeElement).scrollIntoView({ behavior: 'smooth', block: 'center' }) });
    }

    private initRouteEvent() {
        // get param ID when route event emits.
        this.router.events.pipe(takeUntil(this.toDestroy$), filter(event => event instanceof NavigationEnd)).subscribe({
            next: _ => {
                const jobId = +this.route.snapshot.params['jobId'];
                if (jobId > 0 && (this.currentId === 0 || this.currentId !== jobId)) {
                    this.currentId = jobId;
                    // refresh the job details based on job link param Id
                    this.openingId.next(jobId);
                }
            }
        });
    }

    private initJob() {
        this.openingId.pipe(
            debounceTime(200), takeUntil(this.toDestroy$), tap(_ => this.resetStates()),
            switchMap(id => this.sJobService.getJobById(id).pipe(takeUntil(this.toDestroy$))),
            filter(_ => _.contentBody !== undefined), delay(1000)
        ).subscribe({
            next: res => {
                const o: OpeningModel = res.contentBody;
                this.content = res.contentBody;
                // prep content for the simple cover
                const d: JobsContentModel = {
                    contentModel: {
                        companyLogoUrl: o.companyLogoUrl,
                        companyName: o.companyName,
                        companyWebsite: o.companyUrl,
                        jobTitle: o.jobTitle,
                        jobVisitCounts: o.visitCounts,
                        jobLikedCounts: o.likeCounts,
                        validUntil: o.expiresOn
                    },
                    contentRef: ContentRef.Single,
                    displayLoading: false
                };
                // finally the updated state
                this.store.dispatch(new PageContentAction(d));
                this.store.dispatch(new RightAsideApplyCardAction({ render: true, displayLoading: false }));
            }
        });
    }

    private resetStates() {
        // make viewport from the top on each job select or startup
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // cleanup to validate ngif on view
        this.content = null;

        // dispatch an action for the different components. such as top cover, right aside etc.,
        this.store.dispatch(new PageContentAction({ contentRef: ContentRef.Single, displayLoading: true }));

        this.store.dispatch(new RightAsideApplyCardAction({ displayLoading: true, render: true }));

    }

    private rightAsideCardActions() {

        this.apply$.pipe(
            filter(_ => !!(_ && _.config)),
            debounceTime(200),
            takeUntil(this.toDestroy$),
            map(_ => _ && _.config),
            switchMap(this.SwitchMapToApi),
            debounceTime(400)
            /* We have captured error and returned as obs to handle other process thus there is  no need to re-capture */
        ).subscribe({ next: this.onResponseMessage });

    }

    /** Switch stream to call API endpoint based on user action(s) */
    private SwitchMapToApi = (m: ApplyClickedOptions) => {
        if (this.matBotRef) this.matBotRef.dismiss();
        const dt: JobSeekerApplication = {
            openingId: this.currentId
        };
        switch (m.selectedAction) {

            case JobActions.ApplyNow:

                // 1) check whether the user is logged in
                // 2) display a login form
                if (this.currentId <= 0)
                    return throwError(<ResponseModel>({ messageBody: 'Identification of this opening is invalid.' }));

                // we have separate API post endpoint
                if (m.currentValidationFlag === ValidationTypes.criteria) {
                    return this.sJobService.applyByCriteriaConfirm(dt).pipe(
                        takeUntil(this.toDestroy$), catchError((er: ResponseModel) => of(er))
                    );
                }

                // Default API post endpoint where all validation happens.
                return this.sJobService.apply(dt).pipe(
                    takeUntil(this.toDestroy$), catchError((er: ResponseModel) => of(er))
                );

            case JobActions.DownloadPdf:
                const el = document.createElement('a');
                el.href = '/jobs/api/v2.0/Job/DownloadJobAsPdf/' + this.content.id;
                el.target = '_blank';
                document.body.appendChild(el);
                el.click();
                document.body.removeChild(el);
                return of({ messageBody: 'Please wait download in progress..' });

        }
    }

    /** Handle and process response message/object */
    private onResponseMessage = (res: ResponseModel) => {

        // emit an event with response object
        this.store.dispatch(new RightAsideApplyCardClickedCallbackAction(res));
        this.isSpinning = false;

        // forbid mean the user must get logged in
        const isForbid = res && res.status === 403;
        if (isForbid) {
            // display the login form
            const instance = this.dialog.open(LoginComponent, {
                disableClose: true,
                width: '430px'
            });

            this.exDialog.animateBackdropClick(instance);

            return false;
        }

        const avModel: ApplicationValidationModel = (res.contentBody || res.error && res.error.contentBody || {});

        switch (avModel.validationType) {

            case ValidationTypes.criteria:
            case ValidationTypes.mandatory:
            case ValidationTypes.dynamicForm:

                this.matBotRef = this.matBottom.open(ApplyValidationInfoComponent, {
                    ariaLabel: 'validator-info',
                    data: { response: res, openingId: this.currentId },
                    panelClass: ['px-0', 'pt-0', 'pb-0', 'bg-transparent', 'shadow-none'],
                    disableClose: true,
                    autoFocus: false
                });

                break;

            default:
                this.notify.when(res && res.status ? 'warn' : 'success', res);
                this.store.dispatch(new GetAppliedIdsAction());
                break;
        }
    }
}
