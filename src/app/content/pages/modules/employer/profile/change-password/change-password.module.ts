import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { SharedDirectivesModule } from '../../../../components/shared/directives/directives.module';
import { ChangeComponent } from './change-password.component';
import { ChangePasswordService } from './change-password.service';
import { CompareValidatorsDirective } from './compare-validator.directive';

@NgModule({
    declarations: [
        ChangeComponent,
        CompareValidatorsDirective
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        RouterModule.forChild([
            { path: '', component: ChangeComponent }
        ]),
        SharedDirectivesModule,
        MatDividerModule
    ],

    exports: [

    ],
    providers: [
        ChangePasswordService,
    ]
})

export class ChangePasswordModule { }
