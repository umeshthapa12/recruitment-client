import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { ChangesConfirmModule } from '../../../../components/shared/changes-confirm/changes-confirm.module';
import { DeleteConfirmModule } from '../../../../components/shared/delete-confirm/delete-confirm.module';
import { SharedDirectivesModule } from '../../../../components/shared/directives/directives.module';
import { LangGridPlaceholderComponent } from './child/l-placeholder.component';
import { LanguageFormComponent } from './child/language-form.component';
import { LangStarsComponent } from './child/star.component';
import { LanguageComponent } from './language.component';
import { LanguageService } from './language.service';


@NgModule({
    declarations: [
        LanguageComponent,
        LanguageFormComponent,
        LangStarsComponent,
        LangGridPlaceholderComponent
    ],
    imports: [

        CommonModule,
        RouterModule.forChild([
            { path: '', component: LanguageComponent }
        ]),
        FormsModule,
        ReactiveFormsModule,
        SharedDirectivesModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatDialogModule,
        MatSelectModule,
        MatCheckboxModule,
        MatTooltipModule,
        MatSnackBarModule,
        MatDividerModule,
        MatMenuModule,
        DeleteConfirmModule,
        ChangesConfirmModule
    ],
    exports: [

    ],
    providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: [] },
        LanguageService,
    ],

    entryComponents: [
        LanguageFormComponent,
    ]
})

export class LanguageModule {

}
