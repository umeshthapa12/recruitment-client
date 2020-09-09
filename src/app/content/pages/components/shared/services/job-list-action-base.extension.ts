import { HttpErrorResponse } from '@angular/common/http';
import { EventEmitter } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, switchMap, tap } from 'rxjs/operators';
import { OpeningModel } from '../../../../../models';
import { UpdateFavJobIdsAction, UpdateLikedJobIdsAction } from '../../../store/page-store/page-actions';
import { SharedJobService } from './shared-jobs.service';
export interface ActionType { action: string; opening: OpeningModel; }

export class JobListActionBase {

    // Job seeker job likes
    private jsLikedIds = [];
    @Select('listingJobs', 'likedJobIds')
    readonly jsLikedId$: Observable<number[]>;

    private jsFavIds = [];
    @Select('listingJobs', 'favJobIds')
    readonly jsFavId$: Observable<number[]>;

    constructor(
        public store: Store,
        public jService: SharedJobService
    ) {

        // Gets liked job ids to track changes
        this.jsLikedId$.subscribe({ next: ids => [this.jsLikedIds = ids ? [...ids] : []] });

        this.jsFavId$.subscribe({ next: ids => [this.jsFavIds = ids ? [...ids] : []] });

    }

    public onListAction(onListActionChange: EventEmitter<ActionType>, source: OpeningModel[]) {

        let x: ActionType;

        onListActionChange.pipe(
            tap(_ => x = _), debounceTime(300), switchMap(this.switchMapAction)
        ).subscribe({
            next: res => {

                if (!(res instanceof HttpErrorResponse)) {

                    switch (x.action) {
                        case 'like':
                            this.UpdateLikeCount(x.opening, source);
                            break;
                        case 'fav':
                            this.store.dispatch(new UpdateFavJobIdsAction(x.opening.id));
                            break;

                        default:
                            break;
                    }
                }
            },
            error: e => { console.log(e); }
        });
    }

    private UpdateLikeCount(x: OpeningModel, source: OpeningModel[]) {
        const index = this.jsLikedIds.findIndex(i => i === x.id);
        const oIndex = source.findIndex(_ => _.id === x.id);

        // toggle opening's collection likes
        x.likeCounts = index > -1 ? (--x.likeCounts) : (++x.likeCounts);

        // toggle local collection of liked IDs
        this.store.dispatch(new UpdateLikedJobIdsAction(x.id));

        source[oIndex] = x;
        source = [...source];
    }

    private switchMapAction = (x: ActionType) => {

        switch (x.action) {

            case 'like':

                const x1 = this.jsLikedIds.findIndex(i => i === x.opening.id);
                return this.jService.updateJobLikes(x.opening.id, x1 > -1 ? false : true)
                    .pipe(catchError(e => of(e)));

            case 'fav':
                const x2 = this.jsFavIds.findIndex(i => i === x.opening.id);
                return this.jService.updateFav(x.opening.id, x2 > -1 ? false : true)
                    .pipe(catchError(e => of(e)));

            case 'share':

                break;

        }

    }
}
