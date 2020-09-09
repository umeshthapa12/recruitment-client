import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChildren } from '@angular/core';
import { FormBuilder, FormControlName, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { delay, filter, takeUntil } from 'rxjs/operators';
import { ErrorCollection, ResponseModel } from '../../../../../../models';
import { fadeInOutStagger, GenericValidator, validateBeforeSubmit } from '../../../../../../utils';
import { ChangesConfirmComponent } from '../../../../components/shared/changes-confirm/changes-confirm.component';
import { AccountModel } from './account.model';
import { AccountService } from './account.service';

@Component({
    templateUrl: './account-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [fadeInOutStagger]
})
export class AccountFormComponent implements OnInit, AfterViewInit, OnDestroy {

    private toDestroy$ = new Subject<void>();

    socialAccForm: FormGroup;

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
        private tService: AccountService,
        private dialog: MatDialog,
        private dialogRef: MatDialogRef<AccountFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { id: number }
    ) {
        this.genericValidator = new GenericValidator({
            'name': {
                'required': 'This field is required.'
            },
            'url': {
                'required': 'This field id required.'
            }
        });
    }

    ngOnInit() {

        this.tForm();

        if (this.data && this.data.id > 0) {
            this.tService.getSocialAccountById(this.data.id)
                .pipe(takeUntil(this.toDestroy$))
                .subscribe(res => this.patchFormData(res.contentBody));
        }
    }

    tForm() {
        this.socialAccForm = this.fb.group({
            id: 0,
            name: [null, Validators.required],
            url: [null, Validators.required],
        });

        this.socialAccForm.valueChanges.pipe(
            takeUntil(this.toDestroy$),
        ).subscribe(_ => [this.dialogRef.disableClose = this.socialAccForm.dirty || this.socialAccForm.invalid]);
    }

    private patchFormData(d: AccountModel) {
        this.socialAccForm.patchValue({
            id: d.id,
            name: d.name,
            url: d.url
        });
    }

    ngAfterViewInit() {

        this.genericValidator
            .initValidationProcess(this.socialAccForm, this.formInputElements)
            .subscribe(m => [this.cdr.markForCheck(), this.displayMessage = m]);

    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    onSubmit() {

        // invalid form without filling required fields
        const errorMessage = validateBeforeSubmit(this.socialAccForm, document.getElementById('res-messages'));
        this.isError = errorMessage && errorMessage.length > 0;
        this.responseMessage = errorMessage;
        if (errorMessage) return false;

        this.isWorking = true;

        const body: AccountModel = this.socialAccForm.value;

        const isHttp = (body.url.includes('https://') || body.url.includes('http://'));
        if (!isHttp) {
            body.url = body.url.replace(body.url, 'http://' + body.url);
        }

        this.tService.addOrUpdateSocialAccount(body)
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
        if (this.socialAccForm.dirty) {
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
