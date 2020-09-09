import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HeaderDropdownFilterComponent } from './dropdown-filter.component';
import { FilterService } from './filters.service';

@NgModule({
    declarations: [HeaderDropdownFilterComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatMenuModule,
        MatSelectModule,
        MatInputModule,
        MatFormFieldModule,
        MatSortModule,
        MatTooltipModule,
        MatRadioModule
    ],
    exports: [HeaderDropdownFilterComponent],
    providers: [FilterService]
})
export class FiltersModule { }
