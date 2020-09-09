import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { ChangesConfirmModule } from '../../../../components/shared/changes-confirm/changes-confirm.module';
import { DeleteConfirmModule } from '../../../../components/shared/delete-confirm/delete-confirm.module';
import { SharedDirectivesModule } from '../../../../components/shared/directives/directives.module';
import { MatCardPlaceholderModule } from '../../../../components/shared/grid-placeholder/mat-card-placeholder/placeholder.module';
import { ReferenceFormComponent } from './child/reference-form.component';
import { ReferenceComponent } from './reference.component';
import { ReferenceService } from './reference.service';

@NgModule({
    declarations: [
        ReferenceComponent,
        ReferenceFormComponent
    ],

    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatDialogModule,
        RouterModule.forChild([
            { path: '', component: ReferenceComponent }
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
        ReferenceService,
    ],
    entryComponents: [
        ReferenceFormComponent
    ]
})

export class ReferenceModule {

}
