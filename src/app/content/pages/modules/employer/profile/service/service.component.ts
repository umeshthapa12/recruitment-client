import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { delay, filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ResponseModel } from '../../../../../../models';
import { ExtendedMatDialog, fadeInOutStagger, fadeInUpEnterOnly } from '../../../../../../utils';
import { DeleteConfirmComponent } from '../../../../components/shared/delete-confirm/delete-confirm.component';
import { SnackToastService } from '../../../../components/shared/snakbar-toast/toast.service';
import { ServiceFormComponent } from './service.form.component';
import { ServiceModel } from './service.model';
import { EmployerServiceProvidorService } from './services.service';

@Component({
    templateUrl: './service.component.html',
    animations: [fadeInUpEnterOnly, fadeInOutStagger],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServiceComponent implements OnInit, OnDestroy {

    serviceData: ServiceModel[] = [];

    private toDestroy$ = new Subject<void>();

    // trun on/off loading bar/placeholder when http request being made
    isLoading: boolean;

    constructor(
        private tService: EmployerServiceProvidorService,
        private dialog: MatDialog,
        private cdr: ChangeDetectorRef,
        private snackBar: SnackToastService,
        private dialogUtil: ExtendedMatDialog
    ) { }

    ngOnInit() {
        this.isLoading = true;
        this.tService.getService()
            .pipe(takeUntil(this.toDestroy$), delay(700))
            .subscribe(_ => [this.cdr.markForCheck(), this.serviceData = _.contentBody, this.isLoading = false], e => this.onError(e));
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    // E.G. https://netbasal.com/angular-2-improve-performance-with-trackby-cc147b5104e5
    trackById = (_: number, item: ServiceModel) => item.id;


    onAction(id: number) {

        let instance: MatDialogRef<ServiceFormComponent, ResponseModel>;
        const data = this.serviceData.find(_ => _.id === id);
        instance = this.dialog.open(ServiceFormComponent, {
            width: '500px',
            data: { content: data },
            autoFocus: false,
        });

        instance.afterClosed().pipe(
            takeUntil(this.toDestroy$),
            filter(res => res && res.contentBody),
            tap(res => {
                this.cdr.markForCheck();
                const d: ServiceModel = res.contentBody;
                const index = this.serviceData.findIndex(_ => _.id === d.id);
                if (index > -1) {
                    this.serviceData[index] = d;
                } else {
                    this.serviceData.unshift(d);
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
                switchMap(() => this.tService.deleteService(id)
                    .pipe(takeUntil(this.toDestroy$)))
            )
            .subscribe(res => {
                this.cdr.markForCheck();
                const index = this.serviceData.findIndex(_ => _.id === id);
                if (index > -1) {
                    this.serviceData.splice(index, 1);
                }
                this.onSuccess(res);
            }, e => this.onError(e));
    }

    private onSuccess(res: ResponseModel) {

        this.cdr.markForCheck();
        this.snackBar.when('success', res);
        this.isLoading = false;

    }

    private onError(ex: any) {

        this.cdr.markForCheck();
        this.snackBar.when('danger', ex);
        this.isLoading = false;
    }
}
