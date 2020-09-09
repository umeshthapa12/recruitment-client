import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ResponseModel, UsersModel } from '../../../../../../models';

@Component({
    selector: 'profile-complete-banner',
    templateUrl: './profile-complete-banner.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [`

        .custom-bg-color{
            box-shadow: none;background: #36a3f7;
            background: -webkit-linear-gradient(to right, #36a3f7, #00c5dc);
            background: linear-gradient(to right, #36a3f7, #00c5dc);
        }
        .profile-complete-text{
            transition: font-size .4s cubic-bezier(.79,.51,.45,.75); position: absolute; font-size: 14px;
            cursor: pointer;
        }
        .custom-badge-inside-btn{
            position: absolute;
            top: -10px;
            right: 2px;
        }
        .profile-banner-img{
            background-position: center; background-repeat:no-repeat;
            background-position: center;
            background-size: cover; height: 4rem; width: 4rem; border-radius: 50%
        }
        .animator span{
			transition: all .2s cubic-bezier(.79,.51,.45,.75);
		}
		.animator:hover span{
			/*transform: rotate(-6deg);*/
			transform:  translate(4px,0px) scale(1.1) rotate(-5deg);
			box-shadow: 0px 0px 2px 0px rgba(81, 77, 92, 0.7);
        }

        .info-block{
            box-shadow: 0px 1px 15px 1px rgba(81, 77, 92, 0.1);
            background: #00c5dc42 !important;
            margin: 0;
        }
    `]
})
export class ProfileCompleteBannerComponent implements OnInit {

    profileStrength = '';

    @Select('userLogin', 'userSession')
    readonly userSession$: Observable<ResponseModel>;

    userInfo: UsersModel;

    constructor(private cdr: ChangeDetectorRef) {
        const timer = setTimeout(() => {
            this.cdr.markForCheck();
            this.profileStrength = '63';
            clearTimeout(timer);
        }, 1000);
    }

    ngOnInit() {
        this.userSession$.pipe(
            filter(_ => _ && _.contentBody),
            map(_ => <UsersModel>_.contentBody),
        ).subscribe(model => {
            this.cdr.markForCheck();
            this.userInfo = model;
        });
    }


}
