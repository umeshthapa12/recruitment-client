import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { PublicNavDirectionTypes, PublicNavModel } from '../../../models';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'page-cover-mobile',
	templateUrl: './page-cover-mobile.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	styles: [`
	.cover-wrapper{
		margin-bottom: 0;
		position: relative;
	}
	.cover-bg{
		background-image:url(assets/app/media/img/bg/hand-shake.jpg);
		background-repeat:no-repeat;
		background-size:cover;
        background-position:center;
		width: 100%;
	}
	.cover-overlay{
		width: 100%;
		background: rgba(8, 8, 27, 0.57);  /* fallback for old browsers */
		background: -webkit-linear-gradient(140deg, rgba(8, 8, 27, 0.57) 0%, rgba(16, 26, 70, 0.3) 100%);
		background: linear-gradient(140deg, rgba(8, 8, 27, 0.57) 0%, rgba(16, 26, 70, 0.3) 100%);
	}
	.cover-tab-menu{
		width: 100%;
		position: relative;
		bottom: -20px;
		right: 0;
		margin-top: 40px;
	}


	`]
})
export class PageCoverMobileComponent {
	@Select('pageCoverNavBar', 'navData') nav$: Observable<any>;

	mappedNavForCoverPage = (nav: PublicNavModel[] = []) => {
		const d = nav.find(_ => +_.direction === PublicNavDirectionTypes.OverCoverImageHorizontal);
		if (!d) return [];

		return d.items;
	}
}
