import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardPlaceholderComponent } from './placeholder.component';
import { MatCardModule } from '@angular/material/card';

@NgModule({
    declarations: [MatCardPlaceholderComponent],
    imports: [CommonModule, MatCardModule],
    exports: [MatCardPlaceholderComponent],
})
export class MatCardPlaceholderModule { }
