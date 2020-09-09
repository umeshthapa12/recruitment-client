import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { LoginService } from '../login.service';
import { ComparePasswordDirective } from './compare-validator.directive';
import { ResetFormComponent } from './forgot-password-form.component';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

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
        MatFormFieldModule,
        MatInputModule,
        HttpClientModule,
        RouterModule.forChild([
            { path: '', component: ResetFormComponent }
        ]),
    ],

    providers: [LoginService]
})

export class PasswordRecoverModule { }
