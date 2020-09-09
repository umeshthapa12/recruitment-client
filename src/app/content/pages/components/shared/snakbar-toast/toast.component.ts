import { Component } from '@angular/core';
import { MatSnackBarRef } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { fadeIn } from '../../../../../utils';
import { SnackbarModel } from './extended-snackbar.model';

@Component({
    selector: 'snack-toast',
    templateUrl: './toast.component.html',
    animations: [fadeIn]
})
export class SnackToastComponent {

    items = new BehaviorSubject<SnackbarModel[]>([]);

    constructor(
        // @Inject(MAT_SNACK_BAR_DATA)
        // public data: any,
        private snackRef: MatSnackBarRef<SnackToastComponent>
    ) {
    }

    close(id: string) {
        const index = this.items.value.findIndex(_ => _.uid === id);
        if (index > -1)
            this.items.value.splice(index, 1);
        if (index > -1 && this.items.value.length === 0)
            this.snackRef.dismiss();

    }
}
