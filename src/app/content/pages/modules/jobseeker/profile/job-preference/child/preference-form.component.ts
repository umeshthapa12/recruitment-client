import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControlName, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { delay, filter, takeUntil } from 'rxjs/operators';
import { DropdownModel, ErrorCollection, ResponseModel } from '../../../../../../../models';
import { AddNowClickElementFocuserService } from '../../../../../../../services/addnow-click-element-focuser.service';
import { GenericValidator, validateBeforeSubmit } from '../../../../../../../utils';
import { ChangesConfirmComponent } from '../../../../../components/shared/changes-confirm/changes-confirm.component';
import { DropdownProviderService } from '../../../../../components/shared/services/dropdown-provider.service';
import { CurrencyCodes, JobPrefModel } from '../../../../shared/models';
import { PreferenceService } from '../preference.service';

@Component({
    selector: 'app-preference-form',
    templateUrl: './preference-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    animations: [
        trigger('fadeInOutErrors', [
            transition('* => *', [ // each time the binding value changes
                query(':leave', [
                    style({ opacity: 1, transform: 'translate(0,0)' }),
                    stagger('100ms reverse', [
                        animate('0.2s', style({ opacity: 0, transform: 'translate(0, -5px)' }))
                    ]),

                ], { optional: true }),
                query(':enter', [
                    style({ opacity: 0, transform: 'translate(0, -5px)' }),
                    stagger('100ms', [
                        animate('0.2s', style({ opacity: 1, transform: 'translate(0, 0)' })),

                    ])
                ], { optional: true }),
            ])
        ])
    ],
    styles: [`
        .mat-form-field {
            width: 100%;
        }
       #salary-wrap .mat-form-field-outline-start, #salary-wrap .mat-form-field-outline-end{
            border-radius: 0 !important;
        }

        #salary-wrap .i--font-bold:before{
            font-weight: bold;
        }
    `]
})

export class PreferenceFormComponent implements OnInit, AfterViewInit, OnDestroy {

    private toDestroy$ = new Subject<void>();

    @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
    preferenceForm: FormGroup;
    private genericValidator: GenericValidator;
    displayMessage: { [key: string]: string } | any = {};
    @ViewChild('summaryEditor') summaryElement: ElementRef;

    isError: boolean;
    responseMessage: string;
    errors: ErrorCollection[];

    // show/hide form submission process spinner
    isWorking: boolean;

    jobCategories: DropdownModel[] = [];
    expeLevel: DropdownModel[] = [];

    jobTypes: DropdownModel[] = [];
    paymentCurrency = CurrencyCodes.Codes;
    paymentBasis: DropdownModel[] = [
        { key: 'Hourly', value: 'Hourly' },
        { key: 'Daily', value: 'Daily' },
        { key: 'Weekly', value: 'Weekly' },
        { key: 'Monthly', value: 'Monthly' },
        { key: 'Yearly', value: 'Yearly' },
    ];

    // TODO: autocomplete suggestion for user inputs
    // Must populate value when user starts to type
    locations: DropdownModel[] = [];
    specialization: DropdownModel[] = [];
    skills: DropdownModel[] = [];

    constructor(
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder,
        private pService: PreferenceService,
        private dropdownService: DropdownProviderService,
        private elementFocuser: AddNowClickElementFocuserService,
        private dialog: MatDialog,
        private dialogRef: MatDialogRef<PreferenceFormComponent>,
        @Inject(MAT_DIALOG_DATA)
        private data: { focusToElem: string, content: JobPrefModel }
    ) {
        this.genericValidator = new GenericValidator({
            'jobCategories': {
                'required': 'This field is required.'
            },
            'jobType': {
                'required': 'This field is required.'
            },
            'prefLocation': {
                'required': 'This field is required.'
            },
            'careerSummary': {
                'required': 'This field is required.'
            }
        });


        this.initDropdowns();

    }

    ngOnInit() {
        this.pform();

        if (this.data.content)
            this.patchFormValue(this.data.content);

        this.preferenceForm.valueChanges.pipe(
            takeUntil(this.toDestroy$),
        ).subscribe(_ => [this.dialogRef.disableClose = this.preferenceForm.dirty || this.preferenceForm.invalid]);
    }

    ngAfterViewInit() {

        this.genericValidator
            .initValidationProcess(this.preferenceForm, this.formInputElements)
            .subscribe(m => this.displayMessage = m);

        this.elementFocuser.initFocusEmptyElement(this.data.focusToElem, this.formInputElements);
    }

    clearErrors() {
        this.cdr.markForCheck();
        this.isError = false;
        this.responseMessage = null;
        this.errors = null;
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    compareWith = (o1: DropdownModel, o2: DropdownModel) => o1.key === o2.key;

    onSubmit() {

        // invalid form without filling required fields
        const errorMessage = validateBeforeSubmit(this.preferenceForm, document.getElementById('res-messages'));
        this.isError = errorMessage && errorMessage.length > 0;
        this.responseMessage = errorMessage;
        if (errorMessage) return false;

        this.isWorking = this.preferenceForm.valid;

        // we really don't want to post client process extra data to the payload so we remove them
        let body = this.GetMemberOnly(new JobPrefModel(), this.preferenceForm.value);

        body = this.mutationPayload(body);

        this.pService.updateJobPref(body).pipe(
            takeUntil(this.toDestroy$),
            delay(1000)
        ).subscribe(res => [this.isWorking = false, this.dialogRef.close(res)], e => {

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

        });
    }

    onCancel() {
        if (this.preferenceForm.dirty) {
            this.dialog.open(ChangesConfirmComponent).afterClosed()
                .pipe(filter(_ => _))
                .subscribe(_ => this.dialogRef.close());
        } else {
            this.dialogRef.close();
        }
    }

    private pform() {
        this.cdr.markForCheck();
        this.preferenceForm = this.fb.group({
            id: 0,
            jobCategories: [null, [Validators.required]],
            skills: null,
            experienceLevel: [null, Validators.required],
            jobType: [null, [Validators.required]],
            specialization: null,
            prefLocation: [null, [Validators.required]],

            // nepali NPR is default seleted
            xCurrency: this.paymentCurrency[0].currencyCode,
            xSalary: null,
            // monthly is default selected
            xType: this.paymentBasis[3].key,

            // nepali NPR is default seleted
            cCurrency: this.paymentCurrency[0].currencyCode,
            cSalary: null,
            // monthly is default selected
            cType: this.paymentBasis[3].key,

            title: null,

            careerSummary: [null, [Validators.required]],
            // it being updated from parent
            jobSearchStatus: this.data && this.data.content && this.data.content.jobSearchStatus
        });

    }

    private patchFormValue(d: JobPrefModel) {
        this.cdr.markForCheck();
        this.preferenceForm.patchValue({
            id: d.id,
            jobCategories: d.jobCategories.map(_ => _.key),
            skills: d.skills,
            experienceLevel: d.experienceLevel,
            jobType: d.jobType,
            specialization: d.specialization,
            prefLocation: d.prefLocation,
            xCurrency: d.salaries && d.salaries.expected.currencyCode.trim(),
            xSalary: d.salaries && d.salaries.expected.amount,
            xType: d.salaries && d.salaries.expected.paymentBasis,
            cCurrency: d.salaries && d.salaries.current.currencyCode.trim(),
            cSalary: d.salaries && d.salaries.current.amount,
            cType: d.salaries && d.salaries.current.paymentBasis,
            title: d.title,
            careerSummary: d.careerSummary,
            jobSearchStatus: d.jobSearchStatus
        });
        // const v = this.preferenceForm.get('xCurrency').value;
        // console.log(this.paymentCurrency.find(_ => _.currencyCode === 'NPR'), v==='NPR');
    }

    // HTTP payload mutation as needed
    private mutationPayload(body: JobPrefModel): JobPrefModel {

        // get/set values from client property
        body.salaries = {
            current: {
                amount: this.preferenceForm.get('cSalary').value,
                paymentBasis: this.preferenceForm.get('cType').value,
                currencyCode: this.preferenceForm.get('cCurrency').value
            },
            expected: {
                amount: this.preferenceForm.get('xSalary').value,
                paymentBasis: this.preferenceForm.get('xType').value,
                currencyCode: this.preferenceForm.get('xCurrency').value
            }
        };

        // since we have different process of chips, we set array of numbers from there
        const jc: number[] = this.preferenceForm.get('jobCategories').value;

        // must set  key/value pair
        body.jobCategories = this.jobCategories.filter(e1 => jc.includes(e1.key as number));

        return body;
    }

    private initDropdowns() {
        this.dropdownService.getJobCategories().pipe(takeUntil(this.toDestroy$)).subscribe(j => [this.cdr.markForCheck(), this.jobCategories = j]);
        this.dropdownService.getExperienceLevel().pipe(takeUntil(this.toDestroy$)).subscribe(e => [this.cdr.markForCheck(), this.expeLevel = e]);
        this.dropdownService.getJobTypes().pipe(takeUntil(this.toDestroy$)).subscribe(t => [this.cdr.markForCheck(), this.jobTypes = t]);
    }

    private GetMemberOnly<TClass>(cls: TClass, obj: any): TClass {

        for (const key in obj) {
            if (cls.hasOwnProperty(key)) {
                cls[key] = obj[key];
            }
        }
        return cls;
    }
}
