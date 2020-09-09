import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { CoreModule } from '../../../../../core/core.module';
import { SharedDirectivesModule } from '../directives/directives.module';
import { JobListComponent } from './list.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        CoreModule,
        MatSnackBarModule,
        SharedDirectivesModule,
        MatTooltipModule
    ],
    declarations: [JobListComponent],
    exports: [JobListComponent],
})
export class JobListModule { }
