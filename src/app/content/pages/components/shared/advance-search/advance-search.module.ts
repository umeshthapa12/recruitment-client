import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdvanceSearchComponent } from './advance-search.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChipListAutoComponent } from './children/auto-chip.component';

@NgModule({
    declarations: [AdvanceSearchComponent, ChipListAutoComponent],
    imports: [
        CommonModule,
        // FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatChipsModule,
        MatAutocompleteModule,
        MatIconModule
    ],
    exports: [AdvanceSearchComponent]
})
export class AdvanceSearchModule { }
