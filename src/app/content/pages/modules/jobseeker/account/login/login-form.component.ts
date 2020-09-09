import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChildren } from '@angular/core';
import { FormBuilder, FormControlName, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { fromEvent, merge, Observable, Subject } from 'rxjs';
import { debounceTime, delay, map, takeUntil, tap } from 'rxjs/operators';
import { LoginCred, UserType } from '../../../../../../models';
import { InitUserLoginAction } from '../../../../../../store/app-store';
import { GenericValidator } from '../../../../../../utils';

@Component({
    templateUrl: './login-form.component.html',
})
export class LoginFormComponent implements OnInit, AfterViewInit, OnDestroy {

    private returnUrl = null;
    loginForm: FormGroup;
    private readonly toDestroy$ = new Subject<void>();

    // for validation
    @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
    private genericValidator: GenericValidator;
    displayMessage: { [key: string]: string } | any = {};

    response: any;
    isWorking = false;
    isError = false;

    constructor(
        private route: ActivatedRoute,
        private fb: FormBuilder,
        private store: Store,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {
        this.genericValidator = new GenericValidator({
            'email': {
                'required': 'This field is required.',
                'pattern': 'Email is not valid.'
            },
            'password': {
                'required': 'This field is required.',
            }
        });
    }

    ngAfterViewInit() {
        this.validation();
    }

    ngOnInit() {
        this.lForm();
    }

    lForm() {
        this.loginForm = this.fb.group({
            email: [null, [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+')]],
            password: [null, [Validators.required]],
            isPersistent: false
        });
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    login() {
        this.cdr.markForCheck();
        this.response = null;
        this.isError = null;
        this.isWorking = null;

        if (this.loginForm.pristine) {
            this.response = {};
            this.response.messageBody = 'Email or password cannot be empty.';
            this.isError = true;
            return false;
        }

        this.isWorking = true;
        this.isError = false;

        this.returnUrl = this.route.snapshot.queryParams['ReturnUrl'];

        const cred: LoginCred = {
            userType: UserType.JobSeeker,
            user: this.loginForm.value
        };

        this.store.dispatch(new InitUserLoginAction({ contentBody: cred }))
            .pipe(
                // select a slice from state [state name].[slice of action args]
                map(state => state?.userLogin?.initLogin),
                tap(res => [this.isError = false, this.response = res]),
                debounceTime(1000),
                takeUntil(this.toDestroy$)
            ).subscribe(_ => {
                this.cdr.markForCheck();
                const toReturn = this.returnUrl ? this.returnUrl : '';
                const url = this.returnUrl ? toReturn : '/jobseeker/dashboard';
                this.router.navigateByUrl(url);

                this.isWorking = false;
                this.isError = false;
            }, res => {
                this.cdr.markForCheck();
                this.response = res;
                this.isWorking = false;
                this.isError = true;
            });
    }

    private validation() {
        const controlBlurs: Observable<any>[] = this.formInputElements
            .map(fCtrl => fromEvent(fCtrl.nativeElement, 'blur'));
        merge(this.loginForm.valueChanges, ...controlBlurs)
            .pipe(
                debounceTime(800),
                takeUntil(this.toDestroy$),
            ).subscribe(_ => this.displayMessage = this.genericValidator.processMessages(this.loginForm));
    }


}
