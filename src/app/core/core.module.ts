import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HeaderDirective } from './directives/header.directive';
import { MenuAsideOffcanvasDirective } from './directives/menu-aside-offcanvas.directive';
import { MenuAsideToggleDirective } from './directives/menu-aside-toggle.directive';
import { MenuAsideDirective } from './directives/menu-aside.directive';
import { MenuHorizontalOffcanvasDirective } from './directives/menu-horizontal-offcanvas.directive';
import { MenuHorizontalDirective } from './directives/menu-horizontal.directive';
import { PortletDirective } from './directives/portlet.directive';
import { QuickSidebarOffcanvasDirective } from './directives/quick-sidebar-offcanvas.directive';
import { ScrollTopDirective } from './directives/scroll-top.directive';
import { ConsoleLogPipe } from './pipes/console-log.pipe';
import { FirstLetterPipe } from './pipes/first-letter.pipe';
import { GetObjectPipe } from './pipes/get-object.pipe';
import { JoinPipe } from './pipes/join.pipe';
import { SafePipe } from './pipes/safe.pipe';
import { TimeElapsedPipe, RemainingDaysPipe, AmPmTimePipe } from './pipes/time-elapsed.pipe';
import { NgxsModule } from '@ngxs/store';
import { HttpParsePipe } from './pipes/http-parse.pipe';

@NgModule({
	imports: [CommonModule, NgxsModule.forFeature([])],
	declarations: [
		// directives
		MenuAsideDirective,
		MenuAsideOffcanvasDirective,
		MenuHorizontalOffcanvasDirective,
		MenuHorizontalDirective,
		ScrollTopDirective,
		HeaderDirective,
		MenuAsideToggleDirective,
		QuickSidebarOffcanvasDirective,
		PortletDirective,
		// pipes
		FirstLetterPipe,
		TimeElapsedPipe,
		JoinPipe,
		GetObjectPipe,
		ConsoleLogPipe,
		SafePipe,
		RemainingDaysPipe,
		AmPmTimePipe,
		HttpParsePipe
	],
	exports: [
		// directives
		MenuAsideDirective,
		MenuAsideOffcanvasDirective,
		MenuHorizontalOffcanvasDirective,
		MenuHorizontalDirective,
		ScrollTopDirective,
		HeaderDirective,
		MenuAsideToggleDirective,
		QuickSidebarOffcanvasDirective,
		PortletDirective,
		// pipes
		FirstLetterPipe,
		TimeElapsedPipe,
		JoinPipe,
		GetObjectPipe,
		ConsoleLogPipe,
		SafePipe,
		RemainingDaysPipe,
		AmPmTimePipe,
		HttpParsePipe
	],
	providers: []
})
export class CoreModule { }
