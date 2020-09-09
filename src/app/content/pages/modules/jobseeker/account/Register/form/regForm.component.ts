import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChildren } from '@angular/core';
import { FormBuilder, FormControlName, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Select } from '@ngxs/store';
import { fromEvent, merge, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, map, shareReplay, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ResponseModel, UsersModel } from '../../../../../../../models';
import { GenericValidator } from '../../../../../../../utils';
import { SnackToastService } from '../../../../../components/shared/snakbar-toast/toast.service';
import { IRegister } from './shared/regForm.model';
import { RegFormService } from './shared/regForm.service';

@Component({
    templateUrl: './regForm.component.html',
    styles: [`
    .category{
        width:93.5%;
        background: white;
    }
    `]
})
export class RegFormComponent implements OnInit, AfterViewInit, OnDestroy {

    regForm: FormGroup;

    private toDestroy$ = new Subject<void>();
    // for validation
    @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
    private genericValidator: GenericValidator;
    displayMessage: { [key: string]: string } | any = {};

    response: any;
    emailExists: any;

    isError = false;
    isWorking = false;
    isAgreeChecked: boolean;
    jobCategories: [{ key: number, value: string }];

    constructor(
        private dialog: MatDialog,
        private rService: RegFormService,
        private fb: FormBuilder,
        private notify: SnackToastService,
        private cdr: ChangeDetectorRef) {

        this.genericValidator = new GenericValidator({
            'fullName': {
                'required': 'This field is required.'
            },
            'mobileNumber': {
                'required': 'This field is required.',
                'pattern': 'Only number are allowed.',
            },
            'email': {
                'required': 'This field is required.',
                'pattern': 'Enter Valid email address.',
            },
            'password': {
                'required': 'This field is required.'
            },
            'password2': {
                'required': 'This field is required.',
                'compare': 'Confirm password does not match.'
            }
        });
    }

    onsubmit() {
        this.cdr.markForCheck();
        if (this.regForm.pristine || (this.regForm.dirty && this.regForm.invalid)) {
            this.response = {};
            this.response.messageBody = 'Required fields are not filled. Please check the form below.';

            Object.keys(this.regForm.controls).map(a => {
                const ctrl = this.regForm.controls[a];
                ctrl.markAsDirty();
                ctrl.updateValueAndValidity();
            });

            const vw = setTimeout(() => {
                document.getElementById('res-messages').scrollIntoView({ behavior: 'smooth' });
                clearTimeout(vw);
            }, 100);
            this.isWorking = false;
            this.isError = true;
            return false;
        }

        this.isWorking = true;
        this.isError = false;

        const newdata: IRegister = this.regForm.value;

        this.rService.addOrUpdate(newdata).pipe(
            takeUntil(this.toDestroy$),
            debounceTime(800)
        ).subscribe(_ => {
            this.cdr.markForCheck();
            this.response = _;
            this.isWorking = false;
            this.isError = false;
            this.notify.when('success', _, null, { duration: 15000 });
        }, _ => [this.cdr.markForCheck(), this.isWorking = false, this.isError = true]);
    }

    ngAfterViewInit() {
        this.validation();

        // for async email validation
        this.regForm.get('email').valueChanges.pipe(
            takeUntil(this.toDestroy$),
            filter(_ => _ && this.regForm.get('email').valid),
            distinctUntilChanged(),
            debounceTime(200),
            switchMap(_ => {
                return this.rService.lookup(_).pipe(
                    shareReplay(),
                    takeUntil(this.toDestroy$),
                    tap(() => this.emailExists = null),
                    catchError(() => {
                        this.cdr.markForCheck();
                        this.emailExists = null;
                        return of(undefined);
                    })
                );
            }),
            filter(_ => _ && _.contentBody && _.contentBody.exist)
        ).subscribe(_ => {
            this.cdr.markForCheck();
            this.emailExists = _;
        }, () => {
            this.cdr.markForCheck();
            this.emailExists = null;
        });

    }

    ngOnInit() {
        this.rForm();

        this.rService.getJobCategory().pipe(
            takeUntil(this.toDestroy$)
        ).subscribe(res => this.jobCategories = res);
    }

    rForm() {
        this.regForm = this.fb.group({
            fullName: [null, [Validators.required]],
            jobCategoryId: null,
            mobileNumber: [null, [Validators.required, Validators.pattern(/^\d+$/)]],
            email: [null, [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+')]],
            password: [null, [Validators.required]],
            password2: [null, [Validators.required]],
        });
    }

    ngOnDestroy() {

        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    ShowTermsCOnditions() {
        this.dialog.open(TermsAndConditionsComponent, {
            autoFocus: false,
            width: '800px'
        });
    }

    private validation() {
        const controlBlurs: Observable<any>[] = this.formInputElements
            .map(fCtrl => fromEvent(fCtrl.nativeElement, 'blur'));
        merge(this.regForm.valueChanges, ...controlBlurs)
            .pipe(
                debounceTime(800),
                takeUntil(this.toDestroy$),
            ).subscribe(_ => [this.cdr.markForCheck(), this.displayMessage = this.genericValidator.processMessages(this.regForm)]);
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
