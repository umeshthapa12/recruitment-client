import { CdkDrag } from '@angular/cdk/drag-drop';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormControlName, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Select, Store } from '@ngxs/store';
import moment from 'moment';
import Quill from 'quill';
import { Observable, Subject } from 'rxjs';
import { debounceTime, delay, filter, switchMap, takeUntil } from 'rxjs/operators';
import { DropdownModel, ErrorCollection, JobSeekerMessage, ResponseModel } from '../../../../../models';
import { ExtendedMatDialog, fadeIn, GenericValidator, QuilljsService, validateBeforeSubmit } from '../../../../../utils';
import { ChangesConfirmComponent } from '../../../components/shared/changes-confirm/changes-confirm.component';
import { DropdownProviderService } from '../../../components/shared/services/dropdown-provider.service';
import { SendMessageSuccessAction } from '../../employer/jobs/hiring-process/appointment/store/appointments.store';
import { ApplicationService } from '../application.service';
import { AutoTimerComponent } from './auto-timer.component';


@Component({
    templateUrl: './message-form.component.html',
    animations: [fadeIn],
    styles: [`
        .alert{
            display: flex;justify-content: space-between;flex-wrap: wrap
        }
        .mat-menu-item {
            line-height: 0px !important;
            height: 30px !important;
            font-size: 12px;
        }
    `]
})
export class MessageFormComponent implements OnDestroy, OnInit, AfterViewInit {

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

    @ViewChild('messageBody', { static: true })
    private messageBody: ElementRef;
    private quill: Quill;
    isMessageBodyLoading: boolean;


    @ViewChild(CdkDrag, { static: true })
    private readonly drag: CdkDrag;

    constructor(
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder,
        private exDialog: ExtendedMatDialog,
        private dialog: MatDialog,
        private dialogRef: MatDialogRef<MessageFormComponent>,
        @Inject(MAT_DIALOG_DATA)
        private data: JobSeekerMessage[],
        private drop: DropdownProviderService,
        private aService: ApplicationService,
        private quillService: QuilljsService,
        private store: Store

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

        this.quill = this.quillService
            .initQuill(this.messageBody, { placeholder: 'Mail Message body (customize as necessary)', modules: { toolbar: withExcluded } })
            .textChangeValueSetter(this.messageForm.get('messageBody'), 'html')
            .getQuillInstance();

        this.populateMessageBody();

        this.genericValidator
            .initValidationProcess(this.messageForm, this.formInputElements)
            .subscribe({ next: m => [this.cdr.markForCheck(), this.displayMessage = m] });

    }

    private populateMessageBody() {

        this.messageForm.get('mailTemplateId').valueChanges
            .pipe(takeUntil(this.toDestroy$), debounceTime(400), switchMap(id => {

                this.cdr.markForCheck();
                // stat & cleanup
                this.quill.root.innerHTML = null;
                this.isMessageBodyLoading = true;

                // changes
                const mail = this.mailTemplates.find(_ => +_.key === +id);
                if (mail) this.messageForm.get('subject').setValue(mail.value);
                // map
                return this.drop.getMailTemplateBody(+id).pipe(takeUntil(this.toDestroy$));

            }), delay(1000)).subscribe({
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

    onSubmission(ops: string) {
        this.cdr.markForCheck();
        this.clearErrors();

        const errorMessage = validateBeforeSubmit(this.messageForm);
        this.isError = errorMessage && errorMessage.length > 0;
        this.responseMessage = errorMessage;
        if (errorMessage) return false;

        const isTimer = ops === 'timer';
        if (isTimer) {

            const timer = this.dialog.open(AutoTimerComponent, {
                width: '300px',
                autoFocus: false
            });

            timer.afterClosed().pipe(
                takeUntil(this.toDestroy$), filter(yes => yes)
            ).subscribe({
                next: _ => {
                    const tValue = timer.componentInstance.getTimerDate();
                    this.messageForm.get('timer').setValue(tValue);
                    this.saveChanges(tValue);
                }
            });

            return false;
        }

        this.saveChanges();

    }

    private saveChanges(timer?: string) {

        const body: JobSeekerMessage = this.messageForm.value;
        const collections: JobSeekerMessage[] = [];
        const apDate = moment(body.appointmentDate);

        const at = this.messageForm.get('appointmentTime').value;
        const combined = moment(apDate.format('YYYY-MM-DDT') + at).toDate();

        body.appointmentDate = apDate.isValid() ? apDate.format('MM-DD-YYYY') : null;

        // creating a collection to post as payload
        if (this.data && this.data.length > 0) {
            this.data.forEach(m => {
                collections.push({ ...body, ...m });
            });
        } else {
            collections.push(body);
        }

        this.isWorking = true;
        this.aService.sendMessage(collections).pipe(
            takeUntil(this.toDestroy$), delay(800)
        ).subscribe({
            next: res => {

                this.dialogRef.close(res);
                this.isWorking = false;

                const action = new SendMessageSuccessAction({ applicant: { appointmentDate: combined, timer: timer } });

                this.store.dispatch(action);

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
                .subscribe({ next: _ => this.dialogRef.close() });
        } else this.dialogRef.close();

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
            employerGuid: null,
            jobSeekerGuid: null,
            subject: [null, Validators.required],
            messageBody: [null, Validators.required],
            remarks: null,
            smsText: [null, Validators.maxLength(1000)],
            appointmentDate: null,
            appointmentTime: null,
            isSendSms: false,
            timer: null,
            // extra for UI only
            mailTemplateId: 0,
        });

        this.messageForm.valueChanges.pipe(
            filter(_ => this.messageForm.dirty || this.messageForm.invalid),
            takeUntil(this.toDestroy$),
        ).subscribe({ next: _ => [this.dialogRef.disableClose = this.messageForm.dirty || this.messageForm.invalid] });
    }
}
