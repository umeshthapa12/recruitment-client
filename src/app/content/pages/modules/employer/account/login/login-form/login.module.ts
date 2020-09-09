import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './login-form.component';
import { LoginService } from './login.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule, MatSnackBarModule,MatFormFieldModule, MatInputModule,
    MatSelectModule,
    RouterModule.forChild([
      { path: '', component: LoginComponent },
    ])],
  declarations: [LoginComponent],
  providers: [LoginService],
  exports: [MatSnackBarModule]
})

export class LoginModule {

}
