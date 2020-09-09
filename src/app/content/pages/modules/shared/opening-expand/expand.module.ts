import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ExpandedComponent } from './expanded.component';

@NgModule({
    declarations: [ExpandedComponent],
    imports: [CommonModule, MatProgressBarModule, PerfectScrollbarModule],
    exports: [ExpandedComponent],
    providers: [],
})
export class ExpandedOpeningModule { }
