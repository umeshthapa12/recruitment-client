import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Action, State, StateContext, Store } from '@ngxs/store';
import { mergeMap, tap, delay } from 'rxjs/operators';
import { DropdownProviderService } from '../content/pages/components/shared/services/dropdown-provider.service';
import { SharedJobService } from '../content/pages/modules/shared/shared-jobs.service';
import { LoginCred, ResponseModel, UserType } from '../models/app.model';
import { AuthService } from '../services/auth.service';
import { BaseUrlCreator } from '../utils';
import { InitDropdownAction } from './dropdown-data.store';
import { InitFilterActions } from './filter-data.store';

/*----------------------------------------
    login state section
-----------------------------------------*/
/**
* Repeated dataset of multiple sections should load at once
* so we can access them from entire app using ngxs state management.
* @link https://github.com/ngxs/store
*/
export class InitGlobalData {
    static readonly type = '[app] initialize reusable startup dataset';
}

export class InitUserLoginAction {
    static readonly type = '[user] being login';
    constructor(public initLogin: ResponseModel) { }
}

export class LogoutAction {
    static readonly type = '[user] is logout';
    constructor(public logout: ResponseModel) { }
}

export class IsUserLoggedInAction {
    static readonly type = '[user] check active session';
    constructor(public type: UserType) { }
}

export class AppStartupAction {
    static readonly type = '[user] get user info';
    constructor(public userSession: ResponseModel) { }
}

export class GetEmployerInfoAction {
    static readonly type = '[employer] Gets employer info by domain name';
    constructor(public load: boolean) { }
}

export class InitEmployerInfoAction {
    static readonly type = '[employer] Gets employer info by domain name';
    constructor(public employerInfo: ResponseModel) { }
}
export class GetPageCoverNavAction {
    static readonly type = '[page cover nav] Gets page cover nav';
}

export class InitPageCoverNavAction {
    static readonly type = '[page cover nav] init page cover nav';
    constructor(public navData: any) { }
}

export class GetProfileStrengthAction {
    static readonly type = '[job seeker] Gets job seeker profile strength';
}
export class InitProfileStrengthAction {
    static readonly type = '[job seeker] Init job seeker profile strength';
    constructor(public profileStrength: { percentage: number, status: string }) { }
}

@Injectable({ providedIn: 'root' })
@State<ResponseModel>({
    name: 'userLogin'
})
export class AppState {

    constructor(
        private authService: AuthService,
        private http: HttpClient,
        private url: BaseUrlCreator,
        private jService: SharedJobService,
        private store: Store
    ) { }


    // when user login using form
    @Action(InitUserLoginAction)
    logUser(ctx: StateContext<ResponseModel>, action: InitUserLoginAction) {

        const model: LoginCred = action.initLogin.contentBody;

        return this.authService.userLogin(model.user, model.userType).pipe(
            tap((res) => {
                const state = ctx.getState();
                action.initLogin = res;
                ctx.setState({ ...state, ...action });

                ctx.dispatch(new IsUserLoggedInAction(model.userType));
            })
        );
    }

    // when user log out the app
    @Action(LogoutAction)
    logout(ctx: StateContext<any>, action: LogoutAction) {
        const model: LoginCred = action.logout.contentBody;
        return this.authService.userLogout(model.userType).pipe(
            tap((res) => {
                const state = ctx.getState();
                action.logout = res;
                ctx.patchState({ logout: res, initLogin: null, userSession: null });
                // after logout success, we no more needed state data so set it to null.
                setTimeout(_ => ctx.patchState({ logout: null }), 0);
            })
        );
    }

    // when app loads, we check for the active session
    @Action(IsUserLoggedInAction)
    isLoggedIn(ctx: StateContext<ResponseModel>, action: IsUserLoggedInAction) {
        return this.authService.isUserSessionValid(action.type).pipe(
            // re-init login info based on active session response
            tap(res => {
                // set if it needed where it dispatched
                const state = ctx.getState();
                ctx.setState({ ...state, ...res });
            }),
            mergeMap(res => ctx.dispatch(new AppStartupAction(res)))
        );
    }

    // use user info if the session is active
    @Action(AppStartupAction)
    appStartupUserInfo(ctx: StateContext<ResponseModel>, action: AppStartupAction) {
        setTimeout(() => {
            const state = ctx.getState();
            ctx.setState({ ...state, ...action });
        }, 1000);
    }

    @Action(GetEmployerInfoAction)
    employerInfo(ctx: StateContext<ResponseModel>, action: GetEmployerInfoAction) {
        const b = this.url.createUrl('Account', 'Employer');
        if (action && action.load)
            return this.http.get<ResponseModel>(`${b}/GetInfo`)
                .pipe(mergeMap(res => ctx.dispatch(new InitEmployerInfoAction(res))));
    }

    @Action(InitEmployerInfoAction)
    initEmployerInfo(ctx: StateContext<any>, action: InitEmployerInfoAction) {
        ctx.setState({ employerInfo: action.employerInfo });
    }

    @Action(GetProfileStrengthAction)
    getProfileStrength(ctx: StateContext<any>) {
        return this.jService.getProfileStrength().pipe(
            mergeMap(_ => ctx.dispatch(new InitProfileStrengthAction(_.contentBody)))
        );
    }

    @Action(InitProfileStrengthAction)
    initProSt(ctx: StateContext<any>, action: InitProfileStrengthAction) {
        const s = ctx.getState();
        return ctx.setState({ ...s, ...action });
    }

    @Action(InitGlobalData)
    appInit() {
        // initialize dropdown collection
        this.store.dispatch(new InitDropdownAction());

        // initialize filter data collection
        this.store.dispatch(new InitFilterActions());


        // rest...
    }
}

/*----------------------------------------
    page overlay state section
-----------------------------------------*/
export class ActivateOverlayAction {
    static readonly type = '[page] overlay is activated';
    constructor(public attach: boolean) { }
}

export class DeactivateOverlayAction {
    static readonly type = '[page] overlay is deactivated';
}

@Injectable()
@State({
    name: 'pageOverlay',
    defaults: false
})
export class PageOverlayState {

    @Action(ActivateOverlayAction)
    activeOverlay(ctx: StateContext<any>, action: any) {
        const state = ctx.getState();
        ctx.setState({ ...state, ...action });
    }

    @Action(DeactivateOverlayAction)
    deactivateOverlay(ctx: StateContext<any>, action: any) {
        const state = ctx.getState();
        ctx.setState({ ...state, ...action });
    }
}



@Injectable()
@State({
    name: 'pageCoverNavBar',
    defaults: { navData: [] }
})
export class PageCoverNavState {

    constructor(private drop: DropdownProviderService) { }

    @Action(GetPageCoverNavAction)
    activeOverlay(ctx: StateContext<any>) {
        return this.drop.getPageCoverNav().pipe(
            tap(res => ctx.dispatch(new InitPageCoverNavAction(res)))
        );
    }

    @Action(InitPageCoverNavAction)
    deactivateOverlay(ctx: StateContext<any>, action: InitPageCoverNavAction) {
        const state = ctx.getState();
        ctx.setState({ ...state, ...action });
    }
}

