import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ChangesConfirmModule } from '../../../../components/shared/changes-confirm/changes-confirm.module';
import { SharedDirectivesModule } from '../../../../components/shared/directives/directives.module';
import { WidgetGridPlaceholderModule } from '../../../../components/shared/grid-placeholder/widget-placeholder/widget-placeholder.module';
import { BasicComponent } from './basic.component';
import { ProfileService } from './basic.service';
import { BasicFormComponent } from './child/basic-form.component';
@NgModule({
    declarations: [
        BasicComponent,
        BasicFormComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatSelectModule,
        MatNativeDateModule,
        MatRadioModule,
        MatDialogModule,
        MatDividerModule,
        MatMenuModule,
        SharedDirectivesModule,
        RouterModule.forChild([
            { path: '', component: BasicComponent }
        ]),
        MatTooltipModule,
        ChangesConfirmModule,
        WidgetGridPlaceholderModule,
        NgxMatSelectSearchModule
    ],
    providers: [
        ProfileService,
    ],

    entryComponents: [
        BasicFormComponent,
    ]
})

export class BasicModule {

}
