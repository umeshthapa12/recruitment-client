import { Action, State, StateContext } from '@ngxs/store';

export interface CoverConfigModel {
    showCover?: {
        main?: boolean,
        mini?: boolean;
    };
    showLeftAside?: boolean;
    showRightAside?: boolean;
}

/**
 * apply cover config.
 */
export class InitCoverConfigAction {
    static readonly type = '[cover-config] apply cover config';
    constructor(public config: CoverConfigModel) { }
}

@State<CoverConfigModel>({
    name: 'cover_config'
})
export class CoverConfigState {

    @Action(InitCoverConfigAction)
    initCoverConf(ctx: StateContext<any>, action: InitCoverConfigAction) {

        ctx.setState({ ...action, });

    }
}

