import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';
import { catchError, delay, takeUntil } from 'rxjs/operators';
import { ResponseModel } from '../../../../../../models';
import { LoginService } from '../login/shared/login.service';
import { GoToComponent } from './go.component';

@Component({
    templateUrl: './verify.component.html'
})
export class AccountVerifyComponent implements OnDestroy, AfterViewInit {

    private toDestroy$ = new Subject<void>();

    isWorking: boolean;
    response: ResponseModel;
    isError: boolean;

    username: string;

    constructor(
        private cdr: ChangeDetectorRef,
        private route: ActivatedRoute,
        private lService: LoginService,
        private dialog: MatDialog
    ) { }


    ngAfterViewInit() {
        this.iniAcV();
    }

    private iniAcV() {

        this.cdr.markForCheck();
        const token = this.route.snapshot.queryParams['t'];
        this.isWorking = (token || '') !== '';

        if (!token) return;

        this.lService.emailVerify(token).pipe(catchError(e => of(e)), delay(2500), takeUntil(this.toDestroy$)).subscribe({
            next: res => {
                // handle error response
                this.cdr.markForCheck();
                this.isWorking = false;
                const isError = res instanceof HttpErrorResponse;
                const m: ResponseModel = isError ? (res.error || {}) : res;
                this.isError = isError;
                this.response = m;
                this.username = isError ? null : m.contentBody.username;
            }
        });

    }

    navigateConfirm(area: string, url: string) {
        this.dialog.open(GoToComponent, {
            data: { email: this.username, takenArea: area, url: url },
            width: '350px',
            disableClose: true
        });
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }
}
