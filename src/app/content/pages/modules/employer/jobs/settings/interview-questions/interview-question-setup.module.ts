import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ToastSnackbarModule } from '../../../../../components/shared/snakbar-toast/toast.module';
import { FiltersModule } from '../../../../shared/filters/filters.module';
import { InterviewQuestionSetupFormComponent } from './interview-q-setup-form.component';
import { InterviewQuestionSetupComponent } from './interview-question-setup.component';
import { InterviewSetupService } from './interview-setup.service';

@NgModule({
    declarations: [InterviewQuestionSetupComponent, InterviewQuestionSetupFormComponent],
    entryComponents: [InterviewQuestionSetupFormComponent],
    imports: [
        RouterModule.forChild([
            { path: '', component: InterviewQuestionSetupComponent, }
        ]),
        CommonModule,
        MatDialogModule,
        ToastSnackbarModule,
        FiltersModule,
        MatPaginatorModule,
        MatSortModule,
        MatTableModule,
        MatMenuModule,
        MatProgressSpinnerModule,
        PerfectScrollbarModule
    ],
    exports: [],
    providers: [InterviewSetupService],
})
export class InterviewQuestionSetupModule { }
