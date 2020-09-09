import { AfterViewInit, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Select } from '@ngxs/store';
import Quill from 'quill';
import { Observable } from 'rxjs';
import { ResponseModel, UsersModel } from '../../../../models';
import { filter, map } from 'rxjs/operators';

@Component({
    templateUrl: './contact-us.component.html',
})
export class ContactUsComponent implements OnInit {

    @Select('userLogin', 'employerInfo')
     readonly userData$: Observable<ResponseModel>;

    userInfo: UsersModel;

    constructor() {
        window.scrollTo({ top: 0, behavior: 'smooth' });

    }

    ngOnInit() {
        this.userData$.pipe(
            filter(_ => _ && _.contentBody),
            map(_ => ({ ...<UsersModel>_.contentBody })),
        ).subscribe({
            next: model => [this.userInfo = model]
        });
    }
}
