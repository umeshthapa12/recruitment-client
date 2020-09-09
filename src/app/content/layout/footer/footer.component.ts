import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { Select } from '@ngxs/store';
import * as objectPath from 'object-path';
import { BehaviorSubject, Observable } from 'rxjs';
import { LayoutConfigService } from '../../../core/services/layout-config.service';
import { PublicNavDirectionTypes, PublicNavModel } from '../../../models';

@Component({
	selector: 'm-footer',
	templateUrl: './footer.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
	@HostBinding('class') classes = 'm-grid__item m-footer';

	footerContainerClass$: BehaviorSubject<string> = new BehaviorSubject('');

	@Select('pageCoverNavBar', 'navData')
	readonly nav$: Observable<PublicNavModel[]>;

	constructor(private configService: LayoutConfigService) {
		this.configService.onLayoutConfigUpdated$.subscribe(model => {
			const config = model.config;

			let pageBodyClass = '';
			const selfLayout = objectPath.get(config, 'self.layout');
			if (selfLayout === 'boxed' || selfLayout === 'wide') {
				pageBodyClass += 'm-container--responsive m-container--xxl';
			} else {
				pageBodyClass += 'm-container--fluid';
			}
			this.footerContainerClass$.next(pageBodyClass);
		});
	}

	mapNavData = (nav: PublicNavModel[] = []) => {
		const d = nav.find(_ => +_.direction === PublicNavDirectionTypes.SuperBottomRightHorizontal);
		if (!d) return [];

		return d.items;
	}
}
