import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ToastSnackbarModule } from '../snakbar-toast/toast.module';
import { ProblemFormComponent } from './form.component';

@NgModule({
    declarations: [ProblemFormComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PerfectScrollbarModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressSpinnerModule,
        ToastSnackbarModule
    ],
    exports: [ProblemFormComponent],
    entryComponents: [ProblemFormComponent],
    providers: [],
})
export class ProblemReportModule { }
