import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { delay, filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ResponseModel } from '../../../../../../models';
import { ExtendedMatDialog, fadeInOutStagger, fadeInUpEnterOnly } from '../../../../../../utils';
import { DeleteConfirmComponent } from '../../../../components/shared/delete-confirm/delete-confirm.component';
import { AlertType, SnackbarModel } from '../../../../components/shared/snakbar-toast/extended-snackbar.model';
import { SnackToastService } from '../../../../components/shared/snakbar-toast/toast.service';
import { TrainingFormComponent } from './child/training-form.component';
import { TrainingModel } from './training.model';
import { TrainingService } from './training.service';

@Component({
    selector: 'app-training',
    templateUrl: './training.component.html',
    animations: [fadeInUpEnterOnly, fadeInOutStagger],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class TrainingComponent implements OnInit, OnDestroy {

    trainingData: TrainingModel[] = [];

    private toDestroy$ = new Subject<void>();

    private readonly alertModel: SnackbarModel = { type: AlertType.success, message: 'Success', title: 'Success' };

    // trun on/off loading bar/placeholder when http request being made
    isLoading: boolean;

    constructor(
        private tService: TrainingService,
        private dialog: MatDialog,
        private cdr: ChangeDetectorRef,
        private snackBar: SnackToastService,
        private dialogUtil: ExtendedMatDialog
    ) { }

    ngOnInit() {
        this.isLoading = true;
        this.tService.getTraining()
            .pipe(takeUntil(this.toDestroy$), delay(700))
            .subscribe(_ => [this.cdr.markForCheck(), this.trainingData = _.contentBody, this.isLoading = false]);
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    // E.G. https://netbasal.com/angular-2-improve-performance-with-trackby-cc147b5104e5
    trackByIndex = (_: number, item: TrainingModel) => item.id;

    onAction(id: number) {

        let instance: MatDialogRef<TrainingFormComponent, ResponseModel>;

        instance = this.dialog.open(TrainingFormComponent, {
            width: '500px',
            data: { id: id },
            autoFocus: false,
        });

        instance.afterClosed().pipe(
            takeUntil(this.toDestroy$),
            filter(res => res && res.contentBody),
            tap(res => {
                this.cdr.markForCheck();
                const d: TrainingModel = res.contentBody;
                const index = this.trainingData.findIndex(_ => _.id === d.id);
                if (index > -1) {
                    this.trainingData[index] = d;
                } else {
                    this.trainingData.unshift(d);
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
                switchMap(() => this.tService.deleteTraining(id)
                    .pipe(takeUntil(this.toDestroy$)))
            )
            .subscribe(res => {
                this.cdr.markForCheck();
                const index = this.trainingData.findIndex(_ => _.id === id);
                if (index > -1) {
                    this.trainingData.splice(index, 1);
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
