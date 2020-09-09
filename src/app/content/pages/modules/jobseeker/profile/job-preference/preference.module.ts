import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { ChangesConfirmModule } from '../../../../components/shared/changes-confirm/changes-confirm.module';
import { SharedDirectivesModule } from '../../../../components/shared/directives/directives.module';
import { WidgetGridPlaceholderModule } from '../../../../components/shared/grid-placeholder/widget-placeholder/widget-placeholder.module';
import { AutoChipComponent } from './child/auto-chicp.component';
import { PreferenceFormComponent } from './child/preference-form.component';
import { PreferenceComponent } from './preference.component';
import { PreferenceService } from './preference.service';

@NgModule({
    declarations: [
        PreferenceComponent,
        PreferenceFormComponent,
        AutoChipComponent
    ],

    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatChipsModule,
        MatIconModule,
        MatCardModule,
        MatSelectModule,
        MatInputModule,
        MatCheckboxModule,
        MatRadioModule,
        MatDialogModule,
        MatAutocompleteModule,
        RouterModule.forChild([
            { path: '', component: PreferenceComponent }
        ]),
        MatTooltipModule,
        ChangesConfirmModule,
        MatDividerModule,
        SharedDirectivesModule,
        WidgetGridPlaceholderModule
    ],

    exports: [
        PreferenceComponent
    ],

    providers: [
        PreferenceService,
    ],

    entryComponents: [
        PreferenceFormComponent
    ]
})

export class PreferenceModule {

}

