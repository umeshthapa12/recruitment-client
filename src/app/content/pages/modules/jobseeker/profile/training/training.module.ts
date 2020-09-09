import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { ChangesConfirmModule } from '../../../../components/shared/changes-confirm/changes-confirm.module';
import { DeleteConfirmModule } from '../../../../components/shared/delete-confirm/delete-confirm.module';
import { SharedDirectivesModule } from '../../../../components/shared/directives/directives.module';
import { MatCardPlaceholderModule } from '../../../../components/shared/grid-placeholder/mat-card-placeholder/placeholder.module';
import { TrainingFormComponent } from './child/training-form.component';
import { TrainingComponent } from './training.component';
import { TrainingService } from './training.service';

@NgModule({
    declarations: [
        TrainingComponent,
        TrainingFormComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatInputModule,
        MatSelectModule,
        MatNativeDateModule,
        MatDatepickerModule,
        MatDialogModule,
        RouterModule.forChild([
            { path: '', component: TrainingComponent }
        ]),
        MatTooltipModule,
        ChangesConfirmModule,
        DeleteConfirmModule,
        MatDividerModule,
        SharedDirectivesModule,
        MatCardPlaceholderModule
    ],

    exports: [

    ],
    providers: [
        TrainingService,
    ],
    entryComponents: [
        TrainingFormComponent
    ]
})

export class TrainingModule {

}
