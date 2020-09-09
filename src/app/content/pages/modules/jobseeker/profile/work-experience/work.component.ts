import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { delay, filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ResponseModel } from '../../../../../../models';
import { ExtendedMatDialog, fadeInOutStagger } from '../../../../../../utils';
import { DeleteConfirmComponent } from '../../../../components/shared/delete-confirm/delete-confirm.component';
import { SnackToastService } from '../../../../components/shared/snakbar-toast/toast.service';
import { WorkFormComponent } from './child/work-form.component';
import { WorkExperienceModel } from './work.model';
import { WorkService } from './work.service';
@Component({
    selector: 'app-work',
    templateUrl: './work.component.html',
    animations: [fadeInOutStagger],
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class WorkComponent implements OnInit, OnDestroy {
    workData: WorkExperienceModel[] = [];

    private toDestroy$ = new Subject<void>();

    // trun on/off loading bar/placeholder when http request being made
    isLoading: boolean;

    constructor(
        private wService: WorkService,
        private dialog: MatDialog,
        private cdr: ChangeDetectorRef,
        private snackBar: SnackToastService,
        private dialogUtil: ExtendedMatDialog
    ) { }

    ngOnInit() {
        this.isLoading = true;

        this.wService.getWorkExpes()
            .pipe(takeUntil(this.toDestroy$), delay(1500))
            .subscribe(_ => [this.cdr.markForCheck(), this.workData = _.contentBody, this.isLoading = false]);
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    calculateDuration(s: string, e: string) {
        if (!s) return 0;
        const start = moment(s);
        const end = moment(e || new Date());
        const yrs = end.diff(start, 'years');
        const mos = end.diff(start, 'months');
        // console.log(yrs, (mos -(yrs * 12)));
        return `${yrs} Year(s) ${(mos - (yrs * 12))} Month(s)`;
    }

    // E.G. https://netbasal.com/angular-2-improve-performance-with-trackby-cc147b5104e5
    trackByIndex = (_: number, item) => item.id;

    onAction(id: number, focusTo: string) {
        let instance: MatDialogRef<WorkFormComponent, ResponseModel>;
        const data = { focusToElem: focusTo, id: id };

        instance = this.dialog.open(WorkFormComponent, {
            width: '600px',
            data: data,
            autoFocus: false,
        });

        instance.afterClosed().pipe(
            takeUntil(this.toDestroy$),
            filter(res => res && res.contentBody),
            tap(res => {
                this.cdr.markForCheck();
                const d: WorkExperienceModel = res.contentBody;
                const index = this.workData.findIndex(_ => _.id === d.id);
                if (index > -1) {
                    this.workData[index] = d;
                } else {
                    this.workData.unshift(d);
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
                switchMap(() => this.wService.deleteWorkExpe(id)
                    .pipe(takeUntil(this.toDestroy$)))
            )
            .subscribe(res => {
                this.cdr.markForCheck();
                const index = this.workData.findIndex(_ => _.id === id);
                if (index > -1) {
                    this.workData.splice(index, 1);
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
