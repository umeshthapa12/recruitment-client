import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChildren } from '@angular/core';
import { FormBuilder, FormControlName, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { ErrorCollection, ResponseModel } from '../../../../../../models';
import { AddNowClickElementFocuserService } from '../../../../../../services/addnow-click-element-focuser.service';
import { GenericValidator, validateBeforeSubmit } from '../../../../../../utils';
import { ChangesConfirmComponent } from '../../../../components/shared/changes-confirm/changes-confirm.component';
import { ProfileModel } from '../../../shared/models';
import { BasicInfoFormComponent } from './basic-info-form.component';
import { BasicInfoService } from './basic-info.service';

@Component({
    templateUrl: './contact-person-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactPersonFormComponent implements OnInit, AfterViewInit, OnDestroy {
    private toDestroy$ = new Subject<void>();

    cForm: FormGroup;

    isError: boolean;
    responseMessage: string;
    errors: ErrorCollection[];
    isWorking: boolean;

    private genericValidator: GenericValidator;
    @ViewChildren(FormControlName, { read: ElementRef })
    private formInputElements: ElementRef[];

    displayMessage: any = {};

    constructor(
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder,
        private bService: BasicInfoService,
        private dialog: MatDialog,
        private elementFocuser: AddNowClickElementFocuserService,
        private dialogRef: MatDialogRef<BasicInfoFormComponent>,
        @Inject(MAT_DIALOG_DATA)
        public data: { focusToElem: string, content: ProfileModel }
    ) {
        this.genericValidator = new GenericValidator({
            'contactPersonName': {
                'required': 'This field is required.'
            },
            'contactPersonPhone': {
                'required': 'This field is required.'
            }
        });
        this.initForm();
        if (this.data && this.data.content && this.data.content.id > 0) {
            this.patchForm(this.data.content);
        }
    }

    ngOnInit() {

        this.cForm.valueChanges.pipe(
            takeUntil(this.toDestroy$),
        ).subscribe(_ => [this.dialogRef.disableClose = this.cForm.dirty || this.cForm.invalid]);
    }


    private patchForm(d: ProfileModel) {
        this.cdr.markForCheck();

        this.cForm.patchValue({
            id: d.id,
            contactPersonName: d.contactPersonName,
            contactPersonDesignation: d.contactPersonDesignation,
            contactPersonPhone: d.contactPersonPhone,
            contactPersonEmail: d.contactPersonEmail,
            contactPersonAddress: d.contactPersonAddress,
            contactPersonDescription: d.contactPersonDescription
        });
    }

    private initForm() {
        this.cForm = this.fb.group({
            id: 0,
            contactPersonName: [null, Validators.required],
            contactPersonDesignation: null,
            contactPersonPhone: [null, Validators.required],
            contactPersonEmail: null,
            contactPersonAddress: null,
            contactPersonDescription: null
        });
    }

    ngAfterViewInit() {

        this.genericValidator
            .initValidationProcess(this.cForm, this.formInputElements)
            .subscribe(m => this.displayMessage = m);

        this.elementFocuser
            .initFocusEmptyElement(this.data.focusToElem, this.formInputElements);


    }

    onSubmit() {
        this.cdr.markForCheck();
        this.clearErrors();

        // invalid form without filling required fields
        const errorMessage = validateBeforeSubmit(this.cForm, document.getElementById('res-messages'));
        this.isError = errorMessage && errorMessage.length > 0;
        this.responseMessage = errorMessage;
        if (errorMessage) return false;

        this.isWorking = true;

        this.bService.updateBasicInfo(this.cForm.value)
            .pipe(takeUntil(this.toDestroy$))
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

    clearErrors() {
        this.cdr.markForCheck();
        this.isError = false;
        this.responseMessage = null;
        this.errors = null;
    }

    onCancel() {
        if (this.cForm.dirty) {
            this.dialog.open(ChangesConfirmComponent).afterClosed()
                .pipe(filter(_ => _))
                .subscribe(_ => this.dialogRef.close());
        } else {
            this.dialogRef.close();
        }
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }
}
