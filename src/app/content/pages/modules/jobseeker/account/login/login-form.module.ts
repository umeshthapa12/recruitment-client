import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RouterModule } from '@angular/router';
import { LoginFormComponent } from './login-form.component';
import { LoginService } from './shared/login.service';

@NgModule({
    declarations: [
        LoginFormComponent,
    ],

    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        MatFormFieldModule,
        RouterModule.forChild([
            { path: '', component: LoginFormComponent },

        ])
    ],

    exports: [

    ],
    providers: [LoginService]
})

export class LoginFormModule {

}
