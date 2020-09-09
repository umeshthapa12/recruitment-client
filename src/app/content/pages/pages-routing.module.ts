import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Resolve, Router, RouterModule, RouterStateSnapshot, Routes, CanActivateChild } from '@angular/router';
import { Store } from '@ngxs/store';
import { StateReset } from 'ngxs-reset-plugin';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserType } from '../../models';
import { AuthService } from '../../services/auth.service';
import { ActivateOverlayAction, DeactivateOverlayAction, PageOverlayState } from '../../store/app-store';
import { PagesComponent } from './pages.component';
import { ErrorPageComponent } from './snippets/error-page/error-page.component';
import { InitCoverConfigAction } from './store/page-store/cover.store';

/** ------------------------------------------------------------------------

 Flagged path for homepage cover.

 App configuration is too ugly as the theme author forces us to follow their crappy structure thus this implementation is a temporary until the next version.

 --------------------------------------------------------------------------*/
const flaggedPathForCover = [
	'services',
	'pricing',
	'contact',
	'about-us',
	'disclaimer',
	'privacy-policy',
	'terms-conditions',
	'faq',
	'job-category/:categoryId/:categoryTitle',
	'all-jobs/:openingService',
	'company/:id/:companyName',
	'jobseeker',
	'my',
];

@Injectable()
export class CoverPageResolver implements Resolve<any> {

	constructor(private store: Store, private router: Router) { }

	resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

		// we have some flag to change homepage cover states.
		const hasFlag = flaggedPathForCover.indexOf(route.routeConfig.path) > -1;
		if (hasFlag) {
			this.store.dispatch(new InitCoverConfigAction({ showCover: null, showRightAside: true }));
		} else {
			const isMain =
				route.routeConfig.path === '' ||
				route.routeConfig.path === 'all-jobs';

			this.store.dispatch(new InitCoverConfigAction({ showCover: { main: isMain }, showRightAside: true }));
		}
	}
}

@Injectable({ providedIn: 'root' })
export class LeftAsideResolver implements Resolve<any> {

	constructor(private store: Store) { }

	resolve(route: ActivatedRouteSnapshot, rss: RouterStateSnapshot) {
		const url = rss.url;
		this.store.dispatch(new InitCoverConfigAction({
			showCover: null,
			// show the left aside when either of conditions are true.
			showLeftAside: (url.search('my/') > -1 || url.search('employer/j') > -1),
			// toggle right aside by applied condition
			showRightAside: url.search('employer/j') < 0
		}));

	}
}

@Injectable({ providedIn: 'root' })
export class RegisterPageResolver implements Resolve<any> {

	constructor(private store: Store) { }

	resolve(route: ActivatedRouteSnapshot, rss: RouterStateSnapshot) {
		const url = rss.url;
		this.store.dispatch(new InitCoverConfigAction({
			showCover: null,
			// show the left aside when either of conditions are true.
			showLeftAside: false,
			// toggle right aside by applied condition
			showRightAside: true
		}));

	}
}

@Injectable({ providedIn: 'root' })
export class CanActivateGuard implements CanActivateChild {

	constructor(
		private auth: AuthService,
		private router: Router,
		private store: Store) {
		// cleanup the existing running overlay loader
		this.store.dispatch(new StateReset(PageOverlayState));

	}
	canActivateChild(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): Observable<boolean> | Promise<boolean> | boolean {

		// whether the requested url contains employer or the job seeker
		const isEmployer = state.url.search('/employer') > -1;

		/** public url which is not necessary to protect.
		 * search for the pattern match from the url using regex.
		 */
		const publicEl = state.url.match(/\b(?:login|register|verify|password-recover)\b/gi);
		if (publicEl?.length > 0) return of(true);

		/**
		 * If we come this far, a server validation is required.
		 */
		return this.auth.isActiveAccount(isEmployer ? UserType.Employer : UserType.JobSeeker)
			.pipe(
				catchError(e => of(e)),
				map(res => {

					const basePath = isEmployer ? '/employer' : '/jobseeker';
					const isSuccess = !(res instanceof HttpErrorResponse) && res;
					if (!isSuccess) this.router.navigateByUrl(`${basePath}/login`);
					return isSuccess;
				}),
			);
	}
}


const routes: Routes = [
	{
		path: '',
		component: PagesComponent,
		children: [
			{
				path: '',
				loadChildren: () => import('./components/home-page/homepage.module').then(m => m.HomePageModule),
				resolve: [CoverPageResolver],

			},
			{
				path: 'all-jobs',
				loadChildren: () => import('./components/all-jobs/all-jobs.module').then(m => m.AllJobsModule),
				resolve: [CoverPageResolver]
			},
			{
				path: 'all-jobs/:openingService',
				loadChildren: () => import('./components/all-jobs/all-jobs.module').then(m => m.AllJobsModule),
				resolve: [CoverPageResolver]
			},
			{
				path: 'contract',
				loadChildren: () => import('./components/contract/contract-jobs.module').then(m => m.ContractJobsModule),
				resolve: [CoverPageResolver]
			},
			{
				path: 'full-time',
				loadChildren: () => import('./components/full-time/full-time-jobs.module').then(m => m.FullTimeJobsModule),
				resolve: [CoverPageResolver]
			},
			{
				path: 'part-time',
				loadChildren: () => import('./components/part-time/part-time-jobs.module').then(m => m.PartTimeJobsModule),
				resolve: [CoverPageResolver]
			},
			{
				path: 'internship',
				loadChildren: () => import('./components/internship/internship.module').then(m => m.InternshipModule),
				resolve: [CoverPageResolver]
			},
			{
				path: 'remote',
				loadChildren: () => import('./components/remote/remote-jobs.module').then(m => m.RemoteJobsModule),
				resolve: [CoverPageResolver]
			},
			{
				// Dynamic router links after /job/**, handled on child route module
				// if we have no matched routes on child, we may get redirected to not found page
				path: 'job/:jobId/:jobTitle',
				loadChildren: () => import('./components/job-single/job-single.module').then(m => m.SingleJobModule),
				resolve: [CoverPageResolver]
			},
			{
				path: 'services',
				loadChildren: () => import('./components/our-services/services.module').then(m => m.ServicesModule),
				resolve: [CoverPageResolver]
			},
			{
				path: 'pricing',
				loadChildren: () => import('./components/pricing/pricing.module').then(m => m.PricingModule),
				resolve: [CoverPageResolver]
			},
			{
				path: 'contact',
				loadChildren: () => import('./components/contact-us/contact-us.module').then(m => m.ContactUsModule),
				resolve: [CoverPageResolver],
			},
			{
				path: 'faq',
				loadChildren: () => import('./components/faq/faq.module').then(m => m.FaqModule),
				resolve: [CoverPageResolver]

			},
			{
				path: 'job-category/:categoryId/:categoryTitle',
				loadChildren: () => import('./components/jobs-by-category/jobs-by-category.module').then(m => m.JobsByCategoryModule),
				resolve: [CoverPageResolver]
			},
			{
				path: 'privacy-policy',
				loadChildren: () => import('./components/privacy-policy/privacy-policy.module').then(m => m.PrivacyPolicyModule),
				resolve: [CoverPageResolver]
			},
			{
				path: 'terms-conditions',
				loadChildren: () => import('./components/terms-conditions/terms-conditions.module').then(m => m.TermsConditionsModule),
				resolve: [CoverPageResolver]
			},
			{
				path: 'disclaimer',
				loadChildren: () => import('./components/disclaimer/disclaimer.module').then(m => m.DisclaimerModule),
				resolve: [CoverPageResolver]
			},
			{
				path: 'about-us',
				loadChildren: () => import('./components/about-us/about-us.module').then(m => m.AboutUsModule),
				resolve: [CoverPageResolver]
			},
			{
				path: 'company/:id/:companyName',
				loadChildren: () => import('./components/single-company-jobs/single-company-jobs.module').then(_ => _.SingleCompanyJobsModule),
				resolve: [CoverPageResolver]
			},
		]
	},
	{
		path: 'jobseeker', resolve: [CoverPageResolver],
		component: PagesComponent,
		canActivateChild: [CanActivateGuard],
		children: [
			{
				path: 'dashboard',
				loadChildren: () => import('./modules/jobseeker/dashboard/dashboard.module').then(_ => _.DashboardModule),
				resolve: [LeftAsideResolver],
				// canActivate: [CanActivateGuard]
			},
			{
				path: 'my/profile',
				loadChildren: () => import('./modules/jobseeker/profile/basic-information/basic.module').then(m => m.BasicModule),
				resolve: [LeftAsideResolver]
			},
			{
				path: 'my/job-preference',
				loadChildren: () => import('./modules/jobseeker/profile/job-preference/preference.module').then(m => m.PreferenceModule),
				resolve: [LeftAsideResolver]
			},
			{
				path: 'my/qualification',
				loadChildren: () => import('./modules/jobseeker/profile/qualification/qualification.module').then(m => m.QualificationModule),
				resolve: [LeftAsideResolver]
			},
			{
				path: 'my/training',
				loadChildren: () => import('./modules/jobseeker/profile/training/training.module').then(m => m.TrainingModule),
				resolve: [LeftAsideResolver]
			},
			{
				path: 'my/work',
				loadChildren: () => import('./modules/jobseeker/profile/work-experience/work.module').then(m => m.WorkModule),
				resolve: [LeftAsideResolver]
			},
			{
				path: 'my/language',
				loadChildren: () => import('./modules/jobseeker/profile/language/language.module').then(m => m.LanguageModule),
				resolve: [LeftAsideResolver]
			},
			{
				path: 'my/documents',
				loadChildren: () => import('./modules/jobseeker/profile/documents/document.module').then(m => m.DocumentModule),
				resolve: [LeftAsideResolver]
			},
			{
				path: 'my/social-account',
				loadChildren: () => import('./modules/jobseeker/profile/social-account/account.module').then(m => m.AccountModule),
				resolve: [LeftAsideResolver]
			},
			{
				path: 'my/reference',
				loadChildren: () => import('./modules/jobseeker/profile/reference/reference.module').then(m => m.ReferenceModule),
				resolve: [LeftAsideResolver]
			},
			{
				path: 'my/change-password',
				loadChildren: () => import('./modules/jobseeker/profile/change-password/change.module').then(m => m.ChangeModule),
				resolve: [LeftAsideResolver]
			},
			{
				path: 'my/other-info',
				loadChildren: () => import('./modules/jobseeker/profile/other-information/other.module').then(m => m.OtherModule),
				resolve: [LeftAsideResolver]
			},

			// account
			{
				path: 'login',
				loadChildren: () => import('./modules/jobseeker/account/login/login-form.module').then(m => m.LoginFormModule),
				resolve: [RegisterPageResolver]
			},
			{
				path: 'register',
				loadChildren: () => import('./modules/jobseeker/account/Register/form/regForm.module').then(m => m.RegFormModule),
				resolve: [RegisterPageResolver]
			},
			{
				path: 'password-recover',
				loadChildren: () => import('./modules/jobseeker/account/login/reset-password/password-recover.module').then(m => m.PasswordRecoverModule),
				resolve: [RegisterPageResolver]
			},
			{
				path: 'verify',
				loadChildren: () => import('./modules/jobseeker/account/verify/verify.module').then(m => m.AccountVerifyModule),
				resolve: [RegisterPageResolver]
			},
		]
	},
	{
		path: 'employer', component: PagesComponent,
		canActivateChild: [CanActivateGuard],
		children: [
			{
				path: 'dashboard',
				loadChildren: () => import('./modules/employer/dashboard/dashboard.module').then(_ => _.DashboardModule),
				resolve: [LeftAsideResolver]
			},
			{
				path: 'my/profile',
				loadChildren: () => import('./modules/employer/profile/basic-info/basic-info.module').then(m => m.BasicInfoModule),
				resolve: [LeftAsideResolver]
			},
			{
				path: 'my/services',
				loadChildren: () => import('./modules/employer/profile/service/service.module').then(m => m.ServiceModule),
				resolve: [LeftAsideResolver]
			},
			{
				path: 'my/social-account',
				loadChildren: () => import('./modules/employer/profile/social-account/social-account.module').then(m => m.SocialAccountModule),
				resolve: [LeftAsideResolver]
			},
			{
				path: 'my/change-password',
				loadChildren: () => import('./modules/employer/profile/change-password/change-password.module').then(m => m.ChangePasswordModule),
				resolve: [LeftAsideResolver]
			},
			/* job section */
			{
				path: 'j/all',
				loadChildren: () => import('./modules/employer/jobs/jobs/jobs.module').then(m => m.JobsModule),
				resolve: [LeftAsideResolver]
			},
			{
				path: 'j/scheduled',
				loadChildren: () => import('./modules/employer/jobs/scheduled-jobs/scheduled-jobs.module').then(m => m.ScheduledJobsModule),
				resolve: [LeftAsideResolver]
			},
			{
				path: 'j/drafts',
				loadChildren: () => import('./modules/employer/jobs/drafts/drafts.module').then(m => m.DraftsModule),
			},
			{
				path: 'j/archived',
				loadChildren: () => import('./modules/employer/jobs/archived/archived.module').then(m => m.ArchivedModule),
				resolve: [LeftAsideResolver]
			},
			{
				path: 'j/applications',
				loadChildren: () => import('./modules/employer/jobs/application/application.module').then(m => m.ApplicationModule),
				resolve: [LeftAsideResolver]
			},
			{
				path: 'j/online-screening',
				loadChildren: () => import('./modules/employer/jobs/hiring-process/online-screening/online-screening.module').then(m => m.OnlineScreeningModule),
				resolve: [LeftAsideResolver]
			},
			{
				path: 'j/messages-email',
				loadChildren: () => import('./modules/employer/jobs/candidate-message/candidate-message.module').then(m => m.CandidateMessageModule),
				resolve: [LeftAsideResolver]
			},
			{
				path: 'j/messages-sms',
				loadChildren: () => import('./modules/employer/jobs/candidate-message/candidate-sms.modules').then(m => m.CandidateSmsModule),
				resolve: [LeftAsideResolver]
			},
			{
				path: 'j/appointment',
				loadChildren: () => import('./modules/employer/jobs/hiring-process/appointment/appointment.module').then(m => m.AppointmentModule),
				resolve: [LeftAsideResolver]
			},
			{
				path: 'j/stages',
				loadChildren: () => import('./modules/employer/jobs/hiring-process/stages/stages.module').then(m => m.StagesModule),
				resolve: [LeftAsideResolver]
			},
			{
				path: 'j/interviews',
				loadChildren: () => import('./modules/employer/jobs/hiring-process/interview-question/interview-question.module').then(m => m.InterViewQuestionModule),
				resolve: [LeftAsideResolver]
			},
			{
				path: 'j/interview-questions-setup',
				loadChildren: () => import('./modules/employer/jobs/settings/interview-questions/interview-question-setup.module').then(m => m.InterviewQuestionSetupModule),
				resolve: [LeftAsideResolver]
			},
			{
				path: 'j/online-questionnaire-setup',
				loadChildren: () => import('./modules/employer/jobs/settings/online-questionnaire/online-questionnaire.module').then(m => m.OnlineQuestionnaireModule),
				resolve: [LeftAsideResolver]
			},
			{
				path: 'j/mail-server-setup',
				loadChildren: () => import('./modules/employer/jobs/settings/mail-server/mail-server.module').then(m => m.MailServerSetupModule),
				resolve: [LeftAsideResolver]
			},

			// accounts
			{
				path: 'login',
				loadChildren: () => import('./modules/employer/account/login/login-form/login.module').then(m => m.LoginModule),
				resolve: [RegisterPageResolver]
			},
			{
				path: 'password-recover',
				loadChildren: () => import('./modules/employer/account/login/login-form/child/password-recover.module').then(m => m.PasswordRecoverModule),
				resolve: [RegisterPageResolver]
			},
			{
				path: 'register',
				loadChildren: () => import('./modules/employer/account/Register/register-form/company-register.module').then(m => m.CompanyRegisterModule),
				resolve: [RegisterPageResolver]
			},
			{
				path: 'verify',
				loadChildren: () => import('./modules/employer/account/Register/verify/verify.module').then(m => m.AccountVerifyModule),
				resolve: [RegisterPageResolver]
			}
		]

	},
	{
		path: '404',
		component: ErrorPageComponent
	},
	{
		path: 'error/:type',
		component: ErrorPageComponent
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
	providers: [CoverPageResolver]
})
export class PagesRoutingModule { }
