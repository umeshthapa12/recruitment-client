import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Quill from 'quill';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { QuilljsService } from '../../../../../../utils';
import { ChangesConfirmComponent } from '../../../../components/shared/changes-confirm/changes-confirm.component';
import { BasicInfoService } from './basic-info.service';

@Component({
    templateUrl: './extra-setup-form.component.html',
})
export class ExtraSetupFormComponent implements OnInit, OnDestroy, AfterViewInit {

    private readonly toDestroy$ = new Subject<void>();

    @ViewChild('editor') editor: ElementRef<HTMLElement>;

    quill$: Quill;

    formControlName: string;

    constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: { contentOf: string, text: string, id: number },
        private dialogRef: MatDialogRef<ExtraSetupFormComponent>,
        private dialog: MatDialog,
        private fb: FormBuilder,
        private bService: BasicInfoService,
        private quilljsService: QuilljsService
    ) { }

    form: FormGroup;

    ngOnInit() {

        let props: any;
        switch (this.data.contentOf) {
            case 'faq':
                props = { faq: [null, Validators.required] };
                this.formControlName = 'faq';
                break;
            case 'tnc':
                props = { terms: [null, Validators.required] };
                this.formControlName = 'terms';
                break;
            case 'privacy':
                props = { privacy: [null, Validators.required] };
                this.formControlName = 'privacy';
                break;
            case 'disclaimer':
                props = { disclaimer: [null, Validators.required] };
                this.formControlName = 'disclaimer';
                break;
        }

        this.form = this.fb.group(props);


    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
        this.quill$ = null;
    }

    ngAfterViewInit() {

        Object.keys(this.form.value).forEach(prop => {

            this.quill$ = this.quilljsService
                .initQuill(this.editor)
                .textChangeValueSetter(this.form.get(prop), 'json')
                .getQuillInstance();

            this.quill$.setContents(JSON.parse(this.data.text));

        });

    }

    onSubmit() {

        const body = this.form.value;

        this.bService.updateBasicInfo({ ...body, id: this.data.id })
            .pipe(takeUntil(this.toDestroy$))
            .subscribe({ next: res => this.dialogRef.close(res) });

    }

    onCancel() {
        if (this.form.dirty) {
            this.dialog.open(ChangesConfirmComponent).afterClosed()
                .pipe(filter(_ => _), takeUntil(this.toDestroy$))
                .subscribe({ next: _ => this.dialogRef.close() });
        } else {
            this.dialogRef.close();
        }
    }

    title() {
        switch (this.data.contentOf) {
            case 'faq':
                return 'Frequently Asked Questions (FAQs)';
            case 'tnc':
                return 'Terms & Conditions';
            case 'privacy':
                return 'Privacy Policy';
            case 'disclaimer':
                return 'Disclaimer';
        }
    }
}
