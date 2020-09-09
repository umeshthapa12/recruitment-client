import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { delay, filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ResponseModel } from '../../../../../../models';
import { ExtendedMatDialog, fadeInOutStagger, fadeInUpEnterOnly } from '../../../../../../utils';
import { DeleteConfirmComponent } from '../../../../components/shared/delete-confirm/delete-confirm.component';
import { SnackToastService } from '../../../../components/shared/snakbar-toast/toast.service';
import { DocFormComponent } from './doc-form.component';
import { DocModel, DocumentModel } from './document.model';
import { DocumentService } from './document.service';

@Component({
    selector: 'app-documents',
    templateUrl: './document.component.html',
    animations: [fadeInUpEnterOnly, fadeInOutStagger],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class DocumentComponent implements OnInit, OnDestroy {

    private toDestroy$ = new Subject<void>();
    // private content: DocModel;
    content: DocumentModel[] = [];

    isLoading: boolean;

    constructor(
        private dService: DocumentService,
        private dialog: MatDialog,
        private cdr: ChangeDetectorRef,
        private snackBar: SnackToastService,
        private dialogUtil: ExtendedMatDialog
    ) { }

    ngOnInit() {
        this.isLoading = true;
        this.dService.getTextDocs()
            .pipe(takeUntil(this.toDestroy$), delay(700))
            .subscribe(_ => {
                this.cdr.markForCheck();
                const m: DocModel = _.contentBody;
                this.content = [...m.textFile, ...m.docFile];
                this.isLoading = false;
            });
    }

    // E.G. https://netbasal.com/angular-2-improve-performance-with-trackby-cc147b5104e5
    trackById = (_: number, item: DocumentModel) => item.id;

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    onAction(id: number) {

        let instance: MatDialogRef<DocFormComponent, ResponseModel>;
        const data = { id: id };

        instance = this.dialog.open(DocFormComponent, {
            width: '790px',
            data: data,
            autoFocus: false,
        });

        instance.afterClosed().pipe(
            takeUntil(this.toDestroy$),
            filter(res => res && res.contentBody),
            tap(res => {
                this.cdr.markForCheck();
                const d: DocModel = res.contentBody;
                const item = Object.assign({}, ...d.docFile, ...d.textFile);
                const index = this.content.findIndex(_ => _.id === item.id);
                if (index > -1) {
                    this.content[index] = item;
                } else {
                    this.content.unshift(item);
                }
            })
        ).subscribe(res => this.onSuccess(res), e => this.onError(e));

        this.dialogUtil.animateBackdropClick(instance);
    }

    onDelete(id: number) {
        const instance = this.dialog.open(DeleteConfirmComponent);
        const index = this.content.findIndex(_ => _.id === id);
        const item = this.content[index];
        instance.afterClosed()
            .pipe(
                takeUntil(this.toDestroy$),
                filter(yes => yes),
                switchMap(() => {
                    if (item && item.urls) {
                        return this.dService.deleteFile(item.urls.deleteUrl).pipe(takeUntil(this.toDestroy$));
                    } else
                        return this.dService.deleteTextDoc(id).pipe(takeUntil(this.toDestroy$));
                })
            )
            .subscribe(res => {
                this.cdr.markForCheck();

                if (index > -1) {
                    this.content.splice(index, 1);
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
