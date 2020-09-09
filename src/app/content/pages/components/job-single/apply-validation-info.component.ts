import { CdkDrag } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { delay, takeUntil, tap } from 'rxjs/operators';
import { ApplicationValidationModel, ControlBase, ControlOptions, ControlTypes, ResponseModel, ValidationTypes } from '../../../../models';
import { ExtendedMatDialog } from '../../../../utils';
import { ApplyForJobAction } from '../../store/page-store/page-actions';
import { JobActions } from '../../store/page-store/page-model';
import { SharedJobService } from '../shared/services/shared-jobs.service';
import { SnackToastService } from '../shared/snakbar-toast/toast.service';
import * as moment from 'moment';
@Component({
    templateUrl: './apply-validation-info.component.html',
    styles: [`
        .q-rows{
            transition: box-shadow .3s ease-in;
            padding: 5px 10px 0 10px; margin-bottom: 15px; margin-top: 5px;
        }
        .q-rows:hover{
            box-shadow: 0 0px 1px #dddddd;
        }
    `]
})
export class ApplyValidationInfoComponent implements OnInit, OnDestroy {

    private readonly toDestroy$ = new Subject<void>();

    avModel: ApplicationValidationModel;
    vTypes = ValidationTypes;
    isError: boolean;

    // mandatory validation error messages
    mandatory: [{ key?: string, value?: string[] }];
    criteria: [{ key?: string, value?: { message: string, data: any[] } }];

    @ViewChild(CdkDrag, { static: true }) private drag: CdkDrag;

    questions: ControlBase[] = [];
    isWorking: boolean;

    constructor(
        private cdr: ChangeDetectorRef,
        private extDialog: ExtendedMatDialog,
        private store: Store,
        private sJobService: SharedJobService,
        @Inject(MAT_BOTTOM_SHEET_DATA)
        public data: { response: ResponseModel, openingId: number },
        public matButtonSheetRef: MatBottomSheetRef<ApplyValidationInfoComponent>,
        private notify: SnackToastService
    ) {

        const res = data.response;

        this.avModel = (res.contentBody || res.error && res.error.contentBody || {});
        this.isError = (res.error || res.errors) ? true : false;

    }

    ngOnInit() {

        // util
        this.extDialog.animateBackdropClick(this.matButtonSheetRef)
            .makeTransparentWhenDragMove(this.drag);

        if (this.avModel.validationType === ValidationTypes.mandatory) {
            (<[{ key: string, value: string[] }]>this.avModel.content)
                .slice()
                .sort((a, b) => b.value.length - a.value.length)
                .forEach(el => {

                    const index = this.mandatory && this.mandatory.findIndex(_ => _.key === el.key);
                    if (index > -1) this.mandatory[index] = { key: el.key, value: [].concat(this.mandatory[index].value, el.value) };
                    else this.mandatory ? this.mandatory.push(el) : this.mandatory = [el];
                });
        } else if (this.avModel.validationType === ValidationTypes.criteria) {
            this.criteria = this.avModel.content;
        } else {
            const q: ControlBase[] = this.avModel.content;

            // Since we're saving the user's input from the form, We've to add `.value` prop to map input.
            const output = q.map(el =>
                ({ ...el, value: '', options: el.options && el.options.length > 0 ? this.valueSet(el.options.slice()) : null })
            );
            this.questions = output;
        }

    }

    /** Adds `value` property to the object so we can bind user input */
    private valueSet = (c: ControlOptions[]) => c.map(el => ({ ...el, value: '' }));

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    /**
     * Method to apply from the criteria confirmation
     */
    notEligibleApply() {
        // Ineligible post after criteria validation done
        this.store.dispatch(new ApplyForJobAction({
            selectedAction: JobActions.ApplyNow,
            currentValidationFlag: ValidationTypes.criteria
        })).pipe(takeUntil(this.toDestroy$), tap(_ => this.isWorking = true), delay(400))
            .subscribe({ next: _ => [this.cdr.markForCheck(), this.isWorking = false] });
    }

    /**
     * Method to apply for a position from questionnaire form submission.
     */
    submitForm() {

        const isInvalid = this.isInvalidQuestionnaire();

        // means the required data yet to enter
        if (isInvalid) return false;

        // Submit the questionnaire form and apply
        this.sJobService.applyWhenValidationDone(this.prepPayloadBody()).pipe(
            takeUntil(this.toDestroy$),
            delay(400), tap(_ => this.isWorking = false)
        ).subscribe({
            next: res => [
                this.cdr.markForCheck(),
                this.isWorking = false,
                this.matButtonSheetRef.dismiss(),
                this.notify.when('success', res)
            ],
            error: e => [
                this.cdr.markForCheck(),
                this.isWorking = false,
                this.notify.when('danger', e)
            ]
        });
    }

    /**
     * creates helper text with html tag to navigate profile sections
     * @param key value of server response.
     */
    getTextWithSectionLink(key: string) {
        let html: string;
        switch (key) {
            case 'ageRange':
            case 'gender':
            case 'maritalStatus':
                html = `Update from <a class="m-link m-link--info" href="/jobseeker/my/profile" target="_blank" title="Take me there"> profile </a> section`;
                break;
            case 'defaultExperience':
                html = `Update from <a class="m-link m-link--info" href="/jobseeker/my/work" target="_blank" title="Take me there"> work experience </a> section`;
                break;
            case 'qualification':
                html = `Update from <a class="m-link m-link--info" href="/jobseeker/my/qualification" target="_blank" title="Take me there"> qualification </a> section`;
                break;
            case 'experienceLevel':
            case 'skillKeywords':
            case 'jobType':
            case 'location':
                html = `Update from <a class="m-link m-link--info" href="/jobseeker/my/job-preference" target="_blank" title="Take me there"> job preference </a> section`;
                break;

        }

        return html;

    }

    /**
     * Checks whether the required field has value
     */
    private isInvalidQuestionnaire() {

        const keys: string[] = [];
        const obj = this.questions;
        let html: HTMLElement;

        for (let i = 0; i < obj.length; i++) {
            const el = obj[i];
            if (el.type === ControlTypes.checkbox) {
                if (el.options && el.required) {
                    const isValid = el.options.filter(_ => _.value).length > 0;
                    if (!isValid) {
                        keys.push(el.key);
                        html = document.getElementById(el.key);
                    }
                }
            } else {
                if (el.required && (el.value === '' || el.value === null)) {
                    html = document.getElementById(el.key);
                    keys.push(el.key);
                }
            }

            if (html)
                html.classList.add('m--font-danger');
        }

        if (html) html.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // clear error states
        setTimeout(_ => keys.forEach(i => document.getElementById(i).classList.remove('m--font-danger')), 10000);

        return keys.length > 0;
    }

    private prepPayloadBody() {
        // we are extracting necessary data for the API post.
        const obj = this.questions;
        interface AnswerModel { question: string; answer: string[]; options?: string[]; }
        const questionnaireContent: AnswerModel[] = [];
        for (let i = 0; i < obj.length; i++) {
            const el = obj[i];
            if (!el) continue;

            const model: AnswerModel = {
                question: el.label,
                answer: (el.type === ControlTypes.checkbox ? el.options.filter(_ => _.value).map(_ => _.label) : [el.value instanceof Date ? moment(el.value).format('MMM DD, YYYY') : el.value])
            };

            if (el.options && el.options.length > 0)
                model.options = el.options && el.options.map(_ => _.label);

            questionnaireContent.push(model);

        }

        this.isWorking = true;

        // main payload to submit
        return {
            openingId: this.data.openingId,
            questionnaire: questionnaireContent,
            // indicates all the validations has been done thus apply as ineligible.
            isValidationDone: true
        };
    }
}
