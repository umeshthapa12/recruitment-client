import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { ChangesConfirmModule } from '../../../../components/shared/changes-confirm/changes-confirm.module';
import { DeleteConfirmModule } from '../../../../components/shared/delete-confirm/delete-confirm.module';
import { SharedDirectivesModule } from '../../../../components/shared/directives/directives.module';
import { MatCardPlaceholderModule } from '../../../../components/shared/grid-placeholder/mat-card-placeholder/placeholder.module';
import { DocFormComponent } from './doc-form.component';
import { DocumentComponent } from './document.component';
import { DocumentService } from './document.service';

@NgModule({
    declarations: [
        DocumentComponent,
        DocFormComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatDialogModule,
        MatDividerModule,
        MatTooltipModule,
        MatIconModule,
        MatCardModule,
        RouterModule.forChild([
            { path: '', component: DocumentComponent }
        ]),
        ChangesConfirmModule,
        DeleteConfirmModule,
        SharedDirectivesModule,
        MatCardPlaceholderModule

    ],
    providers: [DocumentService, ],
    entryComponents: [DocFormComponent]
})

export class DocumentModule {

}
