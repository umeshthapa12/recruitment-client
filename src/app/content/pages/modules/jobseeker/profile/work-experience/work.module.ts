import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { ChangesConfirmModule } from '../../../../components/shared/changes-confirm/changes-confirm.module';
import { DeleteConfirmModule } from '../../../../components/shared/delete-confirm/delete-confirm.module';
import { SharedDirectivesModule } from '../../../../components/shared/directives/directives.module';
import { MatCardPlaceholderModule } from '../../../../components/shared/grid-placeholder/mat-card-placeholder/placeholder.module';
import { WorkFormComponent } from './child/work-form.component';
import { WorkComponent } from './work.component';
import { WorkService } from './work.service';

@NgModule({
    declarations: [
        WorkComponent,
        WorkFormComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatNativeDateModule,
        MatDatepickerModule,
        MatDialogModule,
        RouterModule.forChild([
            { path: '', component: WorkComponent }
        ]),
        MatTooltipModule,
        ChangesConfirmModule,
        DeleteConfirmModule,
        MatDividerModule,
        SharedDirectivesModule,
        MatCardPlaceholderModule,
        MatCheckboxModule,
        MatIconModule,
    ],
    providers: [
        WorkService,
    ],

    entryComponents: [
        WorkFormComponent
    ]
})

export class WorkModule {

}
