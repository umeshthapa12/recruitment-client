import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { CompanyRegisterComponent, TermsAndConditionsComponent } from './company-register.component';
import { CompanyRegisterService } from './company-register.service';
import { CompareValidatorsDirective } from './compare-validator.directive';
import { MatInputModule } from '@angular/material/input';
import { ToastSnackbarModule } from '../../../../../components/shared/snakbar-toast/toast.module';

@NgModule({
  declarations: [
    CompanyRegisterComponent,
    TermsAndConditionsComponent,
    CompareValidatorsDirective
  ],
  entryComponents: [TermsAndConditionsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: CompanyRegisterComponent },
    ]),
    FormsModule, ReactiveFormsModule, MatSelectModule, MatDialogModule,
    HttpClientModule,
    ToastSnackbarModule, MatFormFieldModule, MatInputModule
  ],
  providers: [CompanyRegisterService],
})
export class CompanyRegisterModule { }
