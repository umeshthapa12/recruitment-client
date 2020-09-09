import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { CoreModule } from '../../../../core/core.module';
import { ContentPlaceholderModule } from '../shared/content-placeholder/placeholder.module';
import { SharedDirectivesModule } from '../shared/directives/directives.module';
import { DynamicFormModule } from '../shared/dynamic-form/dynamic-form.module';
import { JobListModule } from '../shared/job-listing/list.module';
import { ToastSnackbarModule } from '../shared/snakbar-toast/toast.module';
import { ApplyValidationInfoComponent } from './apply-validation-info.component';
import { JobSingleComponent } from './job-single.component';

@NgModule({
    declarations: [JobSingleComponent, ApplyValidationInfoComponent],
    exports: [JobSingleComponent],
    entryComponents: [JobSingleComponent, ApplyValidationInfoComponent],
    imports: [
        CommonModule,
        CoreModule,
        ToastSnackbarModule,
        RouterModule.forChild([{ path: '', component: JobSingleComponent }]),
        ContentPlaceholderModule,
        MatDividerModule,
        JobListModule,
        MatMenuModule,
        MatDialogModule,
        MatProgressBarModule,
        MatBottomSheetModule,
        DragDropModule,
        DynamicFormModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        SharedDirectivesModule,
    ],
    bootstrap: [JobSingleComponent],
    providers: [],
})
export class SingleJobModule { }
