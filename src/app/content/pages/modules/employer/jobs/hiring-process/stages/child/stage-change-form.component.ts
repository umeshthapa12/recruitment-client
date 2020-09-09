import { CdkDrag } from '@angular/cdk/drag-drop';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormControlName, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Select } from '@ngxs/store';
import Quill from 'quill';
import { Observable, Subject } from 'rxjs';
import { debounceTime, delay, filter, switchMap, takeUntil } from 'rxjs/operators';
import { DropdownModel, ErrorCollection, ResponseModel } from '../../../../../../../../models';
import { StageBodyModel, StageModel } from '../../../../../../../../models/application.model';
import { ApplicantModel } from '../../../../../../../../models/appointment.model';
import { ExtendedMatDialog, fadeIn, GenericValidator, QuilljsService, validateBeforeSubmit } from '../../../../../../../../utils';
import { ChangesConfirmComponent } from '../../../../../../components/shared/changes-confirm/changes-confirm.component';
import { DropdownProviderService } from '../../../../../../components/shared/services/dropdown-provider.service';
import { JobSeekerStageService } from '../../../../../shared/js-stage.service';

@Component({
    templateUrl: './stage-change-form.component.html',
    animations: [fadeIn]
})
export class StageChangeFormComponent implements OnInit, AfterViewInit {

    private toDestroy$ = new Subject<void>();

    messageForm: FormGroup;
    private genericValidator: GenericValidator;
    @ViewChildren(FormControlName, { read: ElementRef })
    private formInputElements: ElementRef[];
    displayMessage: any = {};

    // error stats
    isError: boolean;
    responseMessage: string;
    errors: ErrorCollection[];
    isWorking: boolean;

    @Select('dropdowns', 'mailTemplates')
    mailTemplate$: Observable<DropdownModel[]>;
    mailTemplates: DropdownModel[] = [];

    @ViewChild('messageBody')
    private messageBody: ElementRef;
    private quill: Quill;
    isMessageBodyLoading: boolean;

    @Select('dropdowns', 'stages') stage$: Observable<StageModel[]>;

    @ViewChild(CdkDrag, { static: true })
    private readonly drag: CdkDrag;

    isSmsChecked: boolean;

    constructor(
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder,
        private exDialog: ExtendedMatDialog,
        private dialog: MatDialog,
        private dialogRef: MatDialogRef<StageChangeFormComponent>,
        @Inject(MAT_DIALOG_DATA)
        public data: { ap: ApplicantModel[], isMessage: boolean },
        private drop: DropdownProviderService,
        private aService: JobSeekerStageService,
        private quillService: QuilljsService,
    ) {

        this.genericValidator = new GenericValidator({
            'subject': {
                'required': 'Subject is required.'
            },
            'smsText': {
                'maxlength': 'Maximum characters exceed'
            },
            'messageBody': {
                'required': 'Message body is required.'
            },
            'stageId': {
                'required': 'Stage is required.'
            }
        });

        this.mailTemplate$.pipe(takeUntil(this.toDestroy$))
            .subscribe({ next: d => this.mailTemplates = d });
    }

    ngOnInit() {

        this.initForm();

        this.exDialog.makeTransparentWhenDragMove(this.drag);
    }

    ngAfterViewInit() {

        const withExcluded = this.quillService.defaultToolbar().except(['image', 'video']);

        if (this.data.isMessage)
            setTimeout(_ => {
                this.quill = this.quillService
                    .initQuill(this.messageBody, { placeholder: 'Mail Message body (customize as necessary)', modules: { toolbar: withExcluded } })
                    .textChangeValueSetter(this.messageForm.get('messageBody'), 'html')
                    .getQuillInstance();
            }, 0);

        this.populateMessageBody();

        this.genericValidator
            .initValidationProcess(this.messageForm, this.formInputElements)
            .subscribe({ next: m => [this.cdr.markForCheck(), this.displayMessage = m] });

    }

    private populateMessageBody() {

        this.messageForm.get('mailTemplateId').valueChanges
            .pipe(debounceTime(400), switchMap(id => {

                this.cdr.markForCheck();
                // stat & cleanup
                this.quill.root.innerHTML = null;
                this.isMessageBodyLoading = true;

                // changes
                const mail = this.mailTemplates.find(_ => +_.key === +id);
                if (mail) this.messageForm.get('subject').setValue(mail.value);
                // map
                return this.drop.getMailTemplateBody(+id).pipe(takeUntil(this.toDestroy$));

            }), delay(1000), takeUntil(this.toDestroy$)).subscribe({
                next: res => [
                    this.cdr.markForCheck(),
                    this.quill.root.innerHTML = res.messageBody,
                    this.isMessageBodyLoading = false
                ],
                error: _ => [this.cdr.markForCheck(), this.isMessageBodyLoading = false]
            });

    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    onSubmission() {
        this.cdr.markForCheck();
        this.clearErrors();

        const errorMessage = validateBeforeSubmit(this.messageForm);
        this.isError = errorMessage && errorMessage.length > 0;
        this.responseMessage = errorMessage;
        if (errorMessage) return false;

        this.saveChanges();
    }

    private saveChanges() {

        const body: StageBodyModel = this.messageForm.value;
        const stages: StageBodyModel[] = [];

        const message: StageBodyModel = {
            subject: body.subject,
            messageBody: body.messageBody,
            smsText: body.smsText,
            remarks: body.remarks,
            isOngoing: true,
            stageId: body.stageId,

        };

        // creating a collection to post as payload
        if (this.data && this.data.ap.length > 0) {
            this.data.ap.forEach(m => {
                stages.push({
                    applicationId: m.applicationId,
                    jobSeekerGuid: m.jobSeekerGuid,
                    openingId: m.openingId
                });
            });
        } else
            stages.push(body);

        message.jobSeekerStage = stages;

        this.isWorking = true;
        this.aService.changeApplicantStage(message).pipe(
            takeUntil(this.toDestroy$), delay(200)
        ).subscribe({
            next: res => {

                this.dialogRef.close(res);
                this.isWorking = false;

            },
            error: e => {
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
            }
        });
    }

    cancel() {

        if (this.messageForm.dirty) {
            this.dialog.open(ChangesConfirmComponent).afterClosed()
                .pipe(takeUntil(this.toDestroy$), filter(_ => _))
                .subscribe({ next: _ => this.dialogRef.close(false) });
        } else this.dialogRef.close(false);

    }

    clearErrors() {
        this.cdr.markForCheck();
        this.isError = false;
        this.responseMessage = null;
        this.errors = null;
        this.isWorking = false;
    }

    private initForm() {
        this.messageForm = this.fb.group({
            applicationId: 0,
            openingId: 0,
            jobSeekerGuid: null,
            subject: [null, Validators.required],
            messageBody: [null, this.data.isMessage ? Validators.required : null],
            remarks: null,
            smsText: [null, Validators.maxLength(1000)],
            isSendSms: false,
            stageId: [null, Validators.required],
            // extra for UI only
            mailTemplateId: 0,
        });

        this.messageForm.valueChanges.pipe(
            filter(_ => this.messageForm.dirty || this.messageForm.invalid),
            takeUntil(this.toDestroy$),
        ).subscribe({ next: _ => [this.dialogRef.disableClose = this.messageForm.dirty || this.messageForm.invalid] });
    }
}
