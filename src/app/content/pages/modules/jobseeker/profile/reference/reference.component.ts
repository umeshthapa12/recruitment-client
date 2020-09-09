import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { delay, filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ResponseModel } from '../../../../../../models';
import { ExtendedMatDialog, fadeInOutStagger, fadeInUpEnterOnly } from '../../../../../../utils';
import { DeleteConfirmComponent } from '../../../../components/shared/delete-confirm/delete-confirm.component';
import { SnackToastService } from '../../../../components/shared/snakbar-toast/toast.service';
import { ReferenceFormComponent } from './child/reference-form.component';
import { ReferenceModel } from './reference.model';
import { ReferenceService } from './reference.service';

@Component({
    selector: 'app-reference',
    templateUrl: './reference.component.html',
    animations: [fadeInUpEnterOnly, fadeInOutStagger],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class ReferenceComponent implements OnInit, OnDestroy {

    refData: ReferenceModel[] = [];

    private toDestroy$ = new Subject<void>();

    // trun on/off loading bar/placeholder when http request being made
    isLoading: boolean;

    constructor(
        private rService: ReferenceService,
        private dialog: MatDialog,
        private cdr: ChangeDetectorRef,
        private snackBar: SnackToastService,
        private dialogUtil: ExtendedMatDialog
    ) { }

    ngOnInit() {
        this.isLoading = true;
        this.rService.getRefs()
            .pipe(takeUntil(this.toDestroy$), delay(700))
            .subscribe(_ => [this.cdr.markForCheck(), this.refData = _.contentBody, this.isLoading = false], e => this.onError(e));
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    // E.G. https://netbasal.com/angular-2-improve-performance-with-trackby-cc147b5104e5
    trackById = (_: number, item: ReferenceModel) => item.id;


    onAction(id: number) {

        let instance: MatDialogRef<ReferenceFormComponent, ResponseModel>;

        instance = this.dialog.open(ReferenceFormComponent, {
            width: '500px',
            data: { id: id },
            autoFocus: false,
        });

        instance.afterClosed().pipe(
            takeUntil(this.toDestroy$),
            filter(res => res && res.contentBody),
            tap(res => {
                this.cdr.markForCheck();
                const d: ReferenceModel = res.contentBody;
                const index = this.refData.findIndex(_ => _.id === d.id);
                if (index > -1) {
                    this.refData[index] = d;
                } else {
                    this.refData.unshift(d);
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
                switchMap(() => this.rService.deleteRef(id)
                    .pipe(takeUntil(this.toDestroy$)))
            )
            .subscribe(res => {
                this.cdr.markForCheck();
                const index = this.refData.findIndex(_ => _.id === id);
                if (index > -1) {
                    this.refData.splice(index, 1);
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

        this.isLoading = false;
    }
}
