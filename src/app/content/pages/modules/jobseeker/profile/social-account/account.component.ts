import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { delay, filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ResponseModel } from '../../../../../../models';
import { ExtendedMatDialog, fadeInOutStagger, fadeInUpEnterOnly } from '../../../../../../utils';
import { DeleteConfirmComponent } from '../../../../components/shared/delete-confirm/delete-confirm.component';
import { AlertType, SnackbarModel } from '../../../../components/shared/snakbar-toast/extended-snackbar.model';
import { SnackToastService } from '../../../../components/shared/snakbar-toast/toast.service';
import { AccountModel } from './account.model';
import { AccountService } from './account.service';
import { AccountFormComponent } from './child/account-form.component';

@Component({
    templateUrl: './account.component.html',
    animations: [fadeInUpEnterOnly, fadeInOutStagger],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class AccountComponent implements OnInit, OnDestroy {

    socialAcc: AccountModel[] = [];

    private toDestroy$ = new Subject<void>();

    private readonly alertModel: SnackbarModel = { type: AlertType.success, message: 'Success', title: 'Success' };

    // trun on/off loading bar/placeholder when http request being made
    isLoading: boolean;

    constructor(
        private tService: AccountService,
        private dialog: MatDialog,
        private cdr: ChangeDetectorRef,
        private snackBar: SnackToastService,
        private dialogUtil: ExtendedMatDialog
    ) { }

    ngOnInit() {
        this.isLoading = true;
        this.tService.getSocialAccount()
            .pipe(takeUntil(this.toDestroy$), delay(700))
            .subscribe(_ => [this.cdr.markForCheck(), this.socialAcc = _.contentBody, this.isLoading = false]);
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    // E.G. https://netbasal.com/angular-2-improve-performance-with-trackby-cc147b5104e5
    trackById = (_: number, item: AccountModel) => item.id;

    socialIcon(n: string) {
        switch (n.toLowerCase()) {
            case 'facebook':
                return 'socicon-facebook m--font-info';
            case 'twitter':
                return 'socicon-twitter m--font-accent';
            case 'skype':
                return 'socicon-skype m--font-info';
            case 'google':
                return 'socicon-google m--font-danger';
            case 'linkedin':
                return 'socicon-linkedin m--font-primary';
            default:
                return 'la la-globe m--font-info';
        }
    }

    onAction(id: number) {

        let instance: MatDialogRef<AccountFormComponent, ResponseModel>;

        instance = this.dialog.open(AccountFormComponent, {
            width: '500px',
            data: { id: id },
            autoFocus: false,
        });

        instance.afterClosed().pipe(
            takeUntil(this.toDestroy$),
            filter(res => res && res.contentBody),
            tap(res => {
                this.cdr.markForCheck();
                const d: AccountModel = res.contentBody;
                const index = this.socialAcc.findIndex(_ => _.id === d.id);
                if (index > -1) {
                    this.socialAcc[index] = d;
                } else {
                    this.socialAcc.unshift(d);
                }
            })
        ).subscribe(res => this.onSuccess(res), e => this.onError(e));

        this.dialogUtil.animateBackdropClick(instance);
    }

    onDelete(id: number) {
        const instance = this.dialog.open(DeleteConfirmComponent);
        instance.afterClosed()
            .pipe(
                takeUntil(this.toDestroy$),
                filter(yes => yes),
                switchMap(() => this.tService.deleteSocialAccount(id)
                    .pipe(takeUntil(this.toDestroy$)))
            )
            .subscribe(res => {
                this.cdr.markForCheck();
                const index = this.socialAcc.findIndex(_ => _.id === id);
                if (index > -1) {
                    this.socialAcc.splice(index, 1);
                }
                this.onSuccess(res);
            }, e => this.onError(e));
    }

    private onSuccess(res: ResponseModel) {
        this.cdr.markForCheck();


        this.snackBar.when('success', res);
    }

    private onError(ex: any) {
        this.cdr.markForCheck();

        this.snackBar.when('danger', ex);

    }
}
