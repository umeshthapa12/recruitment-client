import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrivacyPolicyComponent } from './privacy-policy.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [PrivacyPolicyComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
          path: '',
          component: PrivacyPolicyComponent
      }
  ]),
  ]
})
export class PrivacyPolicyModule { }
