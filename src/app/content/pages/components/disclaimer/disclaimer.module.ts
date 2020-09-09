import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DisclaimerComponent } from './disclaimer.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [DisclaimerComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: DisclaimerComponent
      }
    ]),
  ]
})
export class DisclaimerModule { }
