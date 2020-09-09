import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { CoreModule } from '../../../../../../core/core.module';
import { ChangesConfirmModule } from '../../../../components/shared/changes-confirm/changes-confirm.module';
import { SharedDirectivesModule } from '../../../../components/shared/directives/directives.module';
import { WidgetGridPlaceholderModule } from '../../../../components/shared/grid-placeholder/widget-placeholder/widget-placeholder.module';
import { BasicInfoFormComponent } from './basic-info-form.component';
import { BasicInfoComponent } from './basic-info.component';
import { BasicInfoService } from './basic-info.service';
import { ContactPersonFormComponent } from './contact-person-form.component';
import { ExtraSetupFormComponent } from './extra-setup-form.component';


@NgModule({
    imports: [
        CommonModule,
        CoreModule,
        MatFormFieldModule,
        MatCardModule,
        MatSelectModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatDividerModule,
        MatTooltipModule,
        WidgetGridPlaceholderModule,
        SharedDirectivesModule,
        RouterModule.forChild([
            { path: '', component: BasicInfoComponent }
        ]),
        ChangesConfirmModule,
        MatIconModule
    ],
    declarations: [BasicInfoComponent, BasicInfoFormComponent, ContactPersonFormComponent, ExtraSetupFormComponent],
    entryComponents: [BasicInfoFormComponent, ContactPersonFormComponent, ExtraSetupFormComponent],
    providers: [
        BasicInfoService
    ]
})

export class BasicInfoModule { }
