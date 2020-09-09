import { Injectable } from '@angular/core';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
import { Select } from '@ngxs/store';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import {
	EMPLOYER_ASIDE_JOBPOST_NAV,
	EMPLOYER_ASIDE_PROFILE_NAV, JOBSEEKER_ASIDE_PROFILE_NAV,
	MenuConfig
} from '../../config/menu';
import { PublicNavDirectionTypes, PublicNavModel, ResponseModel } from '../../models';

@Injectable({ providedIn: 'root' })
export class MenuConfigService {

	configModel: MenuConfig = new MenuConfig();
	@Select('pageCoverNavBar', 'navData')
	readonly nav$: Observable<PublicNavModel[]>;

	onMenuUpdated$: BehaviorSubject<MenuConfig> = new BehaviorSubject(null);
	menuHasChanged: any = false;

	@Select('userLogin', 'employerInfo')
	readonly employerInfo$: Observable<ResponseModel>;

	private currentItems: PublicNavModel[] = [];

	constructor(private router: Router, private route: ActivatedRoute) {
		// this.router.events
		// 	.pipe(filter(event => event instanceof NavigationStart))
		// 	.subscribe(_ => {
		// 		if (this.menuHasChanged)
		// 			this.resetModel();
		// 	});

		const obs = [this.router.events, this.route.url, this.nav$];

		merge(...obs).subscribe({
			next: event => {

				if (Array.isArray(event)) {
					const res: PublicNavModel[] = event as any;
					this.currentItems = res;
				}

				const hm = this.currentItems.find(_ => +_.direction === PublicNavDirectionTypes.TopHorizontal);
				const d = hm?.items.map(_ => ({ title: _.label, root: true, page: _.path }));

				const config = { header: { items: (d || []) }, aside: { items: this.populateAside() } };

				this.onMenuUpdated$.next({ config: config });
			}
		});
	}

	/**
	 * The collection of group text are same as route url. we are comparing with the url text to populate left aside collection.
	 */
	private populateAside() {
		const u = this.router.url;
		if (u.search('jobseeker/my') > -1) {
			return JOBSEEKER_ASIDE_PROFILE_NAV.slice();
		}
		if (u.search('employer/my') > -1) {
			return EMPLOYER_ASIDE_PROFILE_NAV.slice();
		}
		if (u.search('employer/j') > -1) {
			return EMPLOYER_ASIDE_JOBPOST_NAV.slice();
		}
		// more...
		return [];
	}


	setModel(menuModel: MenuConfig) {
		this.configModel = Object.assign(this.configModel, menuModel);
		this.onMenuUpdated$.next(this.configModel);
		this.menuHasChanged = true;
	}

	resetModel() {
		this.configModel = new MenuConfig();
		this.onMenuUpdated$.next(this.configModel);
		this.menuHasChanged = false;
	}
}
