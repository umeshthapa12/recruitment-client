import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { CoreModule } from '../../../../core/core.module';
import { ContentPlaceholderModule } from '../shared/content-placeholder/placeholder.module';
import { SharedDirectivesModule } from '../shared/directives/directives.module';
import { JobListModule } from '../shared/job-listing/list.module';
import { SingleCompanyJobsComponent } from './single-company-jobs.component';

@NgModule({
    declarations: [SingleCompanyJobsComponent],
    imports: [
        CommonModule,
        SharedDirectivesModule,
        RouterModule.forChild([
            { path: '', component: SingleCompanyJobsComponent }
        ]),
        JobListModule,
        ContentPlaceholderModule,
        MatTooltipModule,
        CoreModule
    ],
    exports: [],
    providers: [],
})
export class SingleCompanyJobsModule { }
