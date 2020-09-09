import { ChangeDetectorRef, Component, HostBinding, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ResponseModel, UsersModel } from '../../../models';

@Component({
    selector: 'pre-footer',
    templateUrl: './pre-footer.component.html',
    styles: [`

    .m-list-search .m-list-search__results .m-list-search__result-item:hover .m-list-search__result-item-text{
        color: #00c5dc !important
    }
    `]
})
export class PreFooterComponent implements OnInit {
    @HostBinding('class') classes = 'pre-footer-bg m-grid__item m-footer ';

    @Select('userLogin', 'employerInfo')
    readonly userSession$: Observable<ResponseModel>;
    userInfo: UsersModel;

    constructor(private cdr: ChangeDetectorRef) { }

    ngOnInit() {
        this.userSession$.pipe(
            filter(_ => _ && _.contentBody),
            map(_ => ({ ...<UsersModel>_.contentBody })),
        ).subscribe({
            next: model => {
                this.cdr.markForCheck();
                const x = model && model.about && JSON.parse(model.about).map(_ => _.insert).join(' ');
                this.userInfo = { ...model, about: x };
            }
        });
    }
}
