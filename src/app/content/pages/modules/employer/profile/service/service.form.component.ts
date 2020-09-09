import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChildren } from '@angular/core';
import { FormBuilder, FormControlName, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { delay, filter, takeUntil } from 'rxjs/operators';
import { ErrorCollection, ResponseModel } from '../../../../../../models';
import { fadeInOutStagger, GenericValidator, validateBeforeSubmit } from '../../../../../../utils';
import { ChangesConfirmComponent } from '../../../../components/shared/changes-confirm/changes-confirm.component';
import { ServiceModel } from './service.model';
import { EmployerServiceProvidorService } from './services.service';

@Component({
    templateUrl: './service.form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [fadeInOutStagger]
})
export class ServiceFormComponent implements OnInit, AfterViewInit, OnDestroy {

    private toDestroy$ = new Subject<void>();

    serviceForm: FormGroup;

    isWorking: boolean;

    // for validation
    @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
    private genericValidator: GenericValidator;
    displayMessage: any = {};

    durationMode: string[] = [];
    isError: boolean;
    responseMessage: string;
    errors: ErrorCollection[];

    constructor(
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder,
        private emService: EmployerServiceProvidorService,
        private dialog: MatDialog,
        private dialogRef: MatDialogRef<ServiceFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { content: ServiceModel }
    ) {
        this.genericValidator = new GenericValidator({
            'name': {
                'required': 'This field is required.'
            },
            'description': {
                'required': 'This field id required.'
            }
        });
    }

    ngOnInit() {

        this.tForm();

        if (this.data && this.data.content && this.data.content.id > 0) {
            this.patchFormData(this.data.content);
        }
    }

    tForm() {
        this.serviceForm = this.fb.group({
            id: 0,
            name: [null, Validators.required],
            description: [null, Validators.required],
        });

        this.serviceForm.valueChanges.pipe(
            takeUntil(this.toDestroy$),
        ).subscribe(_ => [this.dialogRef.disableClose = this.serviceForm.dirty || this.serviceForm.invalid]);
    }

    private patchFormData(d: ServiceModel) {
        this.serviceForm.patchValue({
            id: d.id,
            name: d.name,
            description: d.description
        });
    }

    ngAfterViewInit() {

        this.genericValidator
            .initValidationProcess(this.serviceForm, this.formInputElements)
            .subscribe(m => [this.cdr.markForCheck(), this.displayMessage = m]);
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    onSubmit() {

        // invalid form without filling required fields
        const errorMessage = validateBeforeSubmit(this.serviceForm, document.getElementById('res-messages'));
        this.isError = errorMessage && errorMessage.length > 0;
        this.responseMessage = errorMessage;
        if (errorMessage) return false;

        this.isWorking = true;

        this.emService.addOrUpdateService(this.serviceForm.value)
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
        if (this.serviceForm.dirty) {
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
