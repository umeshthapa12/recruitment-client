import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { } from 'q';
import { Subject } from 'rxjs';
import { delay, filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ResponseModel } from '../../../../../../models';
import { ExtendedMatDialog, fadeInOutStagger, fadeInUpEnterOnly } from '../../../../../../utils';
import { DeleteConfirmComponent } from '../../../../components/shared/delete-confirm/delete-confirm.component';
import { SnackToastService } from '../../../../components/shared/snakbar-toast/toast.service';
import { QualModel } from '../../../shared/models';
import { QualificationFormComponent } from './child/qualification-form.component';
import { QualificationService } from './qualification.service';

@Component({
    selector: 'app-qualification',
    templateUrl: './qualification.component.html',
    animations: [fadeInUpEnterOnly, fadeInOutStagger],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class QualificationComponent implements OnInit, OnDestroy, AfterViewInit {

    qualiData: QualModel[] = [];

    private toDestroy$ = new Subject<void>();

    // trun on/off loading bar/placeholder when http request being made
    isLoading: boolean;
    studyStatus = ['Running', 'Completed'];

    constructor(
        private qService: QualificationService,
        private dialog: MatDialog,
        private cdr: ChangeDetectorRef,
        private snackBar: SnackToastService,
        private dialogUtil: ExtendedMatDialog
    ) {
    }

    ngOnInit() {

        this.isLoading = true;
        this.qService.getQualific()
            .pipe(takeUntil(this.toDestroy$), delay(1500))
            .subscribe(_ => [this.cdr.markForCheck(), this.qualiData = _.contentBody, this.isLoading = false]);
    }

    ngAfterViewInit() {
    }

    // e.g. https://netbasal.com/angular-2-improve-performance-with-trackby-cc147b5104e5
    trackById = (_: number, item: QualModel) => item.id;

    getStatus = (s: boolean) => s ? this.studyStatus[0] : this.studyStatus[1];

    getSecuredIn(s: string, score: number) {
        return s && s.toLowerCase() === 'cgpa' ? `CGPA ${score}` : `${score}%`;
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    onAction(id: number, focusTo: string) {

        let instance: MatDialogRef<QualificationFormComponent, ResponseModel>;
        const data = { focusToElem: focusTo, id: id };

        instance = this.dialog.open(QualificationFormComponent, {
            width: '550px',
            data: data,
            autoFocus: false,
        });

        instance.afterClosed().pipe(
            takeUntil(this.toDestroy$),
            filter(res => res && res.contentBody),
            tap(res => {
                this.cdr.markForCheck();
                const d: QualModel = res.contentBody;
                const index = this.qualiData.findIndex(_ => _.id === d.id);
                if (index > -1) {
                    this.qualiData[index] = d;
                } else {
                    this.qualiData.unshift(d);
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
                switchMap(() => this.qService.deleteQualific(id)
                    .pipe(takeUntil(this.toDestroy$)))
            )
            .subscribe(res => {
                this.cdr.markForCheck();
                const index = this.qualiData.findIndex(_ => _.id === id);
                if (index > -1) {
                    this.qualiData.splice(index, 1);
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
