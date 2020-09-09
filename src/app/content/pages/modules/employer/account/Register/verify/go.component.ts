import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { debounceTime, delay, filter, map, takeUntil, tap } from 'rxjs/operators';
import { LoginCred, ResponseModel, UserType } from '../../../../../../../models';
import { InitUserLoginAction } from '../../../../../../../store/app-store';

@Component({
    templateUrl: './go.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [`
        .fixed-close-icon {
            position: fixed;
            margin-top: -33px;
            margin-left: 314px;
            cursor: pointer;
            overflow: hidden;
            z-index: 99999;
            background: #ffffff;
            border-radius: 50%;
            color: #36a3f7 !important;
            padding: 2px;
            box-shadow: 0 0 4px 0 #707286;
            transition: .3s all
        }
    `]
})
export class GoToComponent implements OnInit, OnDestroy {

    private readonly toDestroy$ = new Subject<void>();

    isWorking: boolean;
    password: string = '';
    isError: boolean;
    response: ResponseModel;

    constructor(
        private cdr: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA)
        public data: { email: string, takenArea: string, url: string },
        public dialogRef: MatDialogRef<GoToComponent>,
        private store: Store,
        private router: Router) { }

    ngOnInit(): void {
        setTimeout(() => {
            this.isWorking = false;
        }, 2000);
    }

    goto() {
        this.cdr.markForCheck();

        // username & password cannot be empty
        if (this.data.email === '' || this.password === '') {
            this.isError = true;
            this.response = { messageBody: ' Password field cannot be empty.' };
            return;
        }

        this.isWorking = true;

        const cred: LoginCred = {
            userType: UserType.Employer,
            user: { email: this.data.email, password: this.password }
        };

        this.store.dispatch(new InitUserLoginAction({ contentBody: cred }))
            .pipe(   // select a slice from state [state name].[slice of action args]
                map(state => state?.userLogin?.initLogin),
                filter(res => !!res),
                debounceTime(400),
                tap(res => {
                    this.cdr.markForCheck();
                    this.isWorking = false;
                    this.response = res;
                }),
                delay(400),
                takeUntil(this.toDestroy$))
            .subscribe({
                next: _ => {
                    // after a successful authentication, redirect to the requested url
                    this.router.navigateByUrl(this.data.url);
                    this.dialogRef.close();
                }, error: e => {
                    const err: HttpErrorResponse = e;
                    console.log(e);
                    this.cdr.markForCheck();
                    this.isWorking = false;
                    this.isError = e;
                    this.response = err.error;
                }
            });
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    reset() {
        this.cdr.markForCheck();
        this.isError = null;
        this.isWorking = null;
        this.response = null;
    }
}
