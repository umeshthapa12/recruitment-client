import { Component, OnInit, AfterViewInit, OnDestroy, ViewChildren, ElementRef, ViewChild, Inject, ChangeDetectorRef } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { FormGroup, FormControlName, FormBuilder, FormArray } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { takeUntil, debounceTime, switchMap, delay, filter } from 'rxjs/operators';
import { SendMessageSuccessAction } from '../appointment/store/appointments.store';
import moment from 'moment';
import Quill from 'quill';
import { fadeIn, GenericValidator, ExtendedMatDialog, QuilljsService, validateBeforeSubmit } from '../../../../../../../utils';
import { ErrorCollection, DropdownModel, ResponseModel } from '../../../../../../../models';
import { JobSeekerMessage } from '../../../../../../../models/job-seeker-message.model';
import { DropdownProviderService } from '../../../../../components/shared/services/dropdown-provider.service';
import { ApplicationService } from '../../../../shared/application.service';
import { AutoTimerComponent } from '../../../../shared/messaging/auto-timer.component';
import { ChangesConfirmComponent } from '../../../../../components/shared/changes-confirm/changes-confirm.component';

@Component({
    templateUrl: './interview-question-form.component.html',
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

export class InterviewQuestionFormComponent implements OnInit, AfterViewInit, OnDestroy {
    private readonly toDestroy$ = new Subject<void>();

    questionForm: FormGroup;
    private genericValidator: GenericValidator;
    @ViewChildren(FormControlName, { read: ElementRef })
    private formInputElements: ElementRef[];
    displayMessage: any = {};

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
        private dialogRef: MatDialogRef<InterviewQuestionFormComponent>,
        @Inject(MAT_DIALOG_DATA)
        private data: JobSeekerMessage[],
        private drop: DropdownProviderService,
        private aService: ApplicationService,
        private quillService: QuilljsService,
        private store: Store

    ) {

        this.genericValidator = new GenericValidator({

        });

        this.mailTemplate$.pipe(takeUntil(this.toDestroy$))
            .subscribe({ next: d => this.mailTemplates = d });
    }

    ngOnInit() {

        this.initForm();

        this.exDialog.makeTransparentWhenDragMove(this.drag);
    }

    ngAfterViewInit() {

        this.quill = this.quillService
            .initQuill(this.messageBody, { placeholder: 'Mail Message body (customize as necessary)' })
            .textChangeValueSetter(this.questionForm.get('messageBody'), 'html')
            .getQuillInstance();

        this.populateMessageBody();

        this.genericValidator
            .initValidationProcess(this.questionForm, this.formInputElements)
            .subscribe({ next: m => [this.cdr.markForCheck(), this.displayMessage = m] });

    }

    private populateMessageBody() {

        this.questionForm.get('mailTemplateId').valueChanges
            .pipe(takeUntil(this.toDestroy$), debounceTime(400), switchMap(id => {

                this.cdr.markForCheck();
                this.quill.root.innerHTML = null;
                this.isMessageBodyLoading = true;

                const mail = this.mailTemplates.find(_ => +_.key === +id);
                if (mail) this.questionForm.get('subject').setValue(mail.value);
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

        const errorMessage = validateBeforeSubmit(this.questionForm);
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
                    const tValue = new Date(timer.componentInstance.getTimerDate());
                    this.questionForm.get('timer').setValue(tValue);
                    this.saveChanges(tValue);
                }
            });

            return false;
        }

        this.saveChanges();

    }

    private saveChanges(timer?: Date) {

        const body: JobSeekerMessage = this.questionForm.value;
        const collections: JobSeekerMessage[] = [];
        const apDate = moment(body.appointmentDate);

        const at = this.questionForm.get('appointmentTime').value;
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

        if (this.questionForm.dirty) {
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
        this.questionForm = this.fb.group({
            id: 0,
            questionTitle: null,
            totalQuestion: null,
            difficulty: null,
            passMark: 60,
            fullMark: 100,
            question: null,
            usingByOpenings: null
        });

        this.questionForm.valueChanges.pipe(
            filter(_ => this.questionForm.dirty || this.questionForm.invalid),
            takeUntil(this.toDestroy$),
        ).subscribe({ next: _ => [this.dialogRef.disableClose = this.questionForm.dirty || this.questionForm.invalid] });
    }

    // questionControls(): FormArray {
    //     return <FormArray>this.messageForm.get('questions');

    // }

    // QuestionAction(index: number) {
    //     const controls = this.questionControls();
    //     if (index > -1) {
    //         controls.removeAt(index);
    //     } else {
    //         controls.push(this.createItem());
    //         setTimeout(() => {
    //             document.getElementById('contact-phone-wrap').scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
    //         }, 100);
    //     }
    // }

    // private createItem(model?: any): FormGroup {
    //     return this.fb.group({
    //         question: [(model && model.question)],
    //     });
    // }
}
