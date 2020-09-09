import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SnackToastComponent } from './toast.component';
import { SnackToastService } from './toast.service';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AlertComponent } from './alert.component';

@NgModule({
    declarations: [SnackToastComponent , AlertComponent],
    imports: [CommonModule, MatSnackBarModule, MatTooltipModule, MatIconModule],
    exports: [SnackToastComponent],
    providers: [
        SnackToastService,
        { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 10000 } }
    ],
    entryComponents: [SnackToastComponent]
})
export class ToastSnackbarModule { }
