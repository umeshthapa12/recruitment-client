// tslint:disable-next-line:no-shadowed-variable
import { ConfigModel } from '../core/interfaces/config';

export class MenuConfig implements ConfigModel {
	public config: any = {
		header: {
			items: []
		}
	};

	constructor() {

		this.config = {
			// header: {
			// 	self: {},
			// 	items: [
			// 		{
			// 			title: 'Home',
			// 			root: true,
			// 			page: '/',
			// 		},
			// 		{
			// 			title: 'Contact',
			// 			root: true,
			// 			page: '/contact',
			// 		},
			// 		{
			// 			title: 'FAQ',
			// 			root: true,
			// 			page: '/faq',
			// 		},
			// 	]
			// },
			aside: {
				self: {},
				items: [
					/* dynamically changed based on url: e.g. [jobseeker | employer | ...] */
				],

			}
		};
	}
}

/**
 * Job seeker SPA nav collections (profile menu)
 */
export const JOBSEEKER_ASIDE_PROFILE_NAV = [
	{
		section: 'Profile Navigation'
	},
	{
		title: 'Profile',
		root: true,
		icon: '	flaticon-profile-1',
		page: '/jobseeker/my/profile'
	},
	{
		title: 'Job Preference',
		desc: '',
		icon: 'flaticon-suitcase',
		root: true,
		page: '/jobseeker/my/job-preference'
	},
	{
		title: 'Qualification',
		root: true,
		icon: 'fa fa-graduation-cap',
		page: '/jobseeker/my/qualification'
	},
	{
		title: 'Training',
		root: true,
		icon: 'flaticon-list-1',
		page: '/jobseeker/my/training'
	},
	{
		title: 'Work Experience',
		root: true,
		icon: 'flaticon-computer',
		page: '/jobseeker/my/work'
	},
	{
		title: 'Language',
		root: true,
		icon: 'flaticon-globe',
		page: '/jobseeker/my/language'
	},
	{
		title: 'Documents',
		root: true,
		icon: 'flaticon-file-1',
		page: '/jobseeker/my/documents'
	},
	{
		title: 'Social Account',
		root: true,
		icon: 'flaticon-share',
		page: '/jobseeker/my/social-account'
	},
	{
		title: 'Reference',
		root: true,
		icon: 'flaticon-users',
		page: '/jobseeker/my/reference'
	},
	{
		title: 'Change Password',
		root: true,
		icon: 'flaticon-lock',
		page: '/jobseeker/my/change-password'
	},
	{
		section: 'More Setup'
	},
	{
		title: 'Other Information',
		root: true,
		icon: 'flaticon-info',
		page: '/jobseeker/my/other-info'
	},
];

export const EMPLOYER_ASIDE_PROFILE_NAV = [
	{
		section: 'Profile Navigation'
	},
	{
		title: 'Profile',
		desc: '',
		icon: 'flaticon-layers',
		page: '/employer/my/profile',
		bullet: 'dot',
		root: true,
	},
	{
		title: 'Services',
		root: true,
		icon: 'flaticon-list-1',
		page: '/employer/my/services'
	},
	{
		title: 'Social Account',
		root: true,
		icon: 'flaticon-share',
		page: '/employer/my/social-account'
	},
	{
		title: 'Change Password',
		root: true,
		icon: 'flaticon-lock',
		page: '/employer/my/change-password'
	},
];

export const EMPLOYER_ASIDE_JOBPOST_NAV = [
	{ section: 'Jobs' },
	{
		title: 'Main',
		icon: 'flaticon-add',
		page: '/employer/j/all',
	},
	{
		title: 'Scheduled',
		icon: 'flaticon-clock-2',
		page: '/employer/j/scheduled',
	},
	{
		title: 'Drafts',
		icon: 'flaticon-file-2',
		page: '/employer/j/drafts',
	},
	{
		title: 'Archived',
		icon: '	flaticon-interface-3',
		page: '/employer/j/archived',
	},
	{ section: 'Advance' },
	{
		title: 'Applications',
		icon: 'flaticon-rotate',
		page: '/employer/j/applications',
	},
	{
		title: 'Hiring Process',
		icon: 'flaticon-network',
		bullet: 'dot',
		submenu: [
			{
				title: 'Online Screening ',
				page: '/employer/j/online-screening',
			},
			{
				title: 'Appointment',
				page: '/employer/j/appointment',
			},
			{
				title: 'Stages',
				page: '/employer/j/stages',
			},
			{
				title: 'Interviews',
				page: '/employer/j/interviews',
			},
		]
	},
	{
		title: 'Messages',
		icon: 'flaticon-mail',
		bullet: 'dot',
		submenu: [
			{
				title: 'Email',
				page: '/employer/j/messages-email',
			},
			{
				title: 'SMS',
				page: '/employer/j/messages-sms',
			},
		]
	},
	{ section: 'System' },
	{
		title: 'Settings',
		icon: 'flaticon-settings',
		bullet: 'dot',
		submenu: [
			{
				title: 'Online Questionnaire',
				page: '/employer/j/online-questionnaire-setup',
			},
			{
				title: 'Interview Questions',
				page: '/employer/j/interview-questions-setup',
			},
			{
				title: 'Mail Server',
				page: '/employer/j/mail-server-setup',
			},
		]
	},
];

