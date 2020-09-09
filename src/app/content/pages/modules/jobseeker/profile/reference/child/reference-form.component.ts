import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChildren } from '@angular/core';
import { FormBuilder, FormControlName, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { delay, filter, takeUntil } from 'rxjs/operators';
import { ErrorCollection, ResponseModel } from '../../../../../../../models';
import { GenericValidator, Regex, validateBeforeSubmit } from '../../../../../../../utils';
import { ChangesConfirmComponent } from '../../../../../components/shared/changes-confirm/changes-confirm.component';
import { AccountModel } from '../../social-account/account.model';
import { ReferenceModel } from '../reference.model';
import { ReferenceService } from '../reference.service';

@Component({
    selector: 'app-reference-form',
    templateUrl: './reference-form.component.html',
    styles: [`
    .mat-form-field {
        width: 100%;
    }
    `]
})

export class ReferenceFormComponent implements OnInit, AfterViewInit, OnDestroy {

    private toDestroy$ = new Subject<void>();

    refPersonForm: FormGroup;

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
        private rService: ReferenceService,
        private dialog: MatDialog,
        private dialogRef: MatDialogRef<ReferenceFormComponent>,
        @Inject(MAT_DIALOG_DATA)
        public data: { id: number }
    ) {
        this.genericValidator = new GenericValidator({
            'name': {
                'required': 'This field is required.'
            },
            'jobTitle': {
                'required': 'This field id required.'
            },
            'email': {
                'pattern': 'Email is not valid.'
            }
        });
    }

    ngOnInit() {

        this.tForm();

        if (this.data && this.data.id > 0) {
            this.rService.getRefById(this.data.id)
                .pipe(takeUntil(this.toDestroy$))
                .subscribe(res => this.patchFormData(res.contentBody));
        }
    }

    tForm() {
        this.refPersonForm = this.fb.group({
            id: 0,
            name: [null, Validators.required],
            jobTitle: null,
            orgName: null,
            phone: null,
            email: [null, Validators.pattern(Regex.emailRegex)],
        });

        this.refPersonForm.valueChanges.pipe(
            takeUntil(this.toDestroy$),
        ).subscribe(_ => [this.dialogRef.disableClose = this.refPersonForm.dirty || this.refPersonForm.invalid]);
    }

    private patchFormData(d: ReferenceModel) {
        this.refPersonForm.patchValue({
            id: d.id,
            name: d.name,
            jobTitle: d.jobTitle,
            orgName: d.orgName,
            phone: d.phone,
            email: d.email,
        });
    }

    ngAfterViewInit() {

        this.genericValidator
            .initValidationProcess(this.refPersonForm, this.formInputElements)
            .subscribe(m => [this.cdr.markForCheck(), this.displayMessage = m]);

    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    onSubmit() {

        // invalid form without filling required fields
        const errorMessage = validateBeforeSubmit(this.refPersonForm, document.getElementById('res-messages'));
        this.isError = errorMessage && errorMessage.length > 0;
        this.responseMessage = errorMessage;
        if (errorMessage) return false;

        this.isWorking = true;

        const body: AccountModel = this.refPersonForm.value;

        this.rService.addOrUpdateRef(body)
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
        if (this.refPersonForm.dirty) {
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
