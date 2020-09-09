import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxsModule } from '@ngxs/store';
import { CoreModule } from '../../core/core.module';
import { LayoutModule } from '../layout/layout.module';
import { PartialsModule } from '../partials/partials.module';
import { AllJobsModule } from './components/all-jobs/all-jobs.module';
import { ContractJobsModule } from './components/contract/contract-jobs.module';
import { FullTimeJobsModule } from './components/full-time/full-time-jobs.module';
import { HomePageModule } from './components/home-page/homepage.module';
import { InternshipModule } from './components/internship/internship.module';
import { SingleJobModule } from './components/job-single/job-single.module';
import { PartTimeJobsModule } from './components/part-time/part-time-jobs.module';
import { RemoteJobsModule } from './components/remote/remote-jobs.module';
import { LoginModule } from './components/shared/login/login.module';
import { PageOverlayModule as CustomPageOverlayModule } from './components/shared/page-overlay/page-overlay.module';
import { SharedJobService } from './components/shared/services/shared-jobs.service';
import { PagesRoutingModule } from './pages-routing.module';
import { PagesComponent } from './pages.component';
import { ErrorPageComponent } from './snippets/error-page/error-page.component';
import { CoverConfigState } from './store/page-store/cover.store';
import { JobsState, RightAsideApplyCardButtonState, RightAsideApplyCardState, RightAsideApplySimilarOpeningsState, ScrollIntoApplySectionState } from './store/page-store/page-state';

const states = [
	JobsState,
	ScrollIntoApplySectionState,
	RightAsideApplyCardState,
	RightAsideApplyCardButtonState,
	CoverConfigState,
	RightAsideApplySimilarOpeningsState

];

@NgModule({
	declarations: [
		PagesComponent,
		ErrorPageComponent,
	],
	imports: [
		CommonModule,
		FormsModule,
		LayoutModule,
		NgxsModule.forFeature(states),
		PagesRoutingModule,
		CoreModule,
		PartialsModule,
		HomePageModule,
		AllJobsModule,
		ContractJobsModule,
		FullTimeJobsModule,
		PartTimeJobsModule,
		InternshipModule,
		RemoteJobsModule,
		SingleJobModule,
		CustomPageOverlayModule,
		LoginModule
	],
	providers: [SharedJobService]
})
export class PagesModule {
}
