import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { OpeningModel } from '../../../../../../../models';

@Component({
    templateUrl: './application.component.html',
    styleUrls: ['../../../../shared/shared.scss'],
    animations: []
})
export class ApplicationComponent implements OnInit, OnDestroy {

    private readonly toDestroy$ = new Subject<void>();

    constructor(
        private cdr: ChangeDetectorRef,
        private dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA)
        public data: OpeningModel,
        public dialogRef: MatDialogRef<ApplicationComponent>,
        // private notify: SnackToastService,
        private fb: FormBuilder
    ) { }

    ngOnInit() {
        // TODO: load list of questions from the API

    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

}
