import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ResetFormComponent } from './forgot-password-form.component';
import { ComparePasswordDirective } from './shared/compare-validator.directive';
import { ResetService } from './shared/reset-form.service';

@NgModule({
    declarations: [
        ResetFormComponent,
        ComparePasswordDirective
    ],

    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatIconModule,
        HttpClientModule,
        RouterModule.forChild([
            { path: '', component: ResetFormComponent }
        ]),
    ],

    providers: [
        ResetService,
    ]
})

export class PasswordRecoverModule {}
