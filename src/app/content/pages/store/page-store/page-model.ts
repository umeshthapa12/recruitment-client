import { ValidationTypes } from '../../../../models';
import { SingleJobTopMetadata } from '../../../../models/job-title-metadata';
import { ContentRef } from './display-type.enum';

/**
 * App state model
 */
export interface JobsContentModel {

    // whether display a loading indicator if any
    displayLoading?: boolean;

    // text content
    content?: string;

    // complex content
    contentModel?: SingleJobTopMetadata;

    // content reference enum, such as list, single, grid etc.,
    contentRef: ContentRef;
}

// apply section model
export interface ApplyClickedOptions {

    // whether display a loading indicator if any
    displayLoading?: boolean;

    // whether to insert the element on dom
    render?: boolean;

    // returns true on user clicks
    actionClicked?: boolean;

    // user's selected action
    selectedAction?: JobActions;

    // currently active validation
    currentValidationFlag?: ValidationTypes;
}

// user actions to select
export enum JobActions {

    // apply now button for the anywhere in the app
    ApplyNow = 'apply-now',

    // save as favorite button for the anywhere in the app
    Save = 'save-job',

    // unsave from favorite button for the anywhere in the app
    Unsave = 'unsave-job',

    // share to the 3rd party buttons for the anywhere in the app
    ShareViaEmail = 'share-via-email',
    ShareViaTwitter = 'share-via-twitter',
    ShareViaFacebook = 'share-via-twitter',
    ReportProblem = 'report-a-problem',
    DownloadPdf = 'download-pdf',
}
