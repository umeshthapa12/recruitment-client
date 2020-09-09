import { CdkDrag } from '@angular/cdk/drag-drop';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormControlName, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { delay, map, takeUntil } from 'rxjs/operators';
import { LoginCred, ResponseModel, UsersModel, UserType } from '../../../../../models';
import { AuthService } from '../../../../../services/auth.service';
import { InitUserLoginAction } from '../../../../../store/app-store';
import { ExtendedMatDialog, fadeIn, GenericValidator, Regex } from '../../../../../utils';

@Component({
    templateUrl: './login.component.html',
    animations: [fadeIn],
    styles: [`
        .m-login__title span {display:none}
        .m-login__title:hover span {
            display: inline-block;
        }
    `]
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {

    private readonly toDestroy$ = new Subject<void>();

    private genericValidator: GenericValidator;
    @ViewChildren(FormControlName, { read: ElementRef })
    private formInputElements: ElementRef[];
    loginForm: FormGroup = new FormGroup({
        email: new FormControl(null, [Validators.required, Validators.pattern(Regex.emailRegex)]),
        password: new FormControl(null, Validators.required),
        isPersistent: new FormControl(false)
    });

    displayMessage: any = {};
    isWorking: boolean;
    isError: boolean;
    response: ResponseModel;

    @ViewChild(CdkDrag, { static: true }) private drag: CdkDrag;

    constructor(
        private cdr: ChangeDetectorRef,
        private store: Store,
        private auth: AuthService,
        private exDialog: ExtendedMatDialog,
        private dialogRef: MatDialogRef<LoginComponent>,
        @Inject(MAT_DIALOG_DATA)
        private data: any
    ) {
        this.genericValidator = new GenericValidator({
            'password': {
                'required': 'This field is required.'
            },
            'email': {
                'required': 'This field is required.',
                'pattern': 'Email address is not valid.'
            }
        });
    }

    ngOnInit() {
        this.exDialog.makeTransparentWhenDragMove(this.drag);
    }

    ngAfterViewInit() {
        this.genericValidator
            .initValidationProcess(this.loginForm, this.formInputElements)
            .subscribe({ next: m => this.displayMessage = m });
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    onLogin() {
        this.cdr.markForCheck();
        this.isWorking = true;
        this.isError = false;
        this.response = null;

        const body: UsersModel = this.loginForm.value;

        if (this.loginForm.invalid) {
            this.isWorking = false;
            return;
        }

        const loginCred: LoginCred = { user: body, userType: UserType.JobSeeker };

        this.store.dispatch(new InitUserLoginAction({ contentBody: loginCred })).pipe(
            takeUntil(this.toDestroy$),
            delay(800),
            // slice from the store
            map(state => <ResponseModel>(state && state.userLogin && state.userLogin.initLogin))
        ).subscribe({
            next: res => [
                this.isError = false,
                this.isWorking = false,
                this.response = res,
                setTimeout(() => {
                    this.dialogRef.close();
                }, 1500)
            ],
            error: (e: ResponseModel) => [this.isError = true, this.isWorking = false, this.response = e]
        });

    }

    cancel = () => this.dialogRef.close();
}
