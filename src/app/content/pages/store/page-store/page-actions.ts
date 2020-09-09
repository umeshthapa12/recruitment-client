import { OpeningTitles, ResponseModel } from '../../../../models';
import { ApplyClickedOptions, JobsContentModel } from './page-model';

export class PageContentAction {
    static readonly type = 'simple cover content updater';
    constructor(public content: JobsContentModel) { }
}

export class ScrollIntoApplySectionAction {
    static readonly type = 'scroll into apply section';
    constructor(public scroll: boolean) { }
}

export class RightAsideApplyCardAction {
    static readonly type = 'scroll into apply section';
    constructor(public config: ApplyClickedOptions) { }
}

export class ApplyForJobAction {
    static readonly type = 'user clicks on apply for job';
    constructor(public config: ApplyClickedOptions) { }
}
export class RightAsideApplyCardClickedCallbackAction {
    static readonly type = 'call back event for action buttons';
    constructor(public callback?: ResponseModel) { }
}

export class RightAsideSimilarOpeningsAction {
    static readonly type = 'similar openings lists';
    constructor(public similar: OpeningTitles) { }
}

export class GetLikedJobsIdsAction {
    static readonly type = '[job seeker likes] gets liked job ids';
}

export class InitLikedJobIdsAction {
    static readonly type = '[job seeker likes] init liked job ids';
    constructor(public likedJobIds: number[]) { }
}

export class UpdateLikedJobIdsAction {
    static readonly type = '[job seeker likes] mutate data';
    constructor(public jobId: number) { }
}

export class GetFavJobsIdsAction {
    static readonly type = '[job seeker saved job] gets saved job ids';
}

export class InitFavJobIdsAction {
    static readonly type = '[job seeker saved job] init saved job ids';
    constructor(public favJobIds: number[]) { }
}

export class UpdateFavJobIdsAction {
    static readonly type = '[job seeker saved job] mutate saved job data';
    constructor(public jobId: number) { }
}

export class GetAppliedIdsAction {
    static readonly type = '[job seeker applied] get applied job IDs';
}

export class InitAppliedIdsAction {
    static readonly type = '[job seeker applied] init applied job IDs';
    constructor(public appliedJobIds: number[]) { }
}
