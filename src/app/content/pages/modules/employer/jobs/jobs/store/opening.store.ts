import { Injectable } from '@angular/core';
import { Action, State, StateContext, Store } from '@ngxs/store';
import { delay, switchMap, tap } from 'rxjs/operators';
import { OpeningModel, ResponseModel } from '../../../../../../../models';
import { JobService } from '../job.service';

/*----------------------------------------
    cached data state section
-----------------------------------------*/
let CACHED: OpeningModel[] = [];

/**
 * Start to load lazy opening either form local variable or from API if not found.
 */
export class LoadLazyOpeningAction {
    static readonly type = '[openings] loads lazy opening\'s data from API';
    constructor(public id: number) { }
}

/**
 * Once the response is succeed, Initialize lazy opening data.
 */
export class InitLazyOpeningAction {
    static readonly type = '[openings] init lazy opening\'s  data';
    constructor(public lazy: OpeningModel) { }
}

/**
 * Cached user gets updated if chage happens
 */
export class AddOrUpdateAction {
    static readonly type = '[openings] add or update opening data if cached/no cached';
    constructor(public AddOrUpdate: ResponseModel) { }
}

/**
 * Release from memory.
 */
export class ClearCachedOpeningOnDestroyAction {
    static readonly type = '[openings] clears lazy opening cached data from the history';
}

/**
 * opening state
 */
@Injectable()
@State({
    name: 'openings',
    defaults: {},
})
export class OpeningState {

    constructor(
        private cService: JobService,
        private store: Store) { }

    @Action(LoadLazyOpeningAction)
    loadLazyOpening(ctx: StateContext<ResponseModel>, action: LoadLazyOpeningAction) {

        if (!CACHED) CACHED = [];

        const el = CACHED.find(_ => _.id === action.id);
        // clear history. we don't need it.
        ctx.setState(null);

        if (el) {
            ctx.setState({ contentBody: el, ...action });
            // if found in cache, return it
            return this.store.dispatch(new InitLazyOpeningAction(el));
        }

        // not found in cache, load from API
        return this.cService.getLazyOpening(action.id).pipe(
            delay(800),
            tap(res => {
                ctx.setState({ contentBody: res.contentBody, ...action });
                CACHED.push(res.contentBody);
            }),
            switchMap(res => this.store.dispatch(new InitLazyOpeningAction(res.contentBody)))
        );

    }

    @Action(InitLazyOpeningAction)
    initLazyOpening(ctx: StateContext<OpeningModel>, action: InitLazyOpeningAction) {
        const state = ctx.getState();
        ctx.setState({ ...state, ...action });
    }

    @Action(AddOrUpdateAction)
    updateCached(ctx: StateContext<any>, action: AddOrUpdateAction) {

        if (!CACHED) CACHED = [];

        const opening = { ...action.AddOrUpdate.contentBody };
        const id = (opening && opening.id || 0);
        const index = CACHED.findIndex(_ => _.id === id);

        ctx.setState({ ...action });

        if (index > -1) CACHED[index] = { ...action.AddOrUpdate.contentBody };
        else CACHED.unshift(opening);
        //  console.log(action)
        // return of(action)
    }

    @Action(ClearCachedOpeningOnDestroyAction)
    clearCached(ctx: StateContext<any>) {
        CACHED = null;
        ctx.setState(null);
    }

}


export class OpeningMethodAction {
    static readonly type = '[hub method] created response';
    constructor(public openingResponse: ResponseModel) { }
}

@Injectable()
@State<ResponseModel>({
    name: 'notificationHub'
})
export class SignalrHubState {

    @Action(OpeningMethodAction)
    onCreated(ctx: StateContext<ResponseModel>, action: OpeningMethodAction) {
        const state = ctx.getState();

        // also update the cached array if found
        const o = { ...action.openingResponse.contentBody };
        const id = (o && o.id || 0);
        const index = CACHED.findIndex(_ => _.id === id);
        if (index > -1)
            CACHED[index] = o;

        ctx.setState({ ...state, ...action });
    }

}
