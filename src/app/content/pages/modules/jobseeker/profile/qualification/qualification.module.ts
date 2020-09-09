import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule, MAT_RIPPLE_GLOBAL_OPTIONS, RippleGlobalOptions } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { ChangesConfirmModule } from '../../../../components/shared/changes-confirm/changes-confirm.module';
import { DeleteConfirmModule } from '../../../../components/shared/delete-confirm/delete-confirm.module';
import { SharedDirectivesModule } from '../../../../components/shared/directives/directives.module';
import { MatCardPlaceholderModule } from '../../../../components/shared/grid-placeholder/mat-card-placeholder/placeholder.module';
import { QualificationFormComponent } from './child/qualification-form.component';
import { QualificationComponent } from './qualification.component';
import { QualificationService } from './qualification.service';
const globalRippleConfig: RippleGlobalOptions = { disabled: true };
@NgModule({
    declarations: [
        QualificationComponent,
        QualificationFormComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatDialogModule,
        RouterModule.forChild([
            { path: '', component: QualificationComponent }
        ]),
        MatTooltipModule,
        ChangesConfirmModule,
        DeleteConfirmModule,
        MatDividerModule,
        SharedDirectivesModule,
        MatCardPlaceholderModule,
        MatCheckboxModule
    ],
    providers: [
        { provide: MAT_RIPPLE_GLOBAL_OPTIONS, useValue: globalRippleConfig },
        QualificationService,
    ],
    entryComponents: [
        QualificationFormComponent
    ]
})

export class QualificationModule {

}
