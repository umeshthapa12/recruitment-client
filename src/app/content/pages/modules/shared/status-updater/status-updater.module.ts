import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { StatusUpdaterComponent } from './status-updater.component';

@NgModule({
    declarations: [StatusUpdaterComponent],
    imports: [CommonModule, MatProgressSpinnerModule, MatSelectModule],
    exports: [StatusUpdaterComponent]
})
export class StatusUpdaterModule { }
