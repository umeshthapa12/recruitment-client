import { Component, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';

@Component({
    templateUrl: './delete-confirm.component.html'
})

export class DeleteConfirmComponent implements OnDestroy {
    isWorking: boolean = false;
    private toDestroy$ = new Subject<void>();

    constructor(
        private dialogRef: MatDialogRef<DeleteConfirmComponent>
    ) {
        this.dialogRef.updateSize('250px', '200px');
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    deleted() {
        this.isWorking = true;

        setTimeout(() => {
            this.dialogRef.close(true);
            this.isWorking = false;
        }, 800);
    }
}
