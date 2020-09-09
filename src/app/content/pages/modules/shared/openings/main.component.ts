import { Component, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Select } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { OpeningModel, ResponseModel } from '../../../../../models';

@Component({
    templateUrl: './main.component.html',
})
export class MainComponent implements OnDestroy {

    private readonly toDestroy$ = new Subject<void>();

    @Select('openings', 'AddOrUpdate')
    opening$: Observable<ResponseModel>;

    constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: {
            isBasic: boolean,
            id: number,
            guid: string,
            editType: string
        }
    ) {
        // whenever an opening being created or get updated, we only select ID to add reference on the child data
        this.opening$.pipe(
            takeUntil(this.toDestroy$), map(res => res && <OpeningModel>res.contentBody),
            filter(_ => _ && _.id && _.id > 0 && this.data.id <= 0)
        ).subscribe({ next: _ => this.data.id = _.id });
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }
}
