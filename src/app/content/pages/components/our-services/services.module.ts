import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicesComponent } from './services.component';
import { RouterModule } from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@NgModule({
    declarations: [ServicesComponent],
    imports: [
        CommonModule, MatExpansionModule, MatFormFieldModule, MatInputModule,
        RouterModule.forChild([
            { path: '', component: ServicesComponent }
        ])
    ],
    exports: [],
    providers: [],
})
export class ServicesModule { }
