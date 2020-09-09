import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { CoreModule } from '../../../../../../../core/core.module';
import { MessagingModule } from '../../../../shared/messaging/messaging.module';
import { ApplicationComponent } from './application.component';
import { InterviewQuestionFormComponent } from './interview-question-form.component';
import { InterviewQuestionComponent } from './interview-question.component';
import { QuestionsService } from './questions.service';


@NgModule({
    imports: [
        PerfectScrollbarModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild([
            { path: '', component: InterviewQuestionComponent }
        ]),
        MatProgressSpinnerModule,
        MatPaginatorModule,
        MatTooltipModule,
        MatCardModule,
        MatCheckboxModule,
        MatMenuModule,
        MatDialogModule,
        MatProgressBarModule,
        ScrollingModule,
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatMomentDateModule,
        CoreModule,
        MessagingModule,
        DragDropModule,
        MatDividerModule,
        MatSortModule,
        MatSelectModule
    ],
    declarations: [InterviewQuestionComponent, ApplicationComponent, InterviewQuestionFormComponent],
    providers: [QuestionsService],
    entryComponents: [ApplicationComponent, InterviewQuestionFormComponent]
})

export class InterViewQuestionModule {

}
