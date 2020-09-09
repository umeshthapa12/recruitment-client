import { Injectable } from '@angular/core';
import { Action, State, StateContext } from '@ngxs/store';
import { map, tap, catchError } from 'rxjs/operators';
import { ResponseModel } from '../../../../models';
import { SharedJobService } from '../../components/shared/services/shared-jobs.service';
import { ApplyForJobAction, GetFavJobsIdsAction, GetLikedJobsIdsAction, InitFavJobIdsAction, InitLikedJobIdsAction, PageContentAction, RightAsideApplyCardAction, RightAsideApplyCardClickedCallbackAction, RightAsideSimilarOpeningsAction, ScrollIntoApplySectionAction, UpdateFavJobIdsAction, UpdateLikedJobIdsAction, GetAppliedIdsAction, InitAppliedIdsAction } from './page-actions';
import { ApplyClickedOptions, JobsContentModel } from './page-model';
import { of } from 'rxjs';

@Injectable()
@State<JobsContentModel>({
    // name must be unique. The name prop is to get slice form the select()
    name: 'simpleCover',
    defaults: null,
})
export class JobsState {
    @Action(PageContentAction)
    updateCoverText(ctx: StateContext<JobsContentModel>, action: PageContentAction) {

        const state = ctx.getState();
        ctx.setState({
            ...state,
            ...action.content,
        });
    }
}

@Injectable()
@State({
    // name must be unique. The name prop is to get slice form the select()
    name: 'scrollToApply',
    defaults: {
        scroll: false
    },
})
export class ScrollIntoApplySectionState {
    @Action(ScrollIntoApplySectionAction)
    scrollIntoApplySection(ctx: StateContext<any>, action: ScrollIntoApplySectionAction) {

        const state = ctx.getState();
        ctx.setState({
            ...state,
            ...action,
        });
        setTimeout(() => {
            action.scroll = false;
            ctx.setState({
                ...state,
                ...action
            });
        }, 600);
    }
}

@Injectable()
@State({
    // name must be unique. The name prop is to get slice form the select()
    name: 'rightAsideApplyCard',
    defaults: null
})
export class RightAsideApplyCardState {
    @Action(RightAsideApplyCardAction)
    rightAsideApplyCard(ctx: StateContext<ApplyClickedOptions>, action: RightAsideApplyCardAction) {

        const state = ctx.getState();
        ctx.setState({
            ...state,
            ...action,
        });

    }
}

@Injectable()
@State({
    // name must be unique. The name prop is to get slice form the select()
    name: 'rightAsideApplyCardButtonActions',
    defaults: null
})
export class RightAsideApplyCardButtonState {
    @Action(ApplyForJobAction)
    rightAsideApplyCardButton(ctx: StateContext<ApplyClickedOptions>, action: ApplyForJobAction) {

        const state = ctx.getState();
        ctx.setState({ ...state, ...action });
        ctx.setState(null);

    }

    @Action(RightAsideApplyCardClickedCallbackAction)
    rightAsideApplyCardButtonCallback(ctx: StateContext<ApplyClickedOptions>, action: RightAsideApplyCardClickedCallbackAction) {
        const state = ctx.getState();
        ctx.setState({ ...state, ...action });
    }
}

@Injectable()
@State({
    // name must be unique. The name prop is to get slice form the select()
    name: 'rightAsideSimilarOpenings',
    defaults: null
})
export class RightAsideApplySimilarOpeningsState {
    @Action(RightAsideSimilarOpeningsAction)
    rightAsideSimilar(ctx: StateContext<any>, action: RightAsideSimilarOpeningsAction) {

        const state = ctx.getState();
        ctx.setState({
            ...state,
            ...action,
        });

    }
}

@Injectable()
@State({
    // name must be unique. The name prop is to get slice form the select()
    name: 'listingJobs',
    defaults: null
})
export class JobListingState {

    constructor(private jService: SharedJobService) { }

    @Action(GetLikedJobsIdsAction)
    a(ctx: StateContext<number[]>) {

        return this.jService.getLikedJobsIds().pipe(
            map(_ => _.contentBody),
            tap(ids => ctx.dispatch(new InitLikedJobIdsAction(ids)))
        );
    }

    @Action(InitLikedJobIdsAction)
    b(ctx: StateContext<ResponseModel>, action: InitLikedJobIdsAction) {
        const state = ctx.getState();
        ctx.setState({ ...state, ...action });
    }

    @Action(UpdateLikedJobIdsAction)
    c(ctx: StateContext<any>, action: UpdateLikedJobIdsAction) {
        ctx.dispatch(new GetLikedJobsIdsAction());

        const state = ctx.getState();

        const ids: number[] = state['likedJobIds'] ? [...state['likedJobIds']] : [];

        if (!(ids || action.jobId || action)) return;

        const index = ids.findIndex(i => i === action.jobId);

        index > -1 ? ids.splice(index, 1) : ids.push(action.jobId);

        ctx.setState({ ...state, ...action, likedJobIds: ids });

    }

    @Action(GetFavJobsIdsAction)
    d(ctx: StateContext<number[]>) {

        return this.jService.getFavJobsIds().pipe(
            map(_ => _.contentBody),
            tap(ids => ctx.dispatch(new InitFavJobIdsAction(ids)))
        );
    }

    @Action(InitFavJobIdsAction)
    e(ctx: StateContext<ResponseModel>, action: InitFavJobIdsAction) {
        const state = ctx.getState();
        ctx.setState({ ...state, ...action });
    }

    @Action(UpdateFavJobIdsAction)
    f(ctx: StateContext<any>, action: UpdateFavJobIdsAction) {
        ctx.dispatch(new GetFavJobsIdsAction());

        const state = ctx.getState();

        const ids: number[] = state['favJobIds'] ? [...state['favJobIds']] : [];

        if (!(ids || action.jobId || action)) return;

        const index = ids.findIndex(i => i === action.jobId);

        index > -1 ? ids.splice(index, 1) : ids.push(action.jobId);

        ctx.setState({ ...state, ...action, favJobIds: ids });

    }

    @Action(GetAppliedIdsAction)
    g(ctx: StateContext<any>) {
        return this.jService.getAppliedJobIds().pipe(
            map(_ => _.contentBody),
            catchError(_ => of([])),
            tap(ids => ctx.dispatch(new InitAppliedIdsAction(ids))
            ));
    }

    @Action(InitAppliedIdsAction)
    h(ctx: StateContext<ResponseModel>, action: InitAppliedIdsAction) {
        const state = ctx.getState();
        ctx.setState({ ...state, ...action });
    }

}
