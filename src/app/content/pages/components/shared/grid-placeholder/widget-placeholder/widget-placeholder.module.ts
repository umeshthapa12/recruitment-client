import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { WidgetGridPlaceholderComponent } from './widget-placeholder.component';

@NgModule({
    declarations: [WidgetGridPlaceholderComponent],
    imports: [CommonModule, MatCardModule],
    exports: [WidgetGridPlaceholderComponent],
})
export class WidgetGridPlaceholderModule { }
