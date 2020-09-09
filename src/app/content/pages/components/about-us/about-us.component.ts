import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Select } from '@ngxs/store';
import Quill from 'quill';
import { Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { ResponseModel, UsersModel } from '../../../../models';

@Component({
  templateUrl: './about-us.component.html',
})
export class AboutUsComponent implements AfterViewInit {

  @Select('userLogin', 'employerInfo')
  readonly userData$: Observable<ResponseModel>;

  @ViewChild('about')
  private readonly about: ElementRef<HTMLElement>;

  private staticData = `Jobharu is cloud base (SaaS) online web package job portal
  system is be
  used by agencies to improve the efficiency of their business with ‘right person, right job, and right time’. <br><br> It
  helps to job seeker for viewing available jobs or applying for the job at the agency can be done for which job
  seekers has to go to the agency and check the available jobs at the agency. <br><br> Job seekers check the list of jobs
  available and apply the job. The agency will show available jobs for the job seeker for his on the basis of
  different criteria and then updates the jobs database.`;

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
      tap(_ => _ && _.contentBody !== '' ? '' : this.about.nativeElement.innerHTML = this.staticData),
      filter(_ => _ && _.contentBody),
      map(_ => ({ ...<UsersModel>_.contentBody })),
    ).subscribe({
      next: model => this.initQuillData(this.about.nativeElement, model.about)
    });
  }

}
