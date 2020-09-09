import { ChangeDetectorRef, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import Quill from 'quill';
import { Observable, Subject } from 'rxjs';
import { delay, filter, takeUntil, tap } from 'rxjs/operators';
import { OpeningModel } from '../../../../../models/opening.model';

@Component({
    selector: 'expanded-lazy-content',
    templateUrl: './expanded.component.html',
    styles: [`
    .m-widget1{
         padding: 10px 0;
    }
    .m-widget1__item{
        transition:background .2s ease-in;
        padding-left: 5px;
        padding-right: 5px;
    }
    .m-widget1__item:hover{
        background:#FFFFFF;
    }
    .row-hover:hover{
        background: #FFFFFF;
    }
    .skills-badge {
        padding: 1px 6px;
        background: #e7eef8;
        color: #3e63a3;
    }
    `]
})
export class ExpandedComponent implements OnInit, OnDestroy {
    // bind class to its host -> `<expanded-lazy-content>`
    @HostBinding('class')
    private class = ' w-100';

    private readonly toDestroy$ = new Subject<void>();

    content: OpeningModel;

    isLoading: boolean = true;

    // name of the slice -> stateName.actionArg
    @Select('openings', 'lazy')
    lazyOpening: Observable<OpeningModel>;

    constructor(private cdr: ChangeDetectorRef) { }

    ngOnInit() {

        this.lazyOpening.pipe(
            filter(_ => _ && _.id > 0),
            takeUntil(this.toDestroy$),
            delay(10),
            tap(res => [this.cdr.markForCheck(), this.content = res, this.isLoading = false]),
            delay(50)
        ).subscribe({
            next: res => [
                this.initQuill(res.jobDescription, document.querySelector('#job-desc')),
                this.initQuill(res.jobSpecification, document.querySelector('#job-spec')),
                this.initQuill(res.preferred, document.querySelector('#job-pref')),
                this.initQuill(res.benefits, document.querySelector('#job-benef')),
                this.initQuill(res.applyProcedure, document.querySelector('#job-apply-proc')),
            ]
        });

    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    private initQuill(jsonValue: any, element: HTMLElement) {
        if (!element) return;
        const q = new Quill(element, { readOnly: true });
        q.setContents(jsonValue ? JSON.parse(jsonValue) : []);
    }

}
