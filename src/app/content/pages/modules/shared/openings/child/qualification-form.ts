import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Select } from '@ngxs/store';
import { Observable, of, Subject } from 'rxjs';
import { delay, filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { DropdownModel, ErrorCollection, QualificationModel, ResponseModel } from '../../../../../../models';
import { collectionInOut, fadeIn } from '../../../../../../utils';
import { ChangesConfirmComponent } from '../../../../components/shared/changes-confirm/changes-confirm.component';
import { SnackToastService } from '../../../../components/shared/snakbar-toast/toast.service';
import { JobService } from '../../../employer/jobs/jobs/job.service';
import { MainComponent } from '../main.component';

@Component({
    selector: 'qualification',
    templateUrl: './qualification-form.html',
    animations: [fadeIn, collectionInOut]
})
export class QualificationFormComponent implements OnInit, AfterViewInit, OnDestroy {

    private toDestroy$ = new Subject<void>();

    qualificationForm: FormGroup;

    @Select('dropdowns', 'qualification')
    qualification$: Observable<DropdownModel[]>;

    // either from parent component or from the store
    @Input() openingId: number;

    response: ResponseModel;
    errors: ErrorCollection[];
    isError: boolean;
    isWorking: boolean;
    workingFor: string;
    notExist: boolean;
    isLoading: boolean;

    originalQualification: DropdownModel[] = [];

    constructor(
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder,
        private dialog: MatDialog,
        private dialogRef: MatDialogRef<MainComponent>,
        private jService: JobService,
        private notify: SnackToastService,
    ) {

        this.qualification$.pipe(takeUntil(this.toDestroy$))
            .subscribe({ next: d => this.originalQualification = d });

    }

    ngOnInit() {
        this.initForm();
    }

    trackByFn = (_: any, index: number) => index;

    saveChanges(action: string) {

        this.clearStates();

        if (!(this.openingId > 0)) {

            this.isError = true;
            this.response = { messageBody: `You have to create an opening first and then you add qualification with work experience to it. Please create an opening from 'Basic Control' section and then try again.` };
            return false;
        }

        if (action == 'remove') {

            if (!(this.notExist))
                this.removeData(action);
            return false;
        }

        // data transformation
        const contents = (<[{ experience: string, qualification: DropdownModel }]>this.qualificationControls().value);

        if (contents && contents.findIndex(_ => _.experience == null || _.qualification == null) > -1) {
            this.isError = true;
            this.isWorking = false;
            this.response = { messageBody: `Form values are not filled. Please fill the form and try again.` };
            return false;
        }

        this.addOrUpdateData(contents, action);
    }

    private addOrUpdateData(contents: [{ experience: string; qualification: DropdownModel; }], action: string) {

        this.isWorking = true;
        this.workingFor = action;

        const body: QualificationModel[] = contents.map(_ => <QualificationModel>{
            openingId: this.openingId,
            qualificationId: _.qualification.key,
            qualification: _.qualification.value,
            experience: _.experience
        });

        this.jService.addOrUpdateQualification(body).pipe(takeUntil(this.toDestroy$), delay(800)).subscribe({
            next: res => [
                this.notify.when('success', res, () => this.clearStates()),
                this.qualificationForm.markAsPristine(),
                this.notExist = false
            ],
            error: e => {
                this.response = {};
                this.isError = true;
                this.isWorking = false;
                const model: ResponseModel = e.error;
                const errors: ErrorCollection[] = model.contentBody.errors;
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

        this.jService.removeQualification(this.openingId).pipe(takeUntil(this.toDestroy$), delay(400)).subscribe({
            next: res => {
                this.cdr.markForCheck();
                this.notExist = true;
                const ctrls = this.qualificationControls();
                ctrls.clear();
                ctrls.push(this.createItem());
                this.notify.when('success', res, () => this.clearStates());
            },
            error: _ => this.notify.when('danger', _, () => this.clearStates())
        });

    }

    cancel() {
        if (this.qualificationForm.dirty) {
            this.dialog.open(ChangesConfirmComponent).afterClosed()
                .pipe(filter(_ => _)).subscribe(_ => this.dialogRef.close());
        } else this.dialogRef.close();

    }

    qualificationAction(index: number) {

        const controls = this.qualificationControls();
        if (index > -1) controls.removeAt(index);
        else {
            if (this.originalQualification.length === controls.length) return;
            controls.push(this.createItem());
        }

    }

    qualificationControls = () => <FormArray>this.qualificationForm.get('qualifications');

    private createItem(model?: { selected: DropdownModel, experience: string }): FormGroup {
        return this.fb.group({
            qualification: [model ? model.selected : null, Validators.required],
            experience: [model ? model.experience : null, Validators.required]
        });
    }

    private initForm() {
        this.qualificationForm = this.fb.group({
            qualifications: this.fb.array(this.openingId > 0 ? [] : [this.createItem()]),
        });

        this.qualificationForm.valueChanges.pipe(
            takeUntil(this.toDestroy$),
        ).subscribe(_ => [this.dialogRef.disableClose = this.qualificationForm.dirty]);

    }

    private patchForm(d: QualificationModel[]) {

        const array = this.qualificationControls();

        const hasData = d && d.length > 0;
        this.notExist = !hasData;

        if (!hasData) {
            // if we have no collection in response data, init an element
            array.insert(0, this.createItem());
            return;
        }

        // refill
        d.forEach(q => {

            const m = {
                selected: { key: q.qualificationId, value: q.qualification },
                experience: q.experience
            };
            array.push(this.createItem(m));
        });
    }

    ngAfterViewInit() {

        this.initLoadData();

    }

    private initLoadData() {
        of(this.openingId).pipe(
            filter(id => id > 0), takeUntil(this.toDestroy$), delay(100),
            tap(_ => this.isLoading = true), switchMap(id => this.jService.getQualification(id)),
            takeUntil(this.toDestroy$), delay(800), tap(_ => this.isLoading = false),
        ).subscribe({
            next: res => this.patchForm(res && res.contentBody),
            error: _ => [this.isLoading = false]
        });
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    // to make mat-select object value as selected, must use compareWith prop
    qualificationPatch(o1: DropdownModel, o2: DropdownModel) {
        return o1 && o2 && o1.key === o2.key && o1.value === o2.value;
    }

    clearStates() {
        this.cdr.markForCheck();
        this.isError = false;
        this.response = null;
        this.errors = null;
        this.isWorking = false;
    }
}
