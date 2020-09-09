import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { ToastSnackbarModule } from '../../../../../components/shared/snakbar-toast/toast.module';
import { RegFormComponent, TermsAndConditionsComponent } from './regForm.component';
import { CompareValidatorsDirective } from './shared/compare-validator.directive';
import { RegFormService } from './shared/regForm.service';

@NgModule({
    declarations: [
        RegFormComponent,
        CompareValidatorsDirective,
        TermsAndConditionsComponent
    ],
    entryComponents: [TermsAndConditionsComponent],
    imports: [
        CommonModule,
        MatSelectModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatDialogModule,
        RouterModule.forChild([
            { path: '', component: RegFormComponent }
        ]),
        ToastSnackbarModule
    ],

    providers: [RegFormService],
})

export class RegFormModule {

}
