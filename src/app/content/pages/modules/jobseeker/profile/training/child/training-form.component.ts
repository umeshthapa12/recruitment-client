import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChildren, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControlName, FormGroup, Validators } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';
import { ErrorCollection, ResponseModel } from '../../../../../../../models';
import { CustomDateAdapter, fadeIn, GenericValidator, validateBeforeSubmit } from '../../../../../../../utils';
import { ChangesConfirmComponent } from '../../../../../components/shared/changes-confirm/changes-confirm.component';
import { TrainingModel } from '../training.model';
import { TrainingService } from '../training.service';

@Component({
    selector: 'app-training-form',
    templateUrl: './training-form.component.html',
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
    #duration-wrap .mat-form-field-outline-start, #duration-wrap .mat-form-field-outline-end{
        border-radius: 0 !important;
    }
    `]
})
export class TrainingFormComponent implements OnInit, AfterViewInit, OnDestroy {

    private toDestroy$ = new Subject<void>();

    trainingForm: FormGroup;

    // show/hide form submission process spinner
    isWorking: boolean;

    // for validation
    @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
    private genericValidator: GenericValidator;
    displayMessage: any = {};

    durationMode: string[] = [];
    isError: boolean;
    responseMessage: string;
    errors: ErrorCollection[];

    // internal use only
    private readonly dur: string[] = ['Hour(s)', 'Day(s)', 'Week(s)', 'Month(s)', 'Year(s)'];
    // users are not allowed to select future date
    maxDate = new Date();

    constructor(
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder,
        private tService: TrainingService,
        private dialog: MatDialog,
        private dialogRef: MatDialogRef<TrainingFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { id: number }
    ) {
        this.genericValidator = new GenericValidator({
            'titleOfCertificate': {
                'required': 'This field is required.'
            },
            'nameOfInstitutation': {
                'required': 'This field id required.'
            },
            'duration': {
                'required': 'This field id required.',
                'maxlength': 'Maximum length exceed.',
                'pattern': 'Digits only'
            },
            'completionYear': {
                'required': 'This field id required.',
            }
        });
    }

    ngOnInit() {

        this.tForm();

        if (this.data && this.data.id > 0) {
            this.tService.getTrainingById(this.data.id)
                .pipe(takeUntil(this.toDestroy$))
                .subscribe(res => this.patchFormData(res.contentBody));
        }
    }

    tForm() {
        this.trainingForm = this.fb.group({
            id: 0,
            titleOfCertificate: [null, Validators.required],
            nameOfInstitutation: [null, Validators.required],
            duration: [null, [Validators.required, Validators.maxLength(10), Validators.pattern(/^\d+$/)]],
            completionYear: [null, Validators.required],
            // static values
            durationMode: [this.dur[0], Validators.required],
        });

        this.trainingForm.valueChanges.pipe(
            takeUntil(this.toDestroy$),
        ).subscribe(_ => [this.dialogRef.disableClose = this.trainingForm.dirty || this.trainingForm.invalid]);
    }

    private patchFormData(d: TrainingModel) {
        this.trainingForm.patchValue({
            id: d.id,
            titleOfCertificate: d.titleOfCertificate,
            nameOfInstitutation: d.nameOfInstitutation,
            duration: d.duration,
            durationMode: d.durationMode,

            // we do not care about days so we set it to `01`
            completionYear: d.completionYear ? new Date('01 ' + d.completionYear) : null,
        });
    }

    ngAfterViewInit() {

        this.genericValidator
            .initValidationProcess(this.trainingForm, this.formInputElements)
            .subscribe(m => [this.cdr.markForCheck(), this.displayMessage = m]);

        this.tService.getDurationModes().pipe(
            takeUntil(this.toDestroy$)
        ).subscribe(m => [this.cdr.markForCheck(), this.durationMode = m]);
    }

    yearSelected(x: Date, d: MatDatepicker<any>) {
        this.trainingForm.get('completionYear').setValue(x);
        d.close();
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    onSubmit() {

        // invalid form without filling required fields
        const errorMessage = validateBeforeSubmit(this.trainingForm, document.getElementById('res-messages'));
        this.isError = errorMessage && errorMessage.length > 0;
        this.responseMessage = errorMessage;
        if (errorMessage) return false;

        this.isWorking = true;

        const body: TrainingModel = this.trainingForm.value;

        // payload mutation before submitting
        const start = new Date(body.completionYear);
        // we are only interested for month and year
        body.completionYear = start.getFullYear() > 0 ? moment(start).format('MMM YYYY') : null;

        this.tService.addOrUpdateTraining(body)
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

    onCancel() {
        if (this.trainingForm.dirty) {
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
