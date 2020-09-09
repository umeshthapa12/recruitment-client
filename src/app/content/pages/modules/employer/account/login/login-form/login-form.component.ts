import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChildren } from '@angular/core';
import { FormBuilder, FormControlName, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { fromEvent, merge, Observable, Subject } from 'rxjs';
import { debounceTime, delay, map, takeUntil, tap } from 'rxjs/operators';
import { CookieKeys, LoginCred, ResponseModel, UserType } from '../../../../../../../models';
import { InitUserLoginAction } from '../../../../../../../store/app-store';
import { GenericValidator } from '../../../../../../../utils';

@Component({
  templateUrl: './login-form.component.html'
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {

  loginForm: FormGroup;
  message: ResponseModel;
  private returnUrl = null;
  isWorking = null;
  isError: boolean;

  genericValidator: GenericValidator;
  displayMessage: any = {};

  @ViewChildren(FormControlName, { read: ElementRef })
  private formInputElements: ElementRef[];

  private toDestroy$ = new Subject<void>();

  constructor(
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private store: Store) {
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

  ngOnInit() {
    this.form();
  }

  form() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required,
      Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+')]],
      password: ['', Validators.required],
      isPersistent: false
    });
  }

  ngAfterViewInit() {
    this.validation();

  }

  ngOnDestroy() {
    this.toDestroy$.next();
    this.toDestroy$.complete();
  }

  SignIn() {
    this.cdr.markForCheck();
    // cleanup
    localStorage.removeItem('js-avatar');
    localStorage.removeItem(CookieKeys.Subject);
    localStorage.removeItem(CookieKeys.UUId);

    this.cdr.markForCheck();
    if (this.loginForm.pristine) {
      this.message = {};
      this.message.messageBody = 'Email or password cannot be empty.';
      this.isError = true;
      return false;
    }

    this.message = null;
    this.isWorking = true;
    this.isError = false;

    this.returnUrl = this.route.snapshot.queryParams['ReturnUrl'];
    const cred: LoginCred = {
      userType: UserType.Employer,
      user: this.loginForm.value
    };

    this.store.dispatch(new InitUserLoginAction({ contentBody: cred }))
      .pipe(
        // select a slice from state [state name].[slice of action args]
        map(state => state?.userLogin?.initLogin),
        tap(res => {
          this.cdr.markForCheck();
          this.message = null;
          this.isError = false;
          this.message = res;
          this.isWorking = false;
        }),
        delay(900),
        takeUntil(this.toDestroy$),
      ).subscribe({
        next: _ => {
          setTimeout(() => {
            const toReturn = this.returnUrl ? this.returnUrl : '';
            const url = this.returnUrl ? toReturn : '/employer/dashboard';
            this.router.navigateByUrl(url);
          }, 200);
        },
        error: err => {
          this.cdr.markForCheck();
          this.message = err;
          this.isError = true;
          this.isWorking = false;
        }
      });
  }

  private validation() {
    const controlBlurs: Observable<any>[] = this.formInputElements
      .map((formControl: ElementRef) => fromEvent(formControl.nativeElement, 'blur'));
    merge(this.loginForm.valueChanges, ...controlBlurs).pipe(debounceTime(800),
      takeUntil(this.toDestroy$)
    ).subscribe({ next: _ => [this.cdr.markForCheck(), this.displayMessage = this.genericValidator.processMessages(this.loginForm)] });
  }

}

