import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControlName, FormGroup, Validators } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import Quill from 'quill';
import { Subject } from 'rxjs';
import { delay, filter, takeUntil } from 'rxjs/operators';
import { DropdownModel, ErrorCollection, ResponseModel } from '../../../../../../models';
import { AddNowClickElementFocuserService } from '../../../../../../services/addnow-click-element-focuser.service';
import { fadeInOutStagger, GenericValidator, QuilljsService, validateBeforeSubmit } from '../../../../../../utils';
import { ChangesConfirmComponent } from '../../../../components/shared/changes-confirm/changes-confirm.component';
import { DropdownProviderService } from '../../../../components/shared/services/dropdown-provider.service';
import { PhoneNumberModel, ProfileModel } from '../../../shared/models';
import { BasicInfoService } from './basic-info.service';

@Component({
    templateUrl: './basic-info-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    animations: [fadeInOutStagger],
    styles: [`
    #contact-phone-wrap{
        padding-top: 15px;
        margin-bottom: 20px;
    }
    #contact-phone-wrap .mat-form-field-outline-start, #contact-phone-wrap .mat-form-field-outline-end{
        border-radius: 0 !important;
    }
`]
})
export class BasicInfoFormComponent implements OnInit, AfterViewInit, OnDestroy {

    private toDestroy$ = new Subject<void>();

    basicInfoForm: FormGroup;
    companyType: DropdownModel[] = [];
    categories: DropdownModel[] = [];

    isError: boolean;
    responseMessage: string;
    errors: ErrorCollection[];
    isWorking: boolean;
    isOtherCategory: boolean;
    quill$: Quill;

    private genericValidator: GenericValidator;
    @ViewChildren(FormControlName, { read: ElementRef })
    private formInputElements: ElementRef[];

    displayMessage: any = {};

    phoneType = ['Mobile', 'Office', 'Support'];

    @ViewChild('aboutCompany', { read: ElementRef, static: true })
    private aboutCompanyEl: ElementRef;

    constructor(
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder,
        private bService: BasicInfoService,
        private quilljsService: QuilljsService,
        private drop: DropdownProviderService,
        private dialog: MatDialog,
        private elementFocuser: AddNowClickElementFocuserService,
        private dialogRef: MatDialogRef<BasicInfoFormComponent>,
        @Inject(MAT_DIALOG_DATA)
        public data: { focusToElem: string }
    ) {
        this.genericValidator = new GenericValidator({
            'name': {
                'required': 'This field is required.'
            },
            'companyTypeId': {
                'required': 'This field is required.'
            },
            'categoryId': {
                'required': 'This field is required.'
            },
            'employeeSize': {
                'required': 'This field is required.'
            },
            'address': {
                'required': 'This field is required.'
            },
            'about': {
                'required': 'This field is required.'
            },
            'number': {
                'required': 'This field is required.'
            }
        });
    }

    ngOnInit() {

        this.initForm();

        this.basicInfoForm.valueChanges.pipe(
            takeUntil(this.toDestroy$),
        ).subscribe(_ => [this.dialogRef.disableClose = this.basicInfoForm.dirty || this.basicInfoForm.invalid]);
    }

    private checkOtherCategory() {
        if (this.isOtherCategory)
            return;

        const id = +this.basicInfoForm.get('categoryId').value;
        const el = this.categories.find(_ => _.key === id);
        if (el && (el.value.toLowerCase().trim() === 'other' || el.value.toLowerCase().trim() === 'others'))
            this.isOtherCategory = true;
    }

    contactControls(): FormArray {
        return <FormArray>this.basicInfoForm.get('phoneNumbers');
    }

    contactNumberAction(index: number) {
        const controls = this.contactControls();
        if (index > -1) {
            controls.removeAt(index);
        } else {
            controls.push(this.createItem());
            setTimeout(() => {
                document.getElementById('contact-phone-wrap').scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
            }, 100);
        }
    }
    private createItem(model?: PhoneNumberModel): FormGroup {
        return this.fb.group({
            phoneType: (model && model.phoneType || 'Office'),
            number: [(model && model.number), [Validators.required, Validators.maxLength(20)]],
        });
    }

    private patchForm(d: ProfileModel) {
        this.cdr.markForCheck();

        const controls = this.contactControls();

        if (d && d.phoneNumbers && d.phoneNumbers.length > 0) {
            // clear all controls if we have some response data
            controls.controls = [];
            d.phoneNumbers.forEach(p => controls.push(this.createItem(p)));
        }

        this.basicInfoForm.patchValue({
            id: d.id,
            name: d.name,
            companyTypeId: d.companyTypeId,
            categoryId: d.categoryId,
            otherCategory: d.otherCategory,
            email: d.email,
            employeeSize: d.employeeSize,
            address: d.address,
            url: d.url,
            about: d.about,
            phoneNumbers: d.phoneNumbers,
            domain: d.domain
        });

        this.checkOtherCategory();
    }

    private initForm() {
        this.basicInfoForm = this.fb.group({
            id: 0,
            name: [null, Validators.required],
            companyTypeId: [null, Validators.required],
            categoryId: [null, Validators.required],
            otherCategory: null,
            email: null,
            employeeSize: [null, Validators.required],
            address: [null, Validators.required],
            url: null,
            domain: null,
            about: [null, Validators.required],
            phoneNumbers: this.fb.array([this.createItem()])
        });
    }

    ngAfterViewInit() {

        this.initDropdowns();

        this.genericValidator
            .initValidationProcess(this.basicInfoForm, this.formInputElements)
            .subscribe(m => this.displayMessage = m);

        this.elementFocuser
            .initFocusEmptyElement(this.data.focusToElem, this.formInputElements);

        this.quill$ = this.quilljsService
            .initQuill(this.aboutCompanyEl)
            .textChangeValueSetter(this.basicInfoForm.get('about'), 'json')
            .getQuillInstance();

        // session ID handle in backend so just get content
        this.bService.getBasicInfoEdit().pipe(
            takeUntil(this.toDestroy$)
        ).subscribe(res => {
            const d: ProfileModel = res.contentBody;
            this.patchForm(d);
            if (d.about) {
                const a = JSON.parse(d.about);
                this.quill$.setContents(a);
            }
        });
    }

    categoryValueChange(v: MatSelectChange) {
        this.cdr.markForCheck();
        const op = v.source.selected as MatOption;
        const ctrl = this.basicInfoForm.get('otherCategory');

        if (op.viewValue.toLowerCase().trim() === 'other' || op.viewValue.toLowerCase().trim() === 'others') {
            ctrl.reset(null);
            ctrl.setValidators(Validators.required);
            this.isOtherCategory = true;
        } else {

            ctrl.clearValidators();
            this.isOtherCategory = false;
        }

        ctrl.updateValueAndValidity();
    }

    onSubmit() {
        this.cdr.markForCheck();
        this.clearErrors();

        // invalid form without filling required fields
        const errorMessage = validateBeforeSubmit(this.basicInfoForm, document.getElementById('res-messages'));
        this.isError = errorMessage && errorMessage.length > 0;
        this.responseMessage = errorMessage;
        if (errorMessage) return false;

        this.isWorking = true;

        this.bService.updateBasicInfo(this.basicInfoForm.value)
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
        if (this.basicInfoForm.dirty) {
            this.dialog.open(ChangesConfirmComponent).afterClosed()
                .pipe(filter(_ => _))
                .subscribe(_ => this.dialogRef.close());
        } else {
            this.dialogRef.close();
        }
    }

    private initDropdowns() {
        this.drop.getCompanyTypes().pipe(takeUntil(this.toDestroy$), delay(900)).subscribe(_ => [this.cdr.markForCheck(), this.companyType = _]);
        this.drop.getJobCategories().pipe(takeUntil(this.toDestroy$), delay(1200)).subscribe(_ => [this.cdr.markForCheck(), this.categories = _, this.checkOtherCategory()]);
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }
}
