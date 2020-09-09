import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChildren } from '@angular/core';
import { FormBuilder, FormControlName, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { fromEvent, merge, Observable, Subject } from 'rxjs';
import { debounceTime, filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { LoginCred, ResponseModel, UserType, CookieKeys } from '../../../../../models/app.model';
import { CookieService } from '../../../../../services/cookie.service';
import { InitUserLoginAction, ActivateOverlayAction, DeactivateOverlayAction } from '../../../../../store/app-store';
import { fadeInOutDown, GenericValidator, Regex } from '../../../../../utils';

@Component({
    selector: 'user-login',
    animations: [fadeInOutDown],
    templateUrl: './login.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [` .nav-item{ cursor: pointer} .m-login{
        font-family: Roboto,"Helvetica Neue",sans-serif;
    }`]
})
export class UserLoginComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
    loginForm: FormGroup;

    // when user submits the form, we show/hide a spinner button.
    isWorking = false;

    // response messages
    response: ResponseModel;
    isError: boolean;

    // slice of response state
    @Select('userLogin', 'initLogin') login$: Observable<ResponseModel>;

    private toDestroy$ = new Subject<void>();

    private genericValidator: GenericValidator;

    // Use with the generic validation message class
    displayMessage: { [key: string]: string; } = {};

    rememberMe = false;
    invalidEmail: string;
    selectedTab: string = 'job-seeker';

    constructor(
        private store: Store,
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef,
        private cookieService: CookieService) {

        this.genericValidator = new GenericValidator({
            'email': {
                'required': 'Email is required.',
                'pattern': 'Email is not valid.'
            },
            'password': {
                'required': 'Password is required',
            }
        });

    }

    ngOnInit() {
        this.loginForm = this.fb.group({

            email: [null, [Validators.required, Validators.pattern(Regex.emailRegex)]],

            password: [null, Validators.required],

            isPersistent: null

        });
    }

    ngAfterViewInit() {

        this.validation();

    }

    private validation() {

        const controlBlurs: Observable<any>[] = this.formInputElements
            .map((formControl: ElementRef) => fromEvent(formControl.nativeElement, 'blur'));
        // Merge the blur event observable with the valueChanges observable
        merge(this.loginForm.valueChanges, ...controlBlurs).pipe(takeUntil(this.toDestroy$), debounceTime(1000))
            .subscribe(() => [this.cdr.markForCheck(), this.displayMessage = this.genericValidator.processMessages(this.loginForm)]);
    }

    onLogin(logTo: string) {

        // cleanup
        localStorage.removeItem('js-avatar');
        localStorage.removeItem(CookieKeys.Subject);
        localStorage.removeItem(CookieKeys.UUId);

        // don't process over and over again to impact performance
        if (Object.keys(this.displayMessage).filter(c => c && this.displayMessage[c].length > 0).length > 0) { return; }

        // init when form being submitted
        this.isWorking = true;

        if (this.loginForm.invalid) {
            const controls = this.loginForm.controls;
            Object.keys(controls)
                .map(key => controls[key])
                .forEach(c => [c.markAsDirty(), c.updateValueAndValidity(), this.cdr.detectChanges()]);
            this.isWorking = false; return;
        }

        this.loginForm.get('isPersistent').setValue(this.rememberMe);

        let type: UserType;
        switch (logTo) {
            case 'jobseeker':
                type = UserType.JobSeeker;
                break;
            case 'employer':
                type = UserType.Employer;
                break;
        }

        const cred: LoginCred = {
            userType: type,
            user: this.loginForm.value
        };

        this.store.dispatch(new InitUserLoginAction({ contentBody: cred })).pipe(
            tap(_ => [this.cdr.markForCheck(), this.response = null]),
            switchMap(_ => this.login$),
            filter(res => res?.contentBody),
            tap(res => [this.cdr.markForCheck(), this.response = res]),
            debounceTime(400),
            takeUntil(this.toDestroy$),
        ).subscribe({
            next: _ => [
                this.cdr.markForCheck(),
                this.isWorking = false,
                this.isError = false,
                this.store.dispatch(new DeactivateOverlayAction())
            ],
            error: errorRes => {
                this.cdr.markForCheck();
                this.isWorking = false;
                this.isError = true;
                this.response = errorRes.error;
            }
        });
    }

    reset(e: Event, selected: string) {
        this.cdr.markForCheck();
        this.selectedTab = selected;
        e.preventDefault();
        e.stopPropagation();
        this.response = null;
        this.isWorking = false;
        this.loginForm.reset();
        this.rememberMe = false;
        this.displayMessage = {};
        return false;
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

}
