import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatPaginatorModule } from '@angular/material/paginator';
import { RouterModule } from '@angular/router';
import { ContentPlaceholderModule } from '../shared/content-placeholder/placeholder.module';
import { JobListModule } from '../shared/job-listing/list.module';
import { PartTimeJobsComponent } from './part-time-jobs.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([
            {
                path: '',
                component: PartTimeJobsComponent
            }
        ]),
        MatExpansionModule,
        FormsModule,
        ReactiveFormsModule,
        ContentPlaceholderModule,
        JobListModule,
        MatPaginatorModule
    ],
    providers: [],
    declarations: [PartTimeJobsComponent]
})
export class PartTimeJobsModule { }
