import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChildren } from '@angular/core';
import { FormBuilder, FormControlName, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { debounceTime, delay, filter, takeUntil } from 'rxjs/operators';
import { WorkExperienceModel } from '../work.model';
import { WorkService } from '../work.service';
import { fadeIn, GenericValidator, validateBeforeSubmit } from '../../../../../../../utils';
import { ErrorCollection, DropdownModel, ResponseModel } from '../../../../../../../models';
import { DropdownProviderService } from '../../../../../components/shared/services/dropdown-provider.service';
import { AddNowClickElementFocuserService } from '../../../../../../../services/addnow-click-element-focuser.service';
import { ChangesConfirmComponent } from '../../../../../components/shared/changes-confirm/changes-confirm.component';

@Component({
    selector: 'app-work-form',
    templateUrl: './work-form.component.html',
    animations: [fadeIn],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkFormComponent implements OnInit, AfterViewInit, OnDestroy {

    workForm: FormGroup;

    private toDestroy$ = new Subject<void>();

    isError: boolean;
    responseMessage: string;
    errors: ErrorCollection[];
    isWorking: boolean;

    @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
    private genericValidator: GenericValidator;
    displayMessage: any = {};

    level: DropdownModel[] = [];
    category: DropdownModel[] = [];
    noticePeriod: string[] = [
        '5 Days or less',
        '1 Month',
        '2 Months',
        '3 Months',
        'More than 3 months',
    ];

    maxDate = new Date();

    constructor(
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder,
        private wService: WorkService,
        private dialog: MatDialog,
        private dropdown: DropdownProviderService,
        private elementFocuser: AddNowClickElementFocuserService,
        private dialogRef: MatDialogRef<WorkFormComponent>,
        @Inject(MAT_DIALOG_DATA)
        public data: { focusToElem: string, id: number }
    ) {
        this.genericValidator = new GenericValidator({
            'organization': {
                'required': 'This field is required.'
            },
            'jobCategory': {
                'required': 'This field is required.'
            },
            'jobTitle': {
                'required': 'This field is required.'
            },
            'address': {
                'required': 'This field is required.'
            },
            'companyType': {
                'required': 'This field is required.'
            },
            'experienceLevel': {
                'required': 'This field is required.'
            },
            'summary': {
                'required': 'This field is required.',
                'maxlength': 'Maximum length exceed.'
            },
            'from': {
                'required': 'This field is required.'
            },
            'to': {
                'required': 'This field is required.'
            },
            'noticePeriod': {
                'required': 'This field is required.'
            },
        });
    }

    ngOnInit() {

        this.wForm();

        this.workForm.valueChanges.pipe(
            takeUntil(this.toDestroy$),
        ).subscribe(_ => [this.dialogRef.disableClose = this.workForm.dirty || this.workForm.invalid]);

        if (this.data && this.data.id > 0) {
            this.wService.getWorkExpeById(this.data.id)
                .pipe(takeUntil(this.toDestroy$))
                .subscribe(res => this.patchFormData(res.contentBody));
        }
    }

    private wForm() {
        this.workForm = this.fb.group({
            id: 0,
            jobCategory: [null, Validators.required],
            jobTitle: [null, Validators.required],
            organization: [null, Validators.required],
            address: [null, Validators.required],
            experienceLevel: [null, Validators.required],
            noticePeriod: null,
            from: [null, Validators.required],
            to: [null, Validators.required],
            isWorking: null,
            summary: [null, [Validators.required, Validators.maxLength(4000)]],
            refPersonName: null,
            refPersonPhone: null,
        });
    }

    private patchFormData(d: WorkExperienceModel) {
        this.workForm.patchValue({
            id: d.id,
            jobCategory: d.jobCategory,
            jobTitle: d.jobTitle,
            organization: d.organization,
            address: d.address,
            experienceLevel: d.experienceLevel,
            noticePeriod: d.noticePeriod,
            from: d.from,
            to: d.to,
            isWorking: d.isWorking,
            summary: d.summary,
            refPersonName: d.refPersonName,
            refPersonPhone: d.refPersonPhone,
        });
    }

    private isWorkingChange(m: boolean) {

        this.cdr.markForCheck();

        const notice = this.workForm.get('noticePeriod');
        const endded = this.workForm.get('to');

        if (m) {
            notice.setValidators(Validators.required);
            endded.clearValidators();
            endded.reset();
        } else {
            endded.setValidators(Validators.required);
            notice.clearValidators();
            notice.reset();
        }

        // reset on user change,
        if (!(this.workForm.pristine || this.workForm.dirty)) {
            notice.reset();
            endded.reset();
        }
    }

    ngAfterViewInit() {

        this.initDropdowns();

        this.genericValidator
            .initValidationProcess(this.workForm, this.formInputElements)
            .subscribe(m => [this.cdr.markForCheck(), this.displayMessage = m]);

        this.workForm.get('isWorking').valueChanges.pipe(
            takeUntil(this.toDestroy$),
            debounceTime(300)
        ).subscribe(isWorking => this.isWorkingChange(isWorking));

        this.elementFocuser
            .initFocusEmptyElement(this.data.focusToElem, this.formInputElements);
    }

    private initDropdowns() {

        this.dropdown.getExperienceLevel()
            .pipe(takeUntil(this.toDestroy$))
            .subscribe(e => [this.cdr.markForCheck(), this.level = e]);
        // for job category dropdown
        this.dropdown.getJobCategories()
            .pipe(takeUntil(this.toDestroy$))
            .subscribe(c => [this.cdr.markForCheck(), this.category = c]);
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    onSubmit() {

        // invalid form without filling required fields
        const errorMessage = validateBeforeSubmit(this.workForm, document.getElementById('res-messages'));
        this.isError = errorMessage && errorMessage.length > 0;
        this.responseMessage = errorMessage;
        if (errorMessage) return false;

        this.isWorking = true;

        this.wService.addOrUpdateWorkExpec(this.workForm.value)
            .pipe(takeUntil(this.toDestroy$), delay(800))
            .subscribe(res => {
                this.dialogRef.close(res);
                this.isWorking = false;
            }, e => {
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
        if (this.workForm.dirty) {
            this.dialog.open(ChangesConfirmComponent).afterClosed()
                .pipe(filter(_ => _))
                .subscribe(_ => this.dialogRef.close());
        } else {
            this.dialogRef.close();
        }
    }

    clearErrors() {
        this.cdr.markForCheck();
        this.isError = false;
        this.responseMessage = null;
        this.errors = null;
    }

}
