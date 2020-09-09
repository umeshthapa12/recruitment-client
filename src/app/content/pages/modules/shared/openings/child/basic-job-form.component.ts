import { COMMA, ENTER, TAB } from '@angular/cdk/keycodes';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, Input, OnDestroy, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormControl, FormControlName, FormGroup, Validators } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Select, Store } from '@ngxs/store';
import * as moment from 'moment';
import Quill from 'quill';
import { Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, delay, distinctUntilChanged, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { DropdownModel } from '../../../../../../models';
import { ErrorCollection, ResponseModel } from '../../../../../../models/app.model';
import { JobLocationModel, JobTypeModel, OpeningModel } from '../../../../../../models/opening.model';
import { EmbeddedService } from '../../../../../../services/embedded.service';
import { fadeIn, GenericValidator, QuilljsService, validateBeforeSubmit } from '../../../../../../utils';
import { ChangesConfirmComponent } from '../../../../components/shared/changes-confirm/changes-confirm.component';
import { DropdownProviderService } from '../../../../components/shared/services/dropdown-provider.service';
import { JobService } from '../../../employer/jobs/jobs/job.service';
import { AddOrUpdateAction } from '../../../employer/jobs/jobs/store/opening.store';
import { MainComponent } from '../main.component';
import { SchedulePostConfirmComponent } from '../schedule-post-confirm-inline.component';
@Component({
    selector: 'basic-form',
    templateUrl: './basic-job-form.component.html',
    animations: [fadeIn],
    styles: [`
        .alert{
            display: flex;justify-content: space-between;flex-wrap: wrap
        }

        .custom-mat-chip{
            border-radius: 0 !important;
            padding: 1px 2px 1px 5px !important;
            line-height: 0.3;
            font-size: 11px;
            min-height: 20px;
            background: #eaeaea
        }
        .mat-option {
            display: block;
            padding: 0 16px;
            text-align: left;
            text-decoration: none;
            max-width: 100%;
            position: relative;
            cursor: pointer;
            outline: 0;
            display: flex;
            flex-direction: row;
            height:auto;
            max-width: 100%;
            box-sizing: border-box;
            align-items: center;
            -webkit-tap-highlight-color: transparent;
            line-height: normal;
            padding-top:7px;
            padding-bottom:7px;
            white-space: normal;
            font-size:12px;
        }
    `]
})
export class BasicJobFormComponent implements OnInit, AfterViewInit, OnDestroy {

    // destroyer
    private toDestroy$ = new Subject<void>();

    // form
    private genericValidator: GenericValidator;
    @ViewChildren(FormControlName, { read: ElementRef })
    private formInputElements: ElementRef[];
    displayMessage: any = {};
    basicJobForm: FormGroup;

    // element refs
    @ViewChild('jobDesc', { static: true })
    private jobDescEl: ElementRef;


    @ViewChild('applyProced', { static: true })
    private applyProcEl: ElementRef;

    @ViewChild('jobSpecificAndReq', { static: true })
    private jobSpecificAndReq: ElementRef;

    @ViewChild('preferred', { static: true })
    private preferred: ElementRef;

    @ViewChild('benefits', { static: true })
    private benefits: ElementRef;

    // error stats
    isError: boolean;
    responseMessage: string;
    errors: ErrorCollection[];
    isWorking: boolean;
    isLoading: boolean;

    // mat chips
    separatorKeysCodes: number[] = [ENTER, COMMA, TAB];
    filteredOptions: Observable<string[]>;
    filteredOption: Observable<string[]>;
    locations: JobLocationModel[] = [];
    skills: string[] = [];
    skillsCtrl = new FormControl();
    locationCtrl = new FormControl();
    @ViewChild('autoSkills') autoComplete: MatAutocomplete;
    @ViewChild('skillsInput', { static: true }) skillsInput: ElementRef<HTMLInputElement>;
    @ViewChild('autoLocation') matAutocomplete: MatAutocomplete;
    @ViewChild('locationInput', { static: true }) locationInput: ElementRef<HTMLInputElement>;
    searching: boolean;
    search: boolean;

    // pre-loaded dropdowns
    @Select('dropdowns', 'jobCategories') categories$: Observable<DropdownModel[]>;
    @Select('dropdowns', 'experienceLevel') experienceLevel$: Observable<DropdownModel[]>;
    @Select('dropdowns', 'openingServiceTypes') openingServiceType$: Observable<DropdownModel[]>;
    @Select('dropdowns', 'maritalStatus') maritalStatus$: Observable<DropdownModel[]>;

    // job type
    jobTypes: JobTypeModel[] = [];
    @Select('dropdowns', 'jobTypes')
    jobType$: Observable<DropdownModel[]>;

    @Select('openings', 'AddOrUpdate') addOrUpdate$: Observable<ResponseModel>;

    // quilljs instances
    private quill: [{ formControlName?: string, quillInstance?: Quill }] = [null];

    /**
     * Whether the edit type as draft, reopen, etc.,
     */
    @Input() editType: string;

    constructor(
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<MainComponent>,
        private dialog: MatDialog,
        private quillService: QuilljsService,
        private emService: EmbeddedService,
        private jService: JobService,
        private drop: DropdownProviderService,
        private store: Store,
        @Inject(MAT_DIALOG_DATA)
        public data: { isBasic: boolean, id: number, isEdit: boolean }
    ) {
        this.genericValidator = new GenericValidator({
            'jobTitle': {
                'required': 'This field is required.'
            },
            'jobDescription': {
                'required': 'This field is required.'
            },
            'jobLocations': {
                'required': 'This field is required.'
            },
            'noOfOpenings': {
                'required': 'This field is required.'
            },
            'publishedOn': {
                'required': 'This field is required.'
            },
            'expiresOn': {
                'required': 'This field is required.'
            },
            'jobTypes': {
                'required': 'This field is required.'
            },
            'jobCategoryId': {
                'required': 'This field is required.'
            },
            'experienceLevel': {
                'required': 'This field is required.'
            },
            'openingServiceType': {
                'required': 'This field is required.'
            },

            'skillKeywords': {
                'required': 'This field is required.'
            },
            'applyProcedure': {
                'required': 'This field is required.'
            },
            'maxAge': {
                'pattern': 'Numbers only. E.G. 20, 25, 30',
                'maxlength': 'Length limit exceed.',
            },
            'minAge': {
                'pattern': 'Numbers only. E.G. 20, 25, 30',
                'maxlength': 'Length limit exceed.',
            }
        });

        this.jobType$.pipe(takeUntil(this.toDestroy$))
            .subscribe({ next: d => this.jobTypes = d.map(_ => <JobTypeModel>{ jobTypeId: _.key, jobType: _.value }) });
    }

    ngOnInit() {

        this.initForm();

        // When a post has been created and dialog keeps open, The next submit should be the update
        this.addOrUpdate$.pipe(debounceTime(100), filter(_ => _ && _.contentBody), takeUntil(this.toDestroy$))
            .subscribe({
                next: res => {
                    const idCtrl = this.basicJobForm.get('id');
                    idCtrl.setValue(this.data && this.data.id > 0 ? this.data.id : res.contentBody && res.contentBody.id);
                    idCtrl.updateValueAndValidity();
                }
            });
    }

    ngAfterViewInit() {

        this.genericValidator
            .initValidationProcess(this.basicJobForm, this.formInputElements)
            .subscribe({ next: m => [this.cdr.markForCheck(), this.displayMessage = m] });

        this.initQuillTextEditor();

        this.filteredOptions = this.locationCtrl.valueChanges.pipe(
            distinctUntilChanged(),
            tap(val => this.searching = val),
            debounceTime(400),
            filter(v => v),
            switchMap(value => this.drop.getLocationBySearchTerm(value)),
            tap(_ => this.searching = false)
        );

        this.filteredOption = this.skillsCtrl.valueChanges.pipe(
            distinctUntilChanged(),
            tap(val => this.search = val),
            debounceTime(400),
            filter(v => v && this.skills.length <= 6),
            switchMap(value => this.drop.getSkillTagsBySearchTerm(value)),
            tap(_ => this.search = false)
        );

        if (this.data && this.data.id > 0)
            this.initLoadData();

        // auto post as draft
        this.basicJobForm.get('jobDescription').valueChanges.pipe(
            debounceTime(1000),
            takeUntil(this.toDestroy$), filter(_ => this.basicJobForm.valid && !(this.data && this.data.id > 0)),
            map(_ => {
                // custom transformation for POST
                const body: OpeningModel = this.basicJobForm.value;
                body.jobTypes = this.getJobTypes();
                body.jobLocations = this.locations;
                body.skillKeywords = this.skills;
                body.status = 'Drafted';

                // date transformation
                body.publishedOn = moment(body.publishedOn).format('MM-DD-YYYY');
                body.expiresOn = moment(body.expiresOn).format('MM-DD-YYYY');
                return body;
            }),
            switchMap(body => this.jService.addOrUpdateOpening(body).pipe(
                catchError(er => {
                    this.cdr.markForCheck(),
                        this.isError = true,
                        this.responseMessage = (er && er.error.messageBody);
                    return of(er);
                })
            )),

        ).subscribe({
            next: res => {

                if (res instanceof HttpErrorResponse) return;

                // update the ID prop
                const d: OpeningModel = res.contentBody;
                this.basicJobForm.get('id').setValue((d && d.id || 0));
            }
        });
    }

    private initLoadData() {
        of(this.data.id).pipe(filter(id => id > 0), delay(100), tap(_ => this.isLoading = true), switchMap(id => this.jService.getOpening(id)), takeUntil(this.toDestroy$), delay(800), tap(_ => this.isLoading = false), filter(res => res && res.contentBody), takeUntil(this.toDestroy$)).subscribe({
            next: res => this.patchForm(res.contentBody),
            error: _ => this.isLoading = false
        });
    }

    private quillImageHandler = (q: Quill) => {

        const input = document.createElement('input');

        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            const fd = new FormData();

            fd.append('file', file);

            // Save current cursor state
            const range = q.getSelection(true);

            // Insert temporary loading placeholder image
            q.insertEmbed(range.index, 'image', `/assets/media/misc/loader.gif`, 'api');

            // Move cursor to right side of image (easier to continue typing)
            range.index + 1;
            q.setSelection(range);

            const resourceUrl = await this.emService.uploadEmbed(fd); // API post, returns image location as string e.g. 'http://www.example.com/images/foo.png'

            // Remove placeholder image
            q.deleteText(range.index, 1);

            // Insert uploaded image
            q.insertEmbed(range.index, 'image', resourceUrl.contentBody);
        };

    }

    private initQuillTextEditor() {

        const jd = this.quillService
            .initQuill(this.jobDescEl, { placeholder: 'Job description body' })
            .textChangeValueSetter(this.basicJobForm.get('jobDescription'), 'json')
            .getQuillInstance();
        this.quill.push({ formControlName: 'jobDescription', quillInstance: jd });
        jd.getModule('toolbar').addHandler('image', (isImage) => [isImage ? this.quillImageHandler(jd) : null]);

        const withExcluded = this.quillService.defaultToolbar().except(['image', 'video']);

        const ap = this.quillService
            .initQuill(this.applyProcEl, { placeholder: 'Apply Procedure body: Guide to drop a CV or online application.', modules: { toolbar: withExcluded } })
            .textChangeValueSetter(this.basicJobForm.get('applyProcedure'), 'json')
            .getQuillInstance();
        this.quill.push({ formControlName: 'applyProcedure', quillInstance: ap });

        const js = this.quillService
            .initQuill(this.jobSpecificAndReq, { placeholder: 'Job specification / requirements body (optional)', modules: { toolbar: withExcluded } })
            .textChangeValueSetter(this.basicJobForm.get('jobSpecification'), 'json')
            .getQuillInstance();
        this.quill.push({ formControlName: 'jobSpecification', quillInstance: js });

        const p = this.quillService
            .initQuill(this.preferred, { placeholder: 'Preferred body (optional)', modules: { toolbar: withExcluded } })
            .textChangeValueSetter(this.basicJobForm.get('preferred'), 'json')
            .getQuillInstance();
        this.quill.push({ formControlName: 'preferred', quillInstance: p });

        const b = this.quillService
            .initQuill(this.benefits, { placeholder: 'Benefits body (optional)', modules: { toolbar: withExcluded } })
            .textChangeValueSetter(this.basicJobForm.get('benefits'), 'json')
            .getQuillInstance();
        this.quill.push({ formControlName: 'benefits', quillInstance: b });
    }

    private patchQuillText(d: OpeningModel) {
        this.quill.filter(q => q).forEach(q => {
            switch (q.formControlName) {
                case 'jobDescription':
                    q.quillInstance.setContents(d.jobDescription ? JSON.parse(d.jobDescription) : []);
                    break;
                case 'jobSpecification':
                    q.quillInstance.setContents(d.jobSpecification ? JSON.parse(d.jobSpecification) : []);
                    break;
                case 'preferred':
                    q.quillInstance.setContents(d.preferred ? JSON.parse(d.preferred) : []);
                    break;
                case 'benefits':
                    q.quillInstance.setContents(d.benefits ? JSON.parse(d.benefits) : []);
                    break;

                case 'applyProcedure':
                    q.quillInstance.setContents(d.applyProcedure ? JSON.parse(d.applyProcedure) : []);
                    break;
            }
        });

    }

    add(event: MatChipInputEvent) {


        // Add location only when MatAutocomplete is not open
        // To make sure this does not conflict with OptionSelected Event
        if (this.matAutocomplete && this.matAutocomplete.isOpen) return;

        const input = event.input;
        const value = (event.value || '').trim();
        const index = this.locations.findIndex(_ => _.location === value);

        // Add our location
        if (!(index > -1) && value)
            this.locations.push({ location: value.trim() });

        // Reset the input value
        if (input)
            input.value = '';

        this.basicJobForm.get('jobLocations').setValue(this.locations.length > 0 ? this.locations : null);
    }

    addSkills(e: MatChipInputEvent) {
        // Add location only when MatAutocomplete is not open
        // To make sure this does not conflict with OptionSelected Event
        if (this.autoComplete && this.autoComplete.isOpen) return;


        const value = (e.value || '').trim();
        const index = this.skills.findIndex(val => val === value);

        // Add our location
        if (!(index > -1) && value && this.skills.length <= 6)
            this.skills.push(value.trim());

        // Reset the input value
        if (e.input)
            e.input.value = '';

        this.basicJobForm.get('skillKeywords').setValue(this.skills.length > 0 ? this.skills : null);
    }

    removeSkills(s: string) {
        const index = this.skills.findIndex(val => val === s);
        if (index >= 0)
            this.skills.splice(index, 1);

        this.basicJobForm.get('skillKeywords').setValue(this.skills.length > 0 ? this.skills : null);
    }

    selectedSkills(event: MatAutocompleteSelectedEvent) {
        this.cdr.markForCheck();
        this.skillsCtrl.reset(null);
        this.skillsInput.nativeElement.value = null;
        const value = event.option.viewValue;
        const index = this.skills.findIndex(val => val === value);
        if (index > -1 || this.skills.length >= 6) return;

        this.skills.push(value);

        this.search = false;
        this.basicJobForm.get('skillKeywords').setValue(this.skills.length > 0 ? this.skills : null);
    }

    remove(location: string) {
        const index = this.locations.findIndex(_ => _.location === location);
        if (index > -1)
            this.locations.splice(index, 1);

        this.basicJobForm.get('jobLocations').setValue(this.locations.length > 0 ? this.locations : null);
    }

    selected(event: MatAutocompleteSelectedEvent) {
        this.cdr.markForCheck();
        this.locationCtrl.reset(null);
        this.locationInput.nativeElement.value = null;
        const value = event.option.viewValue;
        const index = this.locations.findIndex(_ => _ === value);
        if (!(index > -1))
            this.locations.push({ location: value });

        this.searching = false;
        this.basicJobForm.get('jobLocations').setValue(this.locations.length > 0 ? this.locations : null);
    }

    submitClicked(action: string) {

        this.cdr.markForCheck();

        this.clearErrors();
        // invalid form without filling required fields
        const errorMessage = validateBeforeSubmit(this.basicJobForm);
        this.isError = errorMessage && errorMessage.length > 0;
        this.responseMessage = errorMessage;
        if (errorMessage) return false;

        const isScheduled = action === 'schedule';

        if (!isScheduled) {
            this.basicJobForm.get('status').setValue('Active');
            this.saveChanges();
            return false;
        }

        const instance = this.dialog.open(SchedulePostConfirmComponent, { autoFocus: false });
        const shDate = instance.componentInstance.dControl;
        const exDate = instance.componentInstance.expiryDControl;

        // get and set scheduled date from confirm dialog & submit
        instance.afterClosed().pipe(takeUntil(this.toDestroy$), filter(yes => yes)).subscribe({
            next: _ => {
                // set schedule date to the form
                this.basicJobForm.get('scheduledPublishDate')
                    .setValue(moment(shDate.value).format('MM-DD-YYYY'));

                // set schedule date to the form
                this.basicJobForm.get('expiresOn')
                    .setValue(moment(exDate.value).format('MM-DD-YYYY'));

                // actual data of status dropdown
                this.basicJobForm.get('status').setValue('Scheduled');
                this.saveChanges();
            }
        });
    }

    private saveChanges() {

        // custom transformation for POST
        const body: OpeningModel = this.basicJobForm.value;
        body.jobTypes = this.getJobTypes();
        body.jobLocations = this.locations;
        body.skillKeywords = this.skills;

        // date transformation
        body.expiresOn = moment(body.expiresOn).format('MM-DD-YYYY');

        // in some cases we need to render as html thus save as html too.
        body.htmlContent = {
            jobDescription: this.quill.find(_ => _ && _.formControlName == 'jobDescription').quillInstance.root.innerHTML,
            jobSpecification: this.quill.find(_ => _ && _.formControlName == 'jobSpecification').quillInstance.root.innerHTML,
            benefits: this.quill.find(_ => _ && _.formControlName == 'benefits').quillInstance.root.innerHTML,
            preferred: this.quill.find(_ => _ && _.formControlName == 'preferred').quillInstance.root.innerHTML,
            applyProcedure: this.quill.find(_ => _ && _.formControlName == 'applyProcedure').quillInstance.root.innerHTML,
        };

        this.isWorking = true;

        this.jService.addOrUpdateOpening(body).pipe(
            delay(600),
            takeUntil(this.toDestroy$),
        ).subscribe({
            next: res => {
                // update to the cached reference array
                this.store.dispatch(new AddOrUpdateAction(res));
                if (this.data.isBasic)
                    this.dialogRef.close(res);

                this.basicJobForm.markAsPristine();
                this.isWorking = false;
            },
            error: e => {

                this.cdr.markForCheck();
                this.isError = true;
                this.isWorking = false;
                const model: ResponseModel = e.error;
                const errors: ErrorCollection[] = model.contentBody.errors;

                // Check if server returning number of error list, if so make these as string
                if (errors && errors.length > 0) {
                    this.errors = errors;
                    this.responseMessage = model.messageBody;
                }
            }
        });

    }

    cancel() {
        if (this.basicJobForm.dirty) {
            this.dialog.open(ChangesConfirmComponent).afterClosed()
                .pipe(
                    filter(_ => _)
                ).subscribe(_ => this.dialogRef.close());
        } else {
            this.dialogRef.close();
        }
    }

    clearErrors() {
        this.cdr.markForCheck();
        this.isError = false;
        this.responseMessage = null;
        this.errors = null;
        this.isWorking = false;
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
        this.data = null;
    }

    private getJobTypes() {

        const ids: number[] = this.basicJobForm.get('jobTypes').value;
        return this.jobTypes.filter(_ => ids.includes(_.jobTypeId));
    }

    private initForm() {
        this.basicJobForm = this.fb.group({
            id: 0,
            jobTitle: [null, Validators.required],
            jobDescription: [null, Validators.required],
            applyProcedure: null,
            jobSpecification: null,
            preferred: null,
            benefits: null,
            experienceLevel: [null, Validators.required],
            defaultExperience: null,
            jobLocations: [null, Validators.required],
            skillKeywords: [null, Validators.required],
            jobTypes: [null, Validators.required],
            jobCategoryId: [null, Validators.required],
            salary: null,
            noOfOpenings: [null, Validators.required],
            scheduledPublishDate: null,
            expiresOn: [null, Validators.required],
            openingServiceType: [null, Validators.required],
            minAge: [null, [Validators.pattern(/^\d+$/), Validators.maxLength(2)]],
            maxAge: [null, [Validators.pattern(/^\d+$/), Validators.maxLength(2)]],
            gender: null,
            maritalStatus: null,
            status: null
        });

        this.basicJobForm.valueChanges.pipe(
            takeUntil(this.toDestroy$),
        ).subscribe(_ => [this.dialogRef.disableClose = this.basicJobForm.dirty]);
    }

    private patchForm(d: OpeningModel) {

        this.basicJobForm.patchValue({
            id: d.id,
            jobTitle: d.jobTitle,
            jobDescription: d.jobDescription,
            jobSpecification: d.jobSpecification,
            preferred: d.preferred,
            benefits: d.benefits,
            experienceLevel: d.experienceLevel,
            jobLocations: d.jobLocations,
            applyProcedure: d.applyProcedure,
            skillKeywords: d.skillKeywords,
            defaultExperience: d.defaultExperience,

            // we've bind [value]='number' thus select numbers only.
            jobTypes: d.jobTypes.map(_ => _.jobTypeId),
            jobCategoryId: d.jobCategoryId,
            salary: d.salary,
            noOfOpenings: d.noOfOpenings,
            expiresOn: d.expiresOn,
            openingServiceType: d.openingServiceType,
            minAge: d.minAge,
            maxAge: d.maxAge,
            gender: d.gender,
            maritalStatus: d.maritalStatus
        });

        // custom patch chips
        this.skills = d.skillKeywords;
        this.locations = d.jobLocations;

        // custom patch quill JS plugin
        this.patchQuillText(d);
    }
}
