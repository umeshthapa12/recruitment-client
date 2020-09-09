import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChildren } from '@angular/core';
import { FormBuilder, FormControlName, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Select } from '@ngxs/store';
import { fromEvent, merge, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, map, shareReplay, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ResponseModel, UsersModel } from '../../../../../../../models';
import { GenericValidator } from '../../../../../../../utils';
import { SnackToastService } from '../../../../../components/shared/snakbar-toast/toast.service';
import { CompanyRegisterService } from './company-register.service';

@Component({
  templateUrl: './company-register.component.html'
})
export class CompanyRegisterComponent implements OnInit, OnDestroy, AfterViewInit {

  genericValidator: GenericValidator;
  displayMessage: { [key: string]: string } & any = {};
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
  private toDestroy$ = new Subject<void>();

  emailExists: any;
  registerForm: FormGroup;
  isAgreeChecked: boolean;
  isWorking = null;
  isError: boolean;
  response: any;
  compTypes: [{ key: number, value: string }];

  constructor(
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private dialog: MatDialog,
    public registerService: CompanyRegisterService,
    private notify: SnackToastService
  ) {
    this.genericValidator = new GenericValidator({
      orgName: {
        'required': 'Required.'
      },
      email: {
        'required': 'Required.',
        'pattern': 'Invalid.'
      },
      password: {
        'required': 'Required.'
      },
      cPassword: {
        'required': 'Required.',
        'compare': 'Confirm password does not match.'
      }
    });
  }

  ngOnInit() {
    this.rForm();

    this.registerService.getCompTypes().pipe(
      takeUntil(this.toDestroy$)
    ).subscribe(res => this.compTypes = res);
  }

  ngAfterViewInit() {
    this.validation();

    this.registerForm.get('email').valueChanges.pipe(
      takeUntil(this.toDestroy$),
      filter(_ => _ && this.registerForm.get('email').valid),
      distinctUntilChanged(),
      debounceTime(200),
      switchMap(_ => {
        return this.registerService.lookup(_).pipe(
          shareReplay(),
          takeUntil(this.toDestroy$),
          tap(() => [this.cdr.markForCheck(), this.emailExists = null]),
          catchError(() => {
            this.cdr.markForCheck();
            this.emailExists = null;
            return of(undefined);
          })
        );
      }),
      filter(_ => _ && _.contentBody && _.contentBody.exist)
    ).subscribe(_ => {
      this.emailExists = _;
    }, () => {
      this.cdr.markForCheck();
      this.emailExists = null;
    });
  }

  rForm() {
    this.registerForm = this.fb.group({
      orgName: [null, Validators.required],
      companyTypeId: null,
      phone: null,
      email: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+')]],
      password: ['', Validators.required],
      cPassword: ['', [Validators.required]]
    });
  }

  ngOnDestroy() {
    this.toDestroy$.next();
    this.toDestroy$.complete();
  }

  register() {
    this.cdr.markForCheck();
    this.isError = false;
    this.isWorking = true;

    if (this.registerForm.pristine || (this.registerForm.dirty && this.registerForm.invalid)) {
      this.response = {};
      this.response.messageBody = 'Required fields are not filled. Please check the form below.';

      Object.keys(this.registerForm.controls).map(a => {
        const ctrl = this.registerForm.controls[a];
        ctrl.markAsDirty();
        ctrl.updateValueAndValidity();
      });

      const vw = setTimeout(() => {
        document.getElementById('res-messages').scrollIntoView({ behavior: 'smooth' });
        clearTimeout(vw);
      }, 100);
      this.isError = true;
      this.isWorking = false;
      return false;
    }

    this.isWorking = true;
    this.registerService.registercompany(this.registerForm.value)
      .subscribe(res => {
        this.cdr.markForCheck();
        this.response = res;
        this.isError = false;
        this.isWorking = false;
        this.notify.when('success', res, null, { duration: 15000 });
      }, err => {
        this.cdr.markForCheck();
        this.response = err;
        this.isError = true;
        this.isWorking = false;
        this.notify.when('danger', err);
      }
      );
  }

  ShowTermsCOnditions() {
    this.dialog.open(TermsAndConditionsComponent, {
      autoFocus: false,
      width: '800px'
    });
  }

  private validation() {

    const controlBlurs: Observable<any>[] = this.formInputElements
      .map((formControl: ElementRef) => fromEvent(formControl.nativeElement, 'blur'));
    merge(this.registerForm.valueChanges, ...controlBlurs).pipe(debounceTime(800),
      takeUntil(this.toDestroy$)
    ).subscribe(() => [this.cdr.markForCheck(), this.displayMessage = this.genericValidator.processMessages(this.registerForm)]);
  }
}

@Component({
  template: `
  <h1 mat-dialog-title>Terms & Conditions</h1>
  <div mat-dialog-content>
      <p [innerHTML]="termsContent"></p>
  </div>
  <div mat-dialog-actions style="justify-content: center;" class="mb-1">
      <button [mat-dialog-close]="true" type="button" class="btn m-btn--pill m-btn--air btn-outline-info btn-sm m-btn">Close</button>
  </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TermsAndConditionsComponent {
  @Select('userLogin')
  readonly userSession$: Observable<ResponseModel>;

  constructor() {
    this.userSession$.pipe(
      filter(_ => _ && _.contentBody),
      map(_ => ({ ...<UsersModel>_.contentBody }))
    ).subscribe({
      next: model => {

        const x = model && model.about && JSON.parse(model.terms).map(_ => _.insert).join(' ');
        this.termsContent = x;
      }
    });
  }

  termsContent: string;

}
