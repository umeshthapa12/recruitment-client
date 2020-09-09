import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ResponseModel, UsersModel } from '../../../../../models';
import { fadeInOutDown } from '../../../../../utils';

@Component({
    selector: 'user-register',
    templateUrl: './register.component.html',
    animations: [fadeInOutDown],
    styles: [`
        .x-icon-y{
            font-size: 80px;
            line-height: 0;
            background: -webkit-gradient(linear, left top, left bottom, from(#b245df), to(#336dea));
            background: linear-gradient(#b245df, #336dea);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .nav-item{ cursor: pointer}
        .m-login{
            font-family: Roboto,"Helvetica Neue",sans-serif;
        }
    `]
})
export class UserRegisterComponent implements OnInit {
    @Select('userLogin', 'employerInfo')
    readonly emp$: Observable<ResponseModel>;
    private userInfo: UsersModel;
    get isSameHost() {
        return (window.location.hostname || document.location.hostname) === (this.userInfo && this.userInfo.domain);
    }
    selectedTab: string = 'job-seeker';
    constructor(private cdr: ChangeDetectorRef) { }

    ngOnInit() {
        this.emp$.pipe(
            filter(_ => _ && _.contentBody),
            map(_ => ({ ...<UsersModel>_.contentBody })),
        ).subscribe({ next: model => this.userInfo = model });
    }

    reset(e: Event, selected: string) {
        this.cdr.markForCheck();
        this.selectedTab = selected;
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
}
