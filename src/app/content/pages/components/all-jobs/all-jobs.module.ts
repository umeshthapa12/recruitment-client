import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatPaginatorModule } from '@angular/material/paginator';
import { RouterModule } from '@angular/router';
import { AdvanceSearchModule } from '../shared/advance-search/advance-search.module';
import { ContentPlaceholderModule } from '../shared/content-placeholder/placeholder.module';
import { SharedDirectivesModule } from '../shared/directives/directives.module';
import { JobListModule } from '../shared/job-listing/list.module';
import { AllJobsComponent } from './all-jobs.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([
            {
                path: '',
                component: AllJobsComponent
            }
        ]),
        MatExpansionModule,
        FormsModule,
        ReactiveFormsModule,
        ContentPlaceholderModule,
        JobListModule,
        AdvanceSearchModule,
        MatPaginatorModule,
        SharedDirectivesModule
    ],
    providers: [],
    declarations: [AllJobsComponent]
})
export class AllJobsModule { }
