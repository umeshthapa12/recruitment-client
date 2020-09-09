import { Injectable } from '@angular/core';
import { Action, State, StateContext, Store } from '@ngxs/store';
import { merge } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';
import { DropdownProviderService } from '../content/pages/components/shared/services/dropdown-provider.service';
import { DropdownModel } from '../models';
import { StageModel } from '../models/application.model';

/*----------------------------------------
    dropdown data load state section
-----------------------------------------*/
/**
 * initialize dropdown collections at app startups
 */
export class InitDropdownAction {
    static readonly type = '[dropdown] init on app start';
}

/**
 * Gets job categories
 */
export class JobCategoryAction {
    static readonly type = '[dropdown] loads job category';
    constructor(public jobCategories: DropdownModel[]) { }
}

/**
 * Gets job categories
 */
export class JobTypesAction {
    static readonly type = '[dropdown] loads job types';
    constructor(public jobTypes: DropdownModel[]) { }
}

/**
 * Gets experience levels
 */
export class ExperienceLevelAction {
    static readonly type = '[dropdown] loads job experience levels';
    constructor(public experienceLevel: DropdownModel[]) { }
}

/**
 * Gets  status list
 */
export class RowStatusAction {
    static readonly type = '[dropdown] status';
    constructor(public status: DropdownModel[]) { }
}

/**
 * Gets  opening service types
 */
export class OpeningServiceTypesAction {
    static readonly type = '[dropdown] opening service types';
    constructor(public openingServiceTypes: DropdownModel[]) { }
}

/**
 * Gets mail templates
 */
export class MailTemplatesAction {
    static readonly type = '[dropdown] mail templates';
    constructor(public mailTemplates: DropdownModel[]) { }
}

/**
 * Gets qualifications
 */
export class QualificationAction {
    static readonly type = '[dropdown] loads qualifications';
    constructor(public qualification: DropdownModel[]) { }
}


/**
 * Gets qualifications
 */
export class MaritalStatusAction {
    static readonly type = '[dropdown] loads marital status';
    constructor(public maritalStatus: DropdownModel[]) { }
}

/**
 * Gets stages
 */
export class StagesAction {

    static readonly type = '[dropdown] loads stages';
    constructor(public stages: StageModel[]) { }
}

@Injectable()
@State({
    // state name
    name: 'dropdowns',
    defaults: []
})
export class DropdownDataState {

    constructor(
        private dropdown: DropdownProviderService,
        private store: Store) { }

    @Action(InitDropdownAction)
    initDropdowns() {

        const obs = [
            // job categories
            this.dropdown.getJobCategories().pipe(delay(400),
                switchMap(x => this.store.dispatch(new JobCategoryAction(x)))
            ),

            // job types
            this.dropdown.getJobTypes().pipe(delay(800),
                switchMap(x => this.store.dispatch(new JobTypesAction(x)))
            ),

            // content status
            this.dropdown.getStatus().pipe(delay(1500),
                switchMap(y => this.store.dispatch(new RowStatusAction(y)))
            ),

            // experience levels
            this.dropdown.getExperienceLevel().pipe(delay(1500),
                switchMap(y => this.store.dispatch(new ExperienceLevelAction(y)))
            ),

            // opening service types
            this.dropdown.getOpeningServiceTypes().pipe(delay(1500),
                switchMap(y => this.store.dispatch(new OpeningServiceTypesAction(y)))
            ),

            // mail template titles
            this.dropdown.getMailTemplateTitles().pipe(delay(1500),
                switchMap(y => this.store.dispatch(new MailTemplatesAction(y)))
            ),

            // qualifications
            this.dropdown.getQualifications().pipe(delay(1500),
                switchMap(y => this.store.dispatch(new QualificationAction(y)))
            ),

            // marital status
            this.dropdown.getMaritalStatus().pipe(delay(1500),
                switchMap(y => this.store.dispatch(new MaritalStatusAction(y)))
            ),

            // stages
            this.dropdown.getStages().pipe(delay(1000),
                switchMap(y => this.store.dispatch(new StagesAction(y)))
            ),

        ];

        return merge(...obs);
    }

    /*-- job categories --*/
    @Action(JobCategoryAction)
    loadCategories(ctx: StateContext<DropdownModel[]>, action: JobCategoryAction) {
        const state = ctx.getState();
        ctx.setState({ ...state, ...action });
    }

    /*-- job types --*/
    @Action(JobTypesAction)
    loadJobTypes(ctx: StateContext<DropdownModel[]>, action: JobTypesAction) {
        const state = ctx.getState();
        ctx.setState({ ...state, ...action });
    }

    /*-- row status --*/
    @Action(RowStatusAction)
    status(ctx: StateContext<DropdownModel[]>, action: RowStatusAction) {
        const state = ctx.getState();
        ctx.setState({ ...state, ...action });
    }

    /*-- experience levels --*/
    @Action(ExperienceLevelAction)
    experienceLevel(ctx: StateContext<DropdownModel[]>, action: ExperienceLevelAction) {
        const state = ctx.getState();
        ctx.setState({ ...state, ...action });
    }

    /*-- opening service types --*/
    @Action(OpeningServiceTypesAction)
    openingServiceTypes(ctx: StateContext<DropdownModel[]>, action: OpeningServiceTypesAction) {
        const state = ctx.getState();
        ctx.setState({ ...state, ...action });
    }

    /*-- mail templates --*/
    @Action(MailTemplatesAction)
    mailTemplates(ctx: StateContext<DropdownModel[]>, action: MailTemplatesAction) {
        const state = ctx.getState();
        ctx.setState({ ...state, ...action });
    }

    /*-- qualifications --*/
    @Action(QualificationAction)
    qualifications(ctx: StateContext<DropdownModel[]>, action: QualificationAction) {
        const state = ctx.getState();
        ctx.setState({ ...state, ...action });
    }

    /*-- marital status --*/
    @Action(MaritalStatusAction)
    maritalStatus(ctx: StateContext<DropdownModel[]>, action: MaritalStatusAction) {
        const state = ctx.getState();
        ctx.setState({ ...state, ...action });
    }

    /*-- stages --*/
    @Action(StagesAction)
    stages(ctx: StateContext<StageModel[]>, action: StagesAction) {
        const state = ctx.getState();
        ctx.setState({ ...state, ...action });
    }

}


