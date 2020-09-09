import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Select } from '@ngxs/store';
import Quill from 'quill';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ResponseModel, UsersModel } from '../../../../models';

@Component({
  templateUrl: './disclaimer.component.html',
})
export class DisclaimerComponent implements AfterViewInit {

  @Select('userLogin', 'employerInfo')
  readonly userData$: Observable<ResponseModel>;

  @ViewChild('dis')
  private readonly disc: ElementRef<HTMLElement>;

  constructor() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


  private initQuillData(el: HTMLElement, d: string) {

    if (!el || (d || '') === '') return;
    const ql = new Quill(el, {
      readOnly: true,
      modules: {
        toolbar: false
      }
    });
    ql.setContents(JSON.parse(d));
  }

  ngAfterViewInit() {

    this.userData$.pipe(
      filter(_ => _ && _.contentBody),
      map(_ => ({ ...<UsersModel>_.contentBody })),
    ).subscribe({
      next: model => this.initQuillData(this.disc.nativeElement, model.disclaimer)
    });
  }

}
