import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { SharedDirectivesModule } from '../../../components/shared/directives/directives.module';
import { ToastSnackbarModule } from '../../../components/shared/snakbar-toast/toast.module';
import { BasicJobFormComponent } from './child/basic-job-form.component';
import { CriteriaForm } from './child/criteria-form';
import { MandatoryForm } from './child/mandatory-form';
import { QualificationFormComponent } from './child/qualification-form';
import { ControlService } from './dynamic-form/control.service';
import { DynamicFormControlsComponent } from './dynamic-form/dynamic-form-controls.component';
import { QuestionnaireFormComponent } from './dynamic-form/questionnaire-form.component';
import { MainComponent } from './main.component';
import { SchedulePostConfirmComponent } from './schedule-post-confirm-inline.component';

@NgModule({
    declarations: [
        BasicJobFormComponent,
        CriteriaForm,
        MandatoryForm,
        QualificationFormComponent,
        DynamicFormControlsComponent,
        QuestionnaireFormComponent,
        MainComponent,
        SchedulePostConfirmComponent
    ],
    imports: [
        CommonModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        PerfectScrollbarModule,
        ToastSnackbarModule,
        SharedDirectivesModule,
        MatSelectModule,
        MatDialogModule,
        MatInputModule,
        MatButtonModule,
        MatTooltipModule,
        MatIconModule,
        MatDatepickerModule,
        MatMomentDateModule,
        MatTabsModule,
        MatAutocompleteModule,
        MatChipsModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatMenuModule,
        MatCheckboxModule,
        MatTreeModule,
        DragDropModule,
        MatRadioModule,
    ],
    exports: [
        BasicJobFormComponent,
        CriteriaForm,
        MandatoryForm,
        QualificationFormComponent,
        DynamicFormControlsComponent,
        QuestionnaireFormComponent,
        MainComponent
    ],
    providers: [ControlService],
    entryComponents: [MainComponent, SchedulePostConfirmComponent]
})
export class SharedOpeningModule { }
