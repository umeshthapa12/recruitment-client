import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PricingComponent } from './pricing.component';
import { RouterModule } from '@angular/router';

@NgModule({
    declarations: [PricingComponent],
    imports: [
        CommonModule,
        RouterModule.forChild([
            { path: '', component: PricingComponent }
        ])
    ],
    exports: [],
    providers: [],
})
export class PricingModule { }
