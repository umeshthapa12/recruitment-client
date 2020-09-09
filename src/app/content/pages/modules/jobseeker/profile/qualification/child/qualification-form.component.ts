import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChildren, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControlName, FormGroup, Validators } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';
import { DropdownModel, ErrorCollection, ResponseModel } from '../../../../../../../models';
import { AddNowClickElementFocuserService } from '../../../../../../../services/addnow-click-element-focuser.service';
import { CustomDateAdapter, fadeIn, GenericValidator, validateBeforeSubmit } from '../../../../../../../utils';
import { ChangesConfirmComponent } from '../../../../../components/shared/changes-confirm/changes-confirm.component';
import { DropdownProviderService } from '../../../../../components/shared/services/dropdown-provider.service';
import { QualModel } from '../../../../shared/models';
import { QualificationService } from '../qualification.service';

@Component({
    selector: 'app-qualification-form',
    templateUrl: './qualification-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    animations: [fadeIn],
    providers: [
        {
            provide: DateAdapter, useClass: CustomDateAdapter
        }
    ],
    styles: [`
    .mat-form-field {
        width: 100%;
    }

    #score-wrap .mat-form-field-outline-start, #score-wrap .mat-form-field-outline-end{
        border-radius: 0 !important;
    }
    `]
})

export class QualificationFormComponent implements OnInit, AfterViewInit, OnDestroy {

    private toDestroy$ = new Subject<void>();

    qualiForm: FormGroup;

    // show/hide form submission process spinner
    isWorking: boolean;
    responseMessage: string;
    isError: boolean;
    errors: ErrorCollection[];

    @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
    private genericValidator: GenericValidator;
    displayMessage: any = {};

    degree: DropdownModel[] = [];
    studyModes: DropdownModel[] = [];
    countries: DropdownModel[] = [];
    markIn = ['CGPA', 'Percentage'];

    isStudyRunning: boolean;
    // users are not allowed to select future date
    maxDate = new Date();

    constructor(
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder,
        private qService: QualificationService,
        private dropdown: DropdownProviderService,
        private elementFocuser: AddNowClickElementFocuserService,
        private dialog: MatDialog,
        private dialogRef: MatDialogRef<QualificationFormComponent>,
        @Inject(MAT_DIALOG_DATA)
        private data: { focusToElem: string, id: number }
    ) {
        this.genericValidator = new GenericValidator({
            'qualificId': {
                'required': 'This field is required.'
            },
            'studyModeId': {
                'required': 'This field is required.'
            },
            'discipline': {
                'required': 'This field is required.'
            },
            'nameOfInstitution': {
                'required': 'This field is required.'
            },
            'score': {
                'required': 'This field is required.',
                'maxlength': 'Maximum length exceed.'
            },
            'startedOn': {
                'required': 'This field is required.'
            },
            'completedOn': {
                'required': 'This field is required.'
            }
        });
    }

    ngOnInit() {

        this.qForm();
        this.initDropdowns();

        this.qualiForm.valueChanges.pipe(
            takeUntil(this.toDestroy$),
        ).subscribe(_ => [this.dialogRef.disableClose = this.qualiForm.dirty || this.qualiForm.invalid]);

        if (this.data && this.data.id > 0) {
            this.qService.getQualificById(this.data.id).pipe(
                takeUntil(this.toDestroy$)
            ).subscribe(res => this.patchForm(res.contentBody));
        }
    }

    qForm() {
        this.qualiForm = this.fb.group({
            id: 0,
            qualificId: [null, [Validators.required]],
            studyModeId: [null, [Validators.required]],
            countryId: [null, Validators.required],
            discipline: [null, Validators.required],
            specialization: null,
            nameOfInstitution: [null, Validators.required],
            startedOn: null,
            completedOn: null,
            score: [null, [Validators.pattern(/^[+-]?\d+(\.\d+)?$/), Validators.maxLength(5)]],
            scoredIn: this.markIn[1],
            isRunning: false
        });
    }

    private patchForm(d: QualModel) {
        this.cdr.markForCheck();
        this.qualiForm.patchValue({
            id: d.id,
            qualificId: d.qualificId,
            studyModeId: d.studyModeId,
            countryId: d.countryId,
            discipline: d.discipline,
            specialization: d.specialization,
            nameOfInstitution: d.nameOfInstitution,

            // we do not care about days so we set it to `01`
            startedOn: d.startedOn ? new Date('01 ' + d.startedOn) : null,
            completedOn: d.completedOn ? new Date('01 ' + d.completedOn) : null,

            score: d.score,
            scoredIn: d.scoredIn,

            // we have either studying or completed value But,
            // the control is a boolean value to detect change whether its checked or not to process view and interal values
            // for the api.
            isRunning: d.isRunning
        });
    }

    ngAfterViewInit() {

        this.genericValidator
            .initValidationProcess(this.qualiForm, this.formInputElements)
            .subscribe(m => [this.cdr.markForCheck(), this.displayMessage = m]);

        this.elementFocuser
            .initFocusEmptyElement(this.data.focusToElem, this.formInputElements);

        this.qualiForm.get('isRunning').valueChanges.pipe(
            takeUntil(this.toDestroy$),
            debounceTime(200)
        ).subscribe(v => this.studyStatusChange(v));
    }

    private studyStatusChange(m: boolean) {

        this.cdr.markForCheck();
        this.isStudyRunning = m;

        const complete = this.qualiForm.get('completedOn');
        const start = this.qualiForm.get('startedOn');
        const score = this.qualiForm.get('score');

        if (m) {
            complete.clearValidators();
            score.clearValidators();
            start.setValidators(Validators.required);
            complete.reset();
            score.reset();
        } else {
            start.clearValidators();
            score.setValidators([Validators.pattern(/^[+-]?\d+(\.\d+)?$/), Validators.maxLength(5)]);
            complete.setValidators(Validators.required);
            start.reset();
        }

        // reset on user change,
        if (!(this.qualiForm.pristine || this.qualiForm.dirty)) {
            complete.reset();
            score.reset();
            start.reset();
        }
    }

    yearSelected(x: Date, d: MatDatepicker<any>, isCompleted: boolean) {
        isCompleted ? this.qualiForm.get('completedOn').setValue(x)
            : this.qualiForm.get('startedOn').setValue(x);
        d.close();
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    onSubmit() {

        // invalid form without filling required fields
        const errorMessage = validateBeforeSubmit(this.qualiForm, document.getElementById('res-messages'));
        this.isError = errorMessage && errorMessage.length > 0;
        this.responseMessage = errorMessage;
        if (errorMessage) return false;

        this.isWorking = true;

        const body: QualModel = this.payloadMutation(this.qualiForm.value);

        this.qService.addOrUpdateQualific(body)
            .pipe(takeUntil(this.toDestroy$), debounceTime(800))
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

    private payloadMutation(body: QualModel) {
        const start = new Date(body.startedOn);
        const com = new Date(body.completedOn);
        body.startedOn = start.getFullYear() > 0 ? moment(start).format('MMM YYYY') : null;
        body.completedOn = com.getFullYear() > 0 ? moment(com).format('MMM YYYY') : null;
        return body;
    }

    onCancel() {
        if (this.qualiForm.dirty) {
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

    private initDropdowns() {

        this.dropdown.getQualifications()
            .pipe(takeUntil(this.toDestroy$))
            .subscribe(_ => [this.degree = _, this.cdr.detectChanges()]);

        this.dropdown.getStudyModes()
            .pipe(takeUntil(this.toDestroy$))
            .subscribe(_ => [this.studyModes = _, this.cdr.detectChanges()]);

        this.dropdown.getCountries()
            .pipe(takeUntil(this.toDestroy$))
            .subscribe(_ => [this.countries = _, this.cdr.detectChanges()]);

    }

}
