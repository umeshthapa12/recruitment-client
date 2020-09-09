import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';
import { LayoutModule } from '../../../layout/layout.module';
import { PartialsModule } from '../../../partials/partials.module';
import { ContentPlaceholderModule } from '../shared/content-placeholder/placeholder.module';
import { GridInnerListComponent } from './child/grid-inner-list-child.component';
import { NewsPapersComponent } from './child/newspaper.component';
import { GroupedJobsComponent } from './child/grouped-jobs.component';
import { DashboardComponent } from './homepage.component';
import { SharedDirectivesModule } from '../shared/directives/directives.module';

@NgModule({
	imports: [
		CommonModule,
		LayoutModule,
		PartialsModule,
		ReactiveFormsModule,
		FormsModule,
		RouterModule.forChild([
			{
				path: '',
				component: DashboardComponent
			}
		]),
		MatExpansionModule,
		MatProgressBarModule,
		ContentPlaceholderModule,
		SharedDirectivesModule,
	],
	providers: [],
	declarations: [
		DashboardComponent,
		GroupedJobsComponent,
		NewsPapersComponent,
		GridInnerListComponent
	]
})
export class HomePageModule { }
