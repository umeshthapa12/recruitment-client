import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChildren } from '@angular/core';
import { FormBuilder, FormControl, FormControlName, FormGroup, Validators } from '@angular/forms';
import { fromEvent, merge, Observable, Subject } from 'rxjs';
import { debounceTime, delay, takeUntil } from 'rxjs/operators';
import { ResponseModel } from '../../../../../../models';
import { GenericValidator } from '../../../../../../utils';
import { SnackToastService } from '../../../../components/shared/snakbar-toast/toast.service';
import { ChangeService } from './change.service';

@Component({
    templateUrl: './change.component.html',
})
export class ChangeComponent implements OnInit, OnDestroy, AfterViewInit {

    changeForm: FormGroup;
    hideCurrent = true;
    hideNew = true;
    hideConfirm = true;

    response: any;
    isWorking: boolean;

    myRecaptcha = new FormControl(false);

    public toDestroy$ = new Subject<void>();

    @ViewChildren(FormControlName, { read: ElementRef }) fromInputElements: ElementRef[];
    private genericValidator: GenericValidator;
    displayMessage: { [key: string]: string } | any = {};
    isLoading: boolean;

    constructor(
        private fb: FormBuilder,
        private cService: ChangeService,
        private snackBar: SnackToastService,
    ) {
        this.genericValidator = new GenericValidator({
            'current': {
                'required': 'This field is required.'
            },
            'newPassword': {
                'required': 'This field is required.'
            },
            'updated': {
                'required': 'This field is required.',
                'compare': 'Password not match.'
            }
        });
    }

    ngOnInit() {
        this.cForm();
    }

    cForm() {
        this.changeForm = this.fb.group({
            current: [null, [Validators.required]],
            newPassword: [null, [Validators.required]],
            updated: [null, [Validators.required]]
        });
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    ngAfterViewInit() {
        this.validation();
    }

    onSubmit() {
        if ((this.changeForm.untouched || this.changeForm.dirty) && this.changeForm.invalid) {
            this.response = {};
            // this.response.messageBody = FormErrorMessage;

            Object.keys(this.changeForm.controls).map(a => {
                const ctrl = this.changeForm.controls[a];
                ctrl.markAsDirty();
                ctrl.updateValueAndValidity();
            });

            const vw = setTimeout(() => {
                document.getElementById('res-messages')
                    .scrollIntoView({ behavior: 'smooth' });
                clearTimeout(vw);
            }, 100);
            return false;
        }

        this.isWorking = true;

        this.cService.changePassword(this.changeForm.value).pipe(
            takeUntil(this.toDestroy$),
            delay(800)
        ).subscribe(res => this.onSuccess(res), e => this.onError(e));
    }

    private validation() {
        const controlBlurs: Observable<any>[] = this.fromInputElements
            .map(fCtrl => fromEvent(fCtrl.nativeElement, 'blur'));
        merge(this.changeForm.valueChanges, ...controlBlurs)
            .pipe(
                debounceTime
                    (800),
                takeUntil(this.toDestroy$),
            ).subscribe(_ => this.displayMessage =
                this.genericValidator.processMessages(this.changeForm));
    }

    private onSuccess(res: ResponseModel) {


        this.snackBar.when('success', res);

        this.isWorking = false;

    }

    private onError(ex: any) {


        this.snackBar.when('danger', ex);
        this.isWorking = false;

    }
}
