import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentListPlaceholderComponent } from './placeholder.component';

@NgModule({
    declarations: [ContentListPlaceholderComponent],
    imports: [CommonModule],
    exports: [ContentListPlaceholderComponent]
})
export class ContentPlaceholderModule { }
