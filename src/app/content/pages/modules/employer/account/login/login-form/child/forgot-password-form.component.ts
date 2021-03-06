import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChildren } from '@angular/core';
import { FormBuilder, FormControlName, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { fromEvent, merge, Observable, Subject } from 'rxjs';
import { debounceTime, delay, takeUntil } from 'rxjs/operators';
import { LoginService } from '../login.service';
import { ResponseModel } from '../../../../../../../../models';
import { Regex, GenericValidator } from '../../../../../../../../utils';

@Component({
    templateUrl: './forgot-password-form.component.html'
})
export class ResetFormComponent implements OnInit, AfterViewInit, OnDestroy {

    forgotForm: FormGroup;
    resetForm: FormGroup;

    private toDestroy$ = new Subject<void>();

    @ViewChildren(FormControlName, { read: ElementRef })
    private formInputElements: ElementRef[];

    private genericValidator: GenericValidator;
    displayMessage: any = {};
    isWorking = null;
    response: ResponseModel;

    token: string;

    constructor(
        private fb: FormBuilder,
        private rService: LoginService,
        private router: Router,
        private route: ActivatedRoute,
        private cdr: ChangeDetectorRef
    ) {
        this.genericValidator = new GenericValidator({
            'email': {
                'required': 'This Field is required.',
                'pattern': 'Invalid email address.',
            },
            'pw1': {
                'required': 'This Field is required.',
            },
            'pw2': {
                'required': 'This Field is required.',
                'match': 'Confirm password does not match',
            },
        });

        // password reset token
        this.token = (this.route.snapshot.queryParams['t'] || '');
    }

    ngOnInit() {
        this.initForm();
    }

    ngAfterViewInit() {
        this.validation();

        // update the token value while user navigate to the different url
        this.router.events.pipe(takeUntil(this.toDestroy$), debounceTime(100))
            .subscribe({ next: _ => this.token = this.route.snapshot.queryParams['t'] });
    }

    initForm() {
        this.resetForm = this.fb.group({
            pw1: [null, [Validators.required]],
            pw2: [null, [Validators.required]],
        });

        this.forgotForm = this.fb.group({
            email: [null, [Validators.required, Validators.pattern(Regex.emailRegex)]],
        });
    }

    requestResetLink() {
        this.cdr.markForCheck();
        if (this.forgotForm.invalid) {
            this.response = { error: { messageBody: 'Email field must be valid!' } };
            return;
        }

        this.isWorking = true;
        this.response = null;

        this.rService.requestPasswordResetLink(this.forgotForm.value)
            .pipe(takeUntil(this.toDestroy$), delay(1000)).subscribe({
                next: res => {
                    this.cdr.markForCheck();
                    this.isWorking = false;
                    this.response = res;
                    this.forgotForm.reset();
                },
                error: e => {
                    this.cdr.markForCheck();
                    this.isWorking = false;
                    this.response = e;
                }
            });
    }

    resetPassword() {
        this.cdr.markForCheck();
        this.clear();

        if (this.resetForm.invalid) {
            this.response = { error: { messageBody: 'All fields are required!' } };
            return;
        }

        if ((this.token || '').trim().length <= 0) {
            this.response = { error: { messageBody: 'Token is in incorrect format. Please request a new link.' } };
            return;
        }

        this.isWorking = true;

        this.rService.setNewPassword({ password: this.resetForm.get('pw2').value, vToken: this.token })
            .pipe(takeUntil(this.toDestroy$), delay(1000)).subscribe({
                next: res => {
                    this.cdr.markForCheck();
                    this.isWorking = false;
                    res.messageBody = `${res.messageBody} Please wait while redirecting to the login..`;
                    this.response = res;
                    this.resetForm.reset();
                    setTimeout(() => {
                        this.router.navigate(['/employer/login']);
                    }, 3000);
                },
                error: e => {
                    this.cdr.markForCheck();
                    this.isWorking = false;
                    this.response = e;
                }
            });

    }

    clear() {
        this.cdr.markForCheck();
        this.isWorking = false;
        this.response = null;
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    private validation() {
        const controlBlurs: Observable<any>[] = this.formInputElements
            .map(fCtrl => fromEvent(fCtrl.nativeElement, 'blur'));
        merge(this.forgotForm.valueChanges, this.resetForm.valueChanges, ...controlBlurs)
            .pipe(
                debounceTime(800),
                takeUntil(this.toDestroy$),
            ).subscribe({
                next: _ => [this.cdr.markForCheck(), this.displayMessage = this.token.length > 0
                    ? this.genericValidator.processMessages(this.resetForm)
                    : this.genericValidator.processMessages(this.forgotForm)]
            });
    }
}
