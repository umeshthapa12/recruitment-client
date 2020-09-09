import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TermsConditionsComponent } from './terms-conditions.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [TermsConditionsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: TermsConditionsComponent
      }
    ]),
  ]
})
export class TermsConditionsModule { }
