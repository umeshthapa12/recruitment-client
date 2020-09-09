import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientModule, HttpClientXsrfModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsModule } from '@ngxs/store';
import { PerfectScrollbarConfigInterface, PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { NgxsResetPluginModule } from 'ngxs-reset-plugin';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutModule } from './content/layout/layout.module';
import { PageOverlayModule } from './content/pages/components/shared/page-overlay/page-overlay.module';
import { DropdownProviderService } from './content/pages/components/shared/services/dropdown-provider.service';
import { SnackToastService } from './content/pages/components/shared/snakbar-toast/toast.service';
import { JobListingState } from './content/pages/store/page-store/page-state';
import { PartialsModule } from './content/partials/partials.module';
import { CoreModule } from './core/core.module';
import { ClassInitService } from './core/services/class-init.service';
import { LayoutConfigStorageService } from './core/services/layout-config-storage.service';
import { LayoutConfigService } from './core/services/layout-config.service';
import { HeaderService } from './core/services/layout/header.service';
import { LayoutRefService } from './core/services/layout/layout-ref.service';
import { MenuAsideService } from './core/services/layout/menu-aside.service';
import { MenuHorizontalService } from './core/services/layout/menu-horizontal.service';
import { MenuConfigService } from './core/services/menu-config.service';
import { PageConfigService } from './core/services/page-config.service';
import { SplashScreenService } from './core/services/splash-screen.service';
import { UtilsService } from './core/services/utils.service';
import { AuthService } from './services/auth.service';
import { CookieService } from './services/cookie.service';
import { AppState, PageCoverNavState, PageOverlayState } from './store/app-store';
import { BaseUrlCreator, ExtendedMatDialog, ParamGenService, RandomUnique, WithCredentialsInterceptor } from './utils';
import { CustomUtil } from './utils/generators/custom-utility';
import { FilterConditionState } from './store/filter-data.store';
import { DropdownDataState } from './store/dropdown-data.store';
import { OpeningState, SignalrHubState } from './content/pages/modules/employer/jobs/jobs/store/opening.store';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
	// suppressScrollX: true
};
@NgModule({
	declarations: [AppComponent],
	imports: [
		BrowserAnimationsModule,
		BrowserModule,
		AppRoutingModule,
		HttpClientModule,
		HttpClientXsrfModule,
		LayoutModule,
		PartialsModule,
		CoreModule,
		OverlayModule,
		NgbModule,
		MatProgressSpinnerModule,
		NgxsModule.forRoot([
			AppState,
			PageOverlayState,
			JobListingState,
			PageCoverNavState,
			FilterConditionState,
			DropdownDataState,
			OpeningState,
			SignalrHubState,
		],
			{ developmentMode: !environment.production }),
		NgxsReduxDevtoolsPluginModule.forRoot({
			name: 'homepage',
			disabled: environment.production,
		}),
		NgxsResetPluginModule.forRoot(),
		PageOverlayModule,

	],
	providers: [
		LayoutConfigService,
		LayoutConfigStorageService,
		LayoutRefService,
		MenuConfigService,
		PageConfigService,
		UtilsService,
		ClassInitService,
		SplashScreenService,
		{
			provide: PERFECT_SCROLLBAR_CONFIG,
			useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
		},

		// template services
		HeaderService,
		MenuHorizontalService,
		MenuAsideService,
		{
			provide: HTTP_INTERCEPTORS,
			useClass: WithCredentialsInterceptor,
			multi: true
		},
		ParamGenService,
		BaseUrlCreator,
		DropdownProviderService,
		AuthService,
		CookieService,
		CustomUtil,
		RandomUnique,
		SnackToastService,
		ExtendedMatDialog
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
