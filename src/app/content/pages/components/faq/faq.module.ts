import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterModule } from '@angular/router';

import { FaqComponent } from './faq.component';

@NgModule({
    declarations: [FaqComponent],
    imports: [CommonModule, MatExpansionModule,
        RouterModule.forChild([
            { path: '', component: FaqComponent }
        ])],
    exports: [],
    providers: [],
})
export class FaqModule { }
