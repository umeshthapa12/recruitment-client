import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, Subject } from 'rxjs';
import { debounceTime, delay, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { CriteriaModel, ErrorCollection, ResponseModel } from '../../../../../../models';
import { fadeIn } from '../../../../../../utils';
import { ChangesConfirmComponent } from '../../../../components/shared/changes-confirm/changes-confirm.component';
import { SnackToastService } from '../../../../components/shared/snakbar-toast/toast.service';
import { JobService } from '../../../employer/jobs/jobs/job.service';
import { MainComponent } from '../main.component';

@Component({
    selector: 'criteria',
    templateUrl: './criteria-form.html',
    animations: [fadeIn],
    styles: [`
        .m-switch label{
            margin-top:7px;
        }
        .m-switch label span{
            margin:0;
        }
        .toggle-column {
            margin: 15px 0 0 0;
            transition:background .4s cubic-bezier(.10,.85,.16,.90), border-radius .6s cubic-bezier(1,.28,.71,.94), box-shadow .5s ease-in;
        }
        .toggle-column:hover {
            background:#FFFFFF;
            border-radius: 50px;
            box-shadow: 0px 5px 4px 0px rgba(81,77,92,0.07)
        }
    `]
})
export class CriteriaForm implements OnInit, AfterViewInit, OnDestroy {

    private toDestroy$ = new Subject<void>();

    criteriaForm: FormGroup;

    isWorking: boolean;
    workingFor: string;
    notExist: boolean;

    // either from parent component or from the store
    @Input() openingId: number;

    private payloadBody: CriteriaModel;
    response: ResponseModel;
    errors: ErrorCollection[];
    isError: boolean;
    isLoading: boolean;

    /**
     * Static criteria data to save and validate.
     * The keys are column names while the values are display text.
     * Modifying to the key could lead to wrong validation process
     * It us safe to modify value's value
     */
    private readonly staticCriteriaData = [
        { key: 'defaultExperience', value: 'Work Experience' },
        { key: 'qualification', value: 'Qualification' },
        { key: 'experienceLevel', value: 'Experience Level' },
        { key: 'skillKeywords', value: 'Skills' },
        { key: 'location', value: 'Location' },
        { key: 'jobType', value: 'job Type' },
        { key: 'minAge', value: 'Minimum Age' },
        { key: 'maxAge', value: 'Maximum Age' },
        { key: 'maritalStatus', value: 'Marital Status' },
        { key: 'gender', value: 'Gender' }
    ];

    constructor(
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder,
        private dialog: MatDialog,
        private dialogRef: MatDialogRef<MainComponent>,
        private jService: JobService,
        private notify: SnackToastService

    ) { }

    ngOnInit() {
        this.initForm();
    }

    saveChanges(action: string) {

        this.resetStates();

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

        if (!(this.payloadBody && this.payloadBody.columns && this.payloadBody.columns.length > 0)) {
            this.isError = true;
            this.response = { messageBody: 'No items were selected. Please selected an item and try again.' };
            return false;
        }

        this.addOrUpdateData(action);
    }

    private addOrUpdateData(action: string) {
        this.isWorking = true;
        this.workingFor = action;
        // TODO: add criteria to an opening.
        this.jService.addOrUpdateCriteria(this.payloadBody).pipe(takeUntil(this.toDestroy$), delay(800)).subscribe({
            next: res => [
                this.notify.when('success', res, () => this.resetStates()),
                this.criteriaForm.markAsPristine(),
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

        this.jService.removeCriteria(this.openingId).pipe(
            takeUntil(this.toDestroy$), delay(400)
        ).subscribe({
            next: res => [
                this.criteriaForm.reset(),
                this.notify.when('success', res, () => this.resetStates()),
                this.notExist = true
            ],
            error: _ => this.notify.when('danger', _, () => this.resetStates())
        });
    }

    cancel() {
        if (this.criteriaForm.dirty) {
            this.dialog.open(ChangesConfirmComponent).afterClosed()
                .pipe(
                    filter(_ => _)
                ).subscribe(_ => this.dialogRef.close());
        } else {
            this.dialogRef.close();
        }
    }

    ngAfterViewInit() {

        // tracks user changes
        this.prepPayloadBody();

        this.initLoadData();

    }

    private initLoadData() {
        of(this.openingId).pipe(
            filter(id => id > 0), takeUntil(this.toDestroy$),
            delay(100), tap(_ => this.isLoading = true),
            switchMap(id => this.jService.getCriteria(id)),
            takeUntil(this.toDestroy$), delay(800),
            tap(_ => [this.isLoading = false, this.notExist = !(_ && _.contentBody)]),
            filter(res => res && res.contentBody)
        ).subscribe({
            next: res => this.patchForm(res.contentBody),
            error: _ => this.isLoading = false
        });
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    resetStates() {
        this.cdr.markForCheck();
        this.workingFor = null;
        this.isError = false;
        this.response = null;
        this.errors = null;
        this.isWorking = false;
    }

    private prepPayloadBody() {
        this.criteriaForm.valueChanges.pipe(debounceTime(200), map(_ =>
            // only select keys which value are `true`
            Object.keys(this.criteriaForm.value).filter(k => this.criteriaForm.get(k).value))
        ).subscribe({
            next: columns => this.payloadBody = {
                openingId: this.openingId,
                columns: columns.map(key => {
                    return { key: key, value: this.staticCriteriaData.find(_ => _.key === key).value };
                })
            }
        });
    }

    private initForm() {
        this.criteriaForm = this.fb.group({
            defaultExperience: null,
            qualification: null,
            experienceLevel: null,
            skillKeywords: null,
            location: null,
            jobType: null,
            minAge: null,
            maxAge: null,
            maritalStatus: null,
            gender: null,
        });

        this.criteriaForm.valueChanges.pipe(
            takeUntil(this.toDestroy$),
        ).subscribe({ next: _ => [this.dialogRef.disableClose = this.criteriaForm.dirty || this.criteriaForm.invalid] });
    }

    private patchForm(d: CriteriaModel) {

        if (!d) return;
        /*
         We've saved field names so the response body returns array of column (property) names
        */
        this.criteriaForm.patchValue({
            // we search for the name, toggle check if contains
            defaultExperience: d.columns.findIndex(_ => _.key === 'defaultExperience') > -1,
            qualification: d.columns.findIndex(_ => _.key === 'qualification') > -1,
            experienceLevel: d.columns.findIndex(_ => _.key === 'experienceLevel') > -1,
            skillKeywords: d.columns.findIndex(_ => _.key === 'skillKeywords') > -1,
            location: d.columns.findIndex(_ => _.key === 'location') > -1,
            jobType: d.columns.findIndex(_ => _.key === 'jobType') > -1,
            minAge: d.columns.findIndex(_ => _.key === 'minAge') > -1,
            maxAge: d.columns.findIndex(_ => _.key === 'maxAge') > -1,
            maritalStatus: d.columns.findIndex(_ => _.key === 'maritalStatus') > -1,
            gender: d.columns.findIndex(_ => _.key === 'gender') > -1,
        });
    }


}
