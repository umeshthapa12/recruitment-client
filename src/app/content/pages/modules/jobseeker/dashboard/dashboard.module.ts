import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { LayoutModule } from '../../../../layout/layout.module';
import { PartialsModule } from '../../../../partials/partials.module';
import { DeleteConfirmModule } from '../../../components/shared/delete-confirm/delete-confirm.module';
import { SharedJobService } from '../../shared/shared-jobs.service';
import { VsJobListComponent } from './child/vs-job-list.component';
import { DashboardComponent } from './dashboard.component';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		LayoutModule,
		PartialsModule,
		RouterModule.forChild([
			{
				path: '',
				component: DashboardComponent
			},

		]),
		MatTooltipModule,
		MatProgressBarModule,
		MatBottomSheetModule,
		ScrollingModule,
		MatMenuModule,
		MatFormFieldModule,
		MatProgressSpinnerModule,
		MatSnackBarModule,
		DeleteConfirmModule
	],
	declarations: [DashboardComponent, VsJobListComponent],
	entryComponents: [VsJobListComponent],
	providers: [SharedJobService]
})
export class DashboardModule { }
