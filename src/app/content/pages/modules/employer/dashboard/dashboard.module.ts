import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { CoreModule } from '../../../../../core/core.module';
import { LayoutModule } from '../../../../layout/layout.module';
import { PartialsModule } from '../../../../partials/partials.module';
import { ContentPlaceholderModule } from '../../../components/shared/content-placeholder/placeholder.module';
import { GridViewComponent } from './child/grid-view.component';
import { HiringStatsComponent } from './child/hiring-stats.component';
import { ListMiniComponent } from './child/list-mini.component';
import { ListViewComponent } from './child/list-view.component';
import { ProfileCompleteBannerComponent } from './child/profile-complete-banner.component';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from './services/dashboard.service';

@NgModule({
	imports: [
		CommonModule,
		LayoutModule,
		CoreModule,
		PartialsModule,
		RouterModule.forChild([
			{
				path: '',
				component: DashboardComponent
			},
		]),
		MatTooltipModule,
		MatProgressBarModule,
		MatSlideToggleModule,
		MatExpansionModule,
		MatTooltipModule,
		ContentPlaceholderModule
	],
	providers: [DashboardService],
	declarations: [DashboardComponent, ListViewComponent, GridViewComponent, ProfileCompleteBannerComponent, ListMiniComponent, HiringStatsComponent]
})
export class DashboardModule { }
