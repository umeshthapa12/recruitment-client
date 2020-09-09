import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, NgControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTabGroup } from '@angular/material/tabs';
import { of, Subject } from 'rxjs';
import { delay, filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { DynamicFormMetadata, ErrorCollection, ResponseModel, DropdownModel } from '../../../../../../models';
import { ControlActionTypes, ControlBase, ControlTypes } from '../../../../../../models/dynamic-form/control-base';
import { Dropdown } from '../../../../../../models/dynamic-form/controls/dropdown';
import { Textbox } from '../../../../../../models/dynamic-form/controls/textbox';
import { collectionInOut, fadeIn, RandomUnique } from '../../../../../../utils';
import { MainComponent } from '../main.component';
import { JobService } from '../../../employer/jobs/jobs/job.service';
import { DropdownProviderService } from '../../../../components/shared/services/dropdown-provider.service';
import { SnackToastService } from '../../../../components/shared/snakbar-toast/toast.service';
import { ChangesConfirmComponent } from '../../../../components/shared/changes-confirm/changes-confirm.component';

@Component({
    selector: 'questionnaire-form',
    templateUrl: './questionnaire-form.component.html',
    animations: [fadeIn, collectionInOut],
   // providers: [ControlService],
    styles: [`
        .m-badge-custom {
            line-height: 0;
            vertical-align: bottom;
            padding: 0;
            border-radius: 0;
            margin:0 3px;
            padding:3px
        }
        .properties-wrap{
            max-height: 50vh;
            overflow-y: auto;
            margin-top:10px;
        }
        .mat-dialog-container{
            padding:10px !important;
        }
        .control-list{
            max-height: 55vh;
            overflow-y: auto;
            box-shadow: 0px 9px 8px -1px rgb(216, 216, 216), 0px 10px 7px 0 rgba(199, 199, 199, 0.14), 1px 13px 9px 0 rgba(111, 111, 111, 0.12);
        }
        .item-control{
            transition: background .2s ease-in;
            padding: 0 4px;
            border-radius: 5px;
        }
        .item-control-selected{
            background: #f2f6ff;
        }
        .cdk-drag-preview {
                box-sizing: border-box;
                border-radius: 4px;
                box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
                    0 8px 10px 1px rgba(0, 0, 0, 0.14),
                    0 3px 14px 2px rgba(0, 0, 0, 0.12);
        }

        .cdk-drag-animating {
             transition: transform 250ms cubic-bezier(.53,.59,.58,.94);
        }

        .control-list.cdk-drop-list-dragging .item-control:not(.cdk-drag-placeholder) {
             transition: transform 250ms cubic-bezier(.53,.59,.58,.94);
        }

        .item-control-custom-placeholder {
            background: #EEEEEE;
            border: dotted 3px #999;
            min-height: 60px;
            transition: transform 250ms cubic-bezier(.53,.59,.58,.94);
        }

        .cdk-drag-handle{
            cursor:move;
        }
    `]
})
export class QuestionnaireFormComponent implements OnInit, AfterViewInit, OnDestroy {
    private toDestroy$ = new Subject<void>();
    type = ControlTypes;

    @Input() openingId: number;

    @Input() questions: ControlBase[] = [];

    form: FormGroup;
    @ViewChild('toolTabs', { static: true }) mTab: MatTabGroup;
    selectedControl: ControlBase;

    questionTitles: DropdownModel[] = [];

    isError: boolean;
    response: ResponseModel;
    errors: ErrorCollection[];
    isWorking: boolean;
    workingFor: string;
    notExist: boolean;
    isLoading: boolean;

    /**
     * Option's controls are cached to keep track on error states.
     */
    cachedControls: AbstractControl[] = [];

    private confirmFn = (e: BeforeUnloadEvent) => {
        (e || window.event).preventDefault();
        (e || window.event).cancelBubble = true;
        (e || window.event).returnValue = '\o/'; // Gecko + IE
        return '\o/'; // Gecko + Webkit, Safari, Chrome etc.
    }

    private readonly reloadConfirm = () => window.addEventListener('beforeunload', this.confirmFn);

    constructor(
        private jService: JobService,
        private dropdown: DropdownProviderService,
        private notify: SnackToastService,
        private cdr: ChangeDetectorRef,
        private uniqueGen: RandomUnique,
      //  private qcs: ControlService,
        private dialog: MatDialog,
        private dialogRef: MatDialogRef<MainComponent>) {

        document.getElementById(this.dialogRef.id).style.padding = '10px';
        this.dropdown.getDynamicFormTitles().pipe(takeUntil(this.toDestroy$))
            .subscribe({ next: d => this.questionTitles = d });

        this.form = new FormGroup({
            // add static UI helper form control to track changes
            existingTemplateId: new FormControl(),
            templateTitle: new FormControl(null, Validators.required)
        });

    }

    ngOnInit() {

        // this.form = this.qcs.toFormGroup(this.questions);

        this.form.get('existingTemplateId').valueChanges.pipe(
            takeUntil(this.toDestroy$), filter(_ => _ > 0),
            switchMap(id => this.dropdown.getDynamicFormMetadata<ControlBase[]>(id).pipe(takeUntil(this.toDestroy$)))
        ).subscribe({
            next: q => {
                this.questions = q;
                const t = this.questionTitles.find(_ => +_.key == +this.form.get('existingTemplateId').value);
                this.form.get('templateTitle').setValue(t && t.value);
            }
        });

    }

    ngAfterViewInit() {
        this.initLoadData();
    }

    ngOnDestroy() {
        window.removeEventListener('beforeunload', this.confirmFn);
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    trackByFn = (_: any, index: number) => index;

    saveChanges(action: string) {

        this.clearStates();

        if (!(this.openingId > 0)) {
            this.isError = true;
            this.response = { messageBody: 'You have to create an opening first and then you add criteria to it. Please create an opening from `Basic Control` section and then try again.' };
            return false;
        }

        if (action == 'remove') {
            if (!(this.notExist))
                this.removeData(action);
            return false;
        }

        if (!(this.questions.length > 0)) {
            this.isError = true;
            this.response = { messageBody: `There are no items to submit. Please add a control from the toolbox tab and try again` };
            return false;
        }

        if (this.form.get('templateTitle').invalid) {
            this.isError = true;
            this.response = { messageBody: `Template title of the toolbox tab is required. Please enter a title and try again.` };
            return false;
        }

        this.addOrUpdateData(action);

    }

    private addOrUpdateData(action: string) {
        this.isWorking = true;
        this.workingFor = action;
        const body: DynamicFormMetadata = {
            formMetadata: this.questions,
            openingId: this.openingId,
            templateTitle: this.form.get('templateTitle').value
        };

        this.jService.addOrUpdateDynamicForm(body).pipe(
            takeUntil(this.toDestroy$), delay(800)
        ).subscribe({
            next: res => [
                this.notify.when('success', res, () => this.clearStates()),
                this.form.markAsPristine(),
                this.notExist = false,
            ],
            error: e => {
                this.response = {};
                this.isError = true;
                this.isWorking = false;
                const model: ResponseModel = e.error;
                const errors: ErrorCollection[] = model && model.contentBody && model.contentBody.errors;
                // Check if server returning number of error list, if so make these as string
                if (errors && errors.length > 0) {
                    this.errors = errors;
                    this.response.messageBody = model.messageBody;
                }
            }
        });
    }

    private removeData(action: string) {

        this.isWorking = true;
        this.workingFor = action;
        const that = this;
        function cleanup() {
            that.clearControlStats(),
                that.form.reset(),
                that.clearStates(),
                that.questions = [];
        }

        this.jService.removeDynamicFormData(this.openingId).pipe(
            takeUntil(this.toDestroy$), delay(400)
        ).subscribe({
            next: res => [
                this.notify.when('success', res, () => cleanup()),
                this.notExist = true
            ],
            error: _ => this.notify.when('danger', _, () => cleanup())
        });
    }

    controlActionInvoked(c: ControlActionTypes) {

        this.clearControlStats();

        if (c.selected) {
            this.selectedControl = this.questions.find(_ => _.key === c.key);
            this.mTab.selectedIndex = 1;
            return;
        }

        const index = this.questions.findIndex(_ => _.key === c.key);

        if (!(index > -1)) return;

        // make a copy
        if (c.copied) {
            // key is being use as a form group property
            const key = this.uniqueGen.uid().replace(/\-/g, '');
            const control = this.questions[index];
            const item = {
                ...control,
                options: control.options ? [...control.options.map(e => ({ ...e }))] : null,
                key: key,
            };
            this.questions.splice(index, 0, item);

        }

        // remove from both collection and the form group
        if (c.removed) {
            this.questions.splice(index, 1);

            // back to control tab
            if (this.questions.length <= 0) this.mTab.selectedIndex = 0;
        }

        // user confirmation if needed
        if (this.questions.length > 0)
            this.reloadConfirm();
        else window.removeEventListener('beforeunload', this.confirmFn);
    }

    addControl(type: ControlTypes) {
        const control = this.generateControl(type);

        this.questions.push(control);

        if (this.questions.length > 0)
            this.reloadConfirm();
        else window.removeEventListener('beforeunload', this.confirmFn);
    }

    controlOptionAction(a: string, index: number) {

        const selectedEl = this.questions.find(_ => _.key === this.selectedControl.key);
        if (!selectedEl) return;
        let len = this.selectedControl.options.length;

        if (a === 'add') {
            selectedEl.options.splice(index, 0, {
                key: this.uniqueGen.uid().replace('-', ''),
                label: `${selectedEl.type === ControlTypes.checkbox ? 'check' : 'option'} ` + (len++),
            });
        } else {
            if (selectedEl.options.length === 1) return;

            selectedEl.options.splice(index, 1);

            this.cachedControls.splice(index, 1);
        }

        this.selectedControl = selectedEl;
    }

    updateOptionLabel(i: number, model: NgControl) {

        const index = this.questions.findIndex(_ => _.key === this.selectedControl.key);
        this.questions[index].options[i].label = this.selectedControl.options[i].label;

        const ci = this.cachedControls.indexOf(model.control);
        if (ci > -1) this.cachedControls[ci] = model.control;
        else this.cachedControls.push(model.control);

        // error stats
        this.cachedControls.forEach((control, i, arr) => {
            const isDup = arr.findIndex(_ => _.value === control.value) !== i;
            setTimeout(() => {
                if (control.value === '') control.setErrors({ required: true });
                else if (isDup) control.setErrors({ duplicate: true });
                else control.setErrors(null);
            }, 0);
        });

    }

    cancel() {
        if (this.form.dirty || this.questions.length > 0) {
            this.dialog.open(ChangesConfirmComponent).afterClosed()
                .pipe(filter(_ => _))
                .subscribe(_ => this.dialogRef.close());
        } else {
            this.dialogRef.close();
        }
    }

    dropControl = (event: CdkDragDrop<ControlBase[]>) => moveItemInArray(this.questions, event.previousIndex, event.currentIndex);

    clearStates() {
        this.workingFor = null;
        this.isWorking = false;
        this.isError = false;
        this.response = null;
        this.errors = null;
    }

    private clearControlStats() {
        this.selectedControl = null;
    }

    private generateControl(type: ControlTypes) {

        // key is being use as a form group property
        const key = this.uniqueGen.uid().replace(/\-/g, '');

        let len = this.questions.length;

        switch (type) {
            case ControlTypes.textarea:
            case ControlTypes.textbox:
            case ControlTypes.date:
            case ControlTypes.time:
            case ControlTypes.checkbox:
            case ControlTypes.radio:
                return new Textbox({
                    key: key,
                    label: 'untitled label',
                    placeholder: 'enter a value',
                    type: type,
                    options: (type === ControlTypes.checkbox || type === ControlTypes.radio)
                        ? [
                            {
                                key: this.uniqueGen.uid().replace(/\-/g, ''),
                                label: `${type === ControlTypes.checkbox ? 'check' : 'option'} ` + (len++),
                                value: type === ControlTypes.checkbox ? false : null
                            },
                            {
                                key: this.uniqueGen.uid().replace(/\-/g, ''),
                                label: `${type === ControlTypes.checkbox ? 'check' : 'option'} ` + (len++),
                            }

                        ] : []
                });
            case ControlTypes.dropdown:
                return new Dropdown({
                    key: key,
                    label: 'untitled label',
                    options: [
                        {
                            key: this.uniqueGen.uid().replace(/\-/g, ''),
                            label: 'option ' + (len++),
                        },
                        {
                            key: this.uniqueGen.uid().replace(/\-/g, ''),
                            label: 'option ' + (len++),
                        }
                    ],
                    placeholder: 'select an option'
                });
        }
    }

    private initLoadData() {
        of(this.openingId).pipe(
            filter(id => id > 0), takeUntil(this.toDestroy$),
            delay(100), tap(_ => this.isLoading = true),
            switchMap(id => this.jService.getDynamicForm(id)),
            takeUntil(this.toDestroy$), delay(800),
            tap(_ => [this.isLoading = false, this.notExist = !(_ && _.contentBody)]),
            filter(res => res && res.contentBody),

        ).subscribe({
            next: res => {
                this.cdr.markForCheck();
                const d: DynamicFormMetadata = res.contentBody;
                this.form.get('templateTitle').setValue(d.templateTitle);
                this.questions = d.formMetadata;
            },
            error: _ => this.isLoading = false
        });
    }
}
