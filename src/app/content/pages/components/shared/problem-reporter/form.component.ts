import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChildren } from '@angular/core';
import { FormBuilder, FormControlName, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { delay, takeUntil } from 'rxjs/operators';
import { ResponseModel } from '../../../../../models';
import { BaseUrlCreator, GenericValidator } from '../../../../../utils';
import { SnackToastService } from '../snakbar-toast/toast.service';

@Component({
    templateUrl: './form.component.html',
})
export class ProblemFormComponent implements OnInit, AfterViewInit, OnDestroy {

    private readonly toDestroy$ = new Subject<void>();

    form: FormGroup;
    displayMessage: any = {};
    private genericValidator: GenericValidator;
    @ViewChildren(FormControlName, { read: ElementRef })
    private readonly formInputElements: ElementRef[];

    isWorking: boolean;

    private readonly api = this.url.createUrl('Problem', 'Jobs');

    constructor(
        private http: HttpClient,
        private url: BaseUrlCreator,
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<ProblemFormComponent>,
        private notify: SnackToastService
    ) {
        this.genericValidator = new GenericValidator({
            'problem': {
                'required': 'This field is required.'
            }
        });
    }

    ngOnInit() {
        this.form = this.fb.group({
            fullName: null,
            email: null,
            // location mean the current url of the angular route.
            problemLocation: (window.location.href || document.location.href),
            problem: [null, Validators.required]
        });
    }

    ngAfterViewInit() {
        this.genericValidator
            .initValidationProcess(this.form, this.formInputElements)
            .subscribe({ next: m => this.displayMessage = m });
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    saveChanges() {

        if (this.form.invalid) return;

        this.isWorking = true;
        this.http.post<ResponseModel>(`${this.api}/Create`, this.form.value)
            .pipe(delay(800), takeUntil(this.toDestroy$)).subscribe({
                next: res => [this.isWorking = false, this.dialogRef.close(), this.notify.when('success', res)],
                error: _ => [this.isWorking = false]
            });
    }
}
