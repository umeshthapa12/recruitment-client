import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { CoreModule } from '../../core/core.module';
import { ScrollTopComponent } from './layout/scroll-top/scroll-top.component';
import {ListTimelineModule} from './layout/quick-sidebar/list-timeline/list-timeline.module';


@NgModule({
	declarations: [
		ScrollTopComponent,
	],
	exports: [
		ScrollTopComponent,
	],
	imports: [
		CommonModule,
		RouterModule,
		NgbModule,
		PerfectScrollbarModule,
		CoreModule,
		MatSortModule,
		MatProgressSpinnerModule,
		MatTableModule,
		MatPaginatorModule,
		MatSelectModule,
		MatProgressBarModule,
		MatButtonModule,
		MatCheckboxModule,
		MatIconModule,
		MatTooltipModule,
		ListTimelineModule
	]
})
export class PartialsModule {}
