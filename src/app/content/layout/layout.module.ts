import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PerfectScrollbarConfigInterface, PerfectScrollbarModule, PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { CoreModule } from '../../core/core.module';
import { ContentPlaceholderModule } from '../pages/components/shared/content-placeholder/placeholder.module';
import { SharedDirectivesModule } from '../pages/components/shared/directives/directives.module';
import { ProblemReportModule } from '../pages/components/shared/problem-reporter/problem-report.module';
import { ListTimelineModule } from '../partials/layout/quick-sidebar/list-timeline/list-timeline.module';
import { AsideLeftComponent } from './aside/aside-left.component';
import { AsideRightComponent } from './aside/aside-right/aside-right.component';
import { AvatarCardPlaceholderComponent } from './aside/aside-right/child/avatar-card-placeholder.component';
import { ClientSupportPlaceholderComponent } from './aside/aside-right/child/client-support-placeholder.component';
import { MenuSectionComponent } from './aside/menu-section/menu-section.component';
import { AsideRightCoverComponent } from './cover/aside-right-cover.component';
import { PageCoverDesktopComponent } from './cover/page-cover-desktop.component';
import { PageCoverMobileComponent } from './cover/page-cover-mobile.component';
import { SimplePageCoverComponent } from './cover/simple-page-cover.component';
import { FooterComponent } from './footer/footer.component';
import { PreFooterComponent } from './footer/pre-footer.component';
import { PreMobileFooterComponent } from './footer/pre-mobile-footer.component';
import { BrandComponent } from './header/brand/brand.component';
import { HeaderComponent } from './header/header.component';
import { MenuHorizontalComponent } from './header/menu-horizontal/menu-horizontal.component';
import { NotificationComponent } from './header/topbar/notification/notification.component';
import { TopbarComponent } from './header/topbar/topbar.component';
import { UserLoginComponent } from './header/topbar/user-login/login.component';
import { UserProfileComponent } from './header/topbar/user-profile/user-profile.component';
import { UserRegisterComponent } from './header/topbar/user-register/register.component';
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
	// suppressScrollX: true
};

@NgModule({
	declarations: [
		HeaderComponent,
		FooterComponent,
		BrandComponent,

		// topbar components
		TopbarComponent,
		UserProfileComponent,
		NotificationComponent,

		// aside left menu components
		AsideLeftComponent,
		MenuSectionComponent,

		// horizontal menu components
		MenuHorizontalComponent,

		// aside right component
		AsideRightComponent,

		PageCoverDesktopComponent,
		AsideRightCoverComponent,
		PageCoverMobileComponent,
		SimplePageCoverComponent,
		PreFooterComponent,
		PreMobileFooterComponent,
		UserLoginComponent,
		UserRegisterComponent,
		AvatarCardPlaceholderComponent,
		ClientSupportPlaceholderComponent

	],
	exports: [
		HeaderComponent,
		FooterComponent,
		BrandComponent,

		// topbar components
		TopbarComponent,
		UserProfileComponent,
		NotificationComponent,
		// aside left menu components
		AsideLeftComponent,
		// MenuSectionComponent,

		// horizontal menu components
		MenuHorizontalComponent,

		// aside right component
		AsideRightComponent,
		PageCoverDesktopComponent,
		AsideRightCoverComponent,
		PageCoverMobileComponent,
		SimplePageCoverComponent,
		PreFooterComponent,
		PreMobileFooterComponent,
		UserLoginComponent,
		UserRegisterComponent,
		AvatarCardPlaceholderComponent,
		ClientSupportPlaceholderComponent
	],
	providers: [
		{
			provide: PERFECT_SCROLLBAR_CONFIG,
			useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
		}
	],
	imports: [
		CommonModule,
		RouterModule,
		CoreModule,
		PerfectScrollbarModule,
		NgbModule,
		FormsModule,
		ReactiveFormsModule,
		MatProgressBarModule,
		MatTabsModule,
		MatButtonModule,
		MatTooltipModule,
		MatSelectModule,
		MatDividerModule,
		MatMenuModule,
		MatCardModule,
		MatFormFieldModule,
		MatInputModule,
		// TranslateModule.forChild(),
		// LoadingBarModule.forRoot(),
		ContentPlaceholderModule,
		ListTimelineModule,
		ProblemReportModule,
		SharedDirectivesModule,
	]
})
export class LayoutModule { }
