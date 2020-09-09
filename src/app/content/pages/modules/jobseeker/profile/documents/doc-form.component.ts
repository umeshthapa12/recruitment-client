import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormControlName, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Quill from 'quill';
import { Subject } from 'rxjs';
import { delay, filter, takeUntil } from 'rxjs/operators';
import { ErrorCollection, ResponseModel } from '../../../../../../models';
import { fadeInOutDown, GenericValidator, QuilljsService, validateBeforeSubmit } from '../../../../../../utils';
import { ChangesConfirmComponent } from '../../../../components/shared/changes-confirm/changes-confirm.component';
import { DocumentModel } from './document.model';
import { DocumentService } from './document.service';

@Component({
    templateUrl: './doc-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [fadeInOutDown]
})
export class DocFormComponent implements OnInit, OnDestroy, AfterViewInit {

    private toDestroy$ = new Subject<void>();

    textDocForm: FormGroup;

    isWorking: boolean;
    responseMessage: string;
    isError: boolean;
    errors: ErrorCollection[];

    @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
    private genericValidator: GenericValidator;
    displayMessage: any = {};

    @ViewChild('textContent') textContent: ElementRef;
    quill$: Quill;

    fileName: string = '';
    private readonly fileFormat = ['docx', 'pdf', 'jpg', 'png', 'jpeg'];
    file: File;

    constructor(
        private cdr: ChangeDetectorRef,
        private dialog: MatDialog,
        private dialogRef: MatDialogRef<DocFormComponent>,
        private dService: DocumentService,
        private fb: FormBuilder,
        private quillService: QuilljsService,
        @Inject(MAT_DIALOG_DATA)
        private data: { id: number }
    ) {
        this.genericValidator = new GenericValidator({
            'title': {
                'required': 'This field is required.'
            }
        });
    }

    ngOnInit() {

        this.textDocForm = this.fb.group({
            id: 0,
            title: [null, Validators.required],
            textContent: null,
            description: null,
        });

        this.textDocForm.valueChanges.pipe(
            takeUntil(this.toDestroy$),
        ).subscribe(_ => [this.dialogRef.disableClose = this.textDocForm.dirty || this.textDocForm.invalid]);

    }

    private patchFormData(d: DocumentModel) {
        this.textDocForm.patchValue({
            id: d.id,
            title: d.title,
            textContent: d.textContent,
            description: d.description,
        });

        if (d.textContent) {
            const a = JSON.parse(d.textContent);
            this.quill$.setContents(a);
        }
    }

    ngAfterViewInit() {

        this.genericValidator
            .initValidationProcess(this.textDocForm, this.formInputElements)
            .subscribe(m => [this.cdr.markForCheck(), this.displayMessage = m]);

        this.reinintQuill();

        if (this.data && this.data.id > 0) {
            this.dService.getTextDocById(this.data.id)
                .pipe(takeUntil(this.toDestroy$))
                .subscribe(res => this.patchFormData(res.contentBody));
        }
    }

    private reinintQuill() {
        this.quill$ = this.quillService
            .initQuill(this.textContent)
            .textChangeValueSetter(this.textDocForm.get('textContent'), 'json')
            .getQuillInstance();
    }

    fileChange(e: any) {

        if (!(e || e.target)) return;
        const file = (e.target.files[0] || e.srcElement.files[0]) as File;
        this.fileName = file ? file.name : null;
        if (!file) return;
        const ext = file.name.slice((file.name.lastIndexOf('.') - 1) + 2);
        const format = this.fileFormat.indexOf(ext);

        if (format === -1) {
            this.isError = true;
            this.responseMessage = 'Invalid file format. Supported file formats are ' + this.fileFormat.join(', .');
        }

        // 20 Mb
        if (file.size > 20971520) {
            this.isError = true;
            this.responseMessage = 'File size limit exceed. Max file size is 20Mb';
        }

        this.file = file;
    }

    clearFile(e: Event, el: HTMLInputElement) {
        e.preventDefault();
        e.stopPropagation();
        el.value = null;
        this.fileName = null;
        this.isError = false;
        this.responseMessage = null;

        this.cdr.detectChanges();
        this.reinintQuill();
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    onSubmit() {

        // invalid form without filling required fields
        const errorMessage = validateBeforeSubmit(this.textDocForm, document.getElementById('res-messages'));
        this.isError = errorMessage && errorMessage.length > 0;
        this.responseMessage = errorMessage;
        if (errorMessage) return false;

        this.isWorking = true;

        const body: DocumentModel = this.textDocForm.value;
        const fd = new FormData();
        if (this.file) {
            fd.append('DocFile', this.file);
        }
        this.dService.addOrUpdateTextDoc(body, fd)
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
        if (this.textDocForm.dirty) {
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
