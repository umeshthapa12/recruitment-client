import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormControlName, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import Quill from 'quill';
import { ReplaySubject, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { DropdownModel, ErrorCollection, ResponseModel } from '../../../../../../../models';
import { AddNowClickElementFocuserService } from '../../../../../../../services/addnow-click-element-focuser.service';
import { fadeInOutStagger, GenericValidator, QuilljsService, validateBeforeSubmit } from '../../../../../../../utils';
import { ChangesConfirmComponent } from '../../../../../components/shared/changes-confirm/changes-confirm.component';
import { DropdownProviderService } from '../../../../../components/shared/services/dropdown-provider.service';
import { PhoneNumberModel, ProfileModel } from '../../../../shared/models';
import { ProfileService } from '../basic.service';

@Component({
    selector: 'app-basic-form',
    templateUrl: './basic-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    animations: [fadeInOutStagger,
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
        ])],
    styles: [`
        #contact-phone-wrap{
            /*background: #ebeef140;*/
            padding-top: 15px;
           /* box-shadow: 0px 4px 7px -1px #e0e0e0; */
            margin-bottom: 20px;
        }
        #contact-phone-wrap .mat-form-field-outline-start, #contact-phone-wrap .mat-form-field-outline-end{
            border-radius: 0 !important;
        }
    `]
})
export class BasicFormComponent implements OnInit, AfterViewInit, OnDestroy {
    basicForm: FormGroup;

    private toDestroy$ = new Subject<void>();

    // for validation
    @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
    @ViewChild('aboutMeTextEditor') aboutMe: ElementRef;

    private genericValidator: GenericValidator;
    displayMessage: any = {};

    religion: DropdownModel[] = [];
    gender: DropdownModel[] = [];
    private countries: DropdownModel[] = [];
    mStatus: DropdownModel[] = [];

    phoneType = ['Mobile', 'Work', 'Home'];

    isError: boolean;
    responseMessage: string;
    errors: ErrorCollection[];
    isWorking: boolean;
    quill$: Quill;

    countryFilterCtrl: FormControl = new FormControl();
    @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;
    filterCountry: ReplaySubject<DropdownModel[]> = new ReplaySubject<DropdownModel[]>();

    constructor(
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder,
        private bService: ProfileService,
        private dropdownService: DropdownProviderService,
        private dialog: MatDialog,
        private quilljsService: QuilljsService,
        private elementFocuser: AddNowClickElementFocuserService,
        private dialogRef: MatDialogRef<BasicFormComponent>,
        @Inject(MAT_DIALOG_DATA)
        public data: { focusToElem: string, content: any },
    ) {

        this.genericValidator = new GenericValidator({
            'fullName': {
                'required': 'This field is required.'
            },
            'presentAddress': {
                'required': 'This field is required.'
            },
            'permanentAddress': {
                'required': 'This field is required.'
            },
            'nationalityId': {
                'required': 'This field is required.'
            },
            'gender': {
                'required': 'This field is required.'
            },
            'dateOfBirth': {
                'required': 'This field is required.'
            },
            'maritalStatus': {
                'required': 'This field is required.'
            },
            'aboutMe': {
                'required': 'This field is required.'
            },
        });

    }

    private initDropdowns() {

        this.dropdownService.getReligion().pipe(takeUntil(this.toDestroy$)).subscribe(r => [this.cdr.markForCheck(), this.religion = r]);
        this.dropdownService.getGender().pipe(takeUntil(this.toDestroy$)).subscribe(g => [this.cdr.markForCheck(), this.gender = g]);
        this.dropdownService.getCountries().pipe(takeUntil(this.toDestroy$)).subscribe(c => [this.filterCountry.next(c), this.countries = c]);
        this.dropdownService.getMaritalStatus().pipe(takeUntil(this.toDestroy$)).subscribe(m => [this.cdr.markForCheck(), this.mStatus = m]);
    }

    ngOnInit() {
        this.bForm();

        this.basicForm.valueChanges.pipe(
            takeUntil(this.toDestroy$),
        ).subscribe(_ => [this.dialogRef.disableClose = this.basicForm.dirty || this.basicForm.invalid]);

    }

    ngAfterViewInit() {

        this.genericValidator
            .initValidationProcess(this.basicForm, this.formInputElements)
            .subscribe(m => this.displayMessage = m);

        this.elementFocuser
            .initFocusEmptyElement(this.data.focusToElem, this.formInputElements);

        this.initDropdowns();

        this.quill$ = this.quilljsService
            .initQuill(this.aboutMe)
            .textChangeValueSetter(this.basicForm.get('aboutMe'), 'json')
            .getQuillInstance();

        // session ID handle in backend so just get content
        this.bService.getBasicInfo().pipe(
            takeUntil(this.toDestroy$)
        ).subscribe(res => {
            const d: ProfileModel = res.contentBody;
            this.patchFormData(d);
            if (d.aboutMe) {
                const a = JSON.parse(d.aboutMe);
                this.quill$.setContents(a);
            }
        });

        // listen for search field value changes
        this.countryFilterCtrl.valueChanges
            .pipe(takeUntil(this.toDestroy$))
            .subscribe({ next: this.filterCountries });

    }

    bForm() {

        this.basicForm = this.fb.group({
            id: 0,
            aboutMe: [null, Validators.required],
            fullName: [null, [Validators.required]],
            presentAddress: [null, [Validators.required]],
            permanentAddress: [null, Validators.required],
            gender: [null, Validators.required],
            dateOfBirth: [null, Validators.required],
            maritalStatus: [null, Validators.required],
            religion: null,
            phoneNumbers: this.fb.array([this.createItem()]),
            nationalityId: [null, Validators.required],
        });
    }

    contactControls(): FormArray {
        return <FormArray>this.basicForm.get('phoneNumbers');

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
            phoneType: (model && model.phoneType || 'Mobile'),
            number: [(model && model.number), [Validators.required, Validators.maxLength(15)]],
        });
    }

    private patchFormData(d: ProfileModel) {
        this.cdr.markForCheck();

        const controls = this.contactControls();

        if (d && d.phoneNumbers && d.phoneNumbers.length > 0) {
            // clear all controls if we have some response data
            controls.controls = [];
            d.phoneNumbers.forEach(p => controls.push(this.createItem(p)));
        }

        this.basicForm.patchValue({
            id: d.id,
            aboutMe: d.aboutMe,
            fullName: d.fullName,
            presentAddress: d.presentAddress,
            permanentAddress: d.permanentAddress,
            gender: d.gender,
            dateOfBirth: new Date(d.dateOfBirth),
            maritalStatus: d.maritalStatus,
            religion: d.religion,

            // get updates when change happens on `nationality`
            nationalityId: d.nationalityId,

        });
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    onSubmit() {
        this.cdr.markForCheck();
        this.clearErrors();

        // invalid form without filling required fields
        const errorMessage = validateBeforeSubmit(this.basicForm, document.getElementById('res-messages'));
        this.isError = errorMessage && errorMessage.length > 0;
        this.responseMessage = errorMessage;
        if (errorMessage) return false;

        this.isWorking = true;

        this.bService.updateBasicInfo(this.basicForm.value)
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
        if (this.basicForm.dirty) {
            this.dialog.open(ChangesConfirmComponent).afterClosed()
                .pipe(filter(_ => _))
                .subscribe(_ => this.dialogRef.close());
        } else {
            this.dialogRef.close();
        }
    }

    filterCountries = (value: string) => {
        if (!this.countries) return;

        this.filterCountry.next(
            value ? this.countries.filter(c => c.value.toLowerCase().toLowerCase().indexOf(value.toLowerCase()) > -1)
                : this.countries.slice()
        );
    }
}
