/**
 * Extended snackbar model
 */
export interface SnackbarModel {
    // message uid for the internal use
    uid?: string;

    /**
     * Title of the snackbar e.g. **success**, **failure**, **error** etc.,
     */
    title: string;

    /** Duration in ms to display alert */
    duration?: number;

    /**
     * Custom or dynamic message to display so the end user can understand further instruction
     */
    message: string;
    /**
     * alert type css class see`AlertTypeClass`
     */
    typeClass?: AlertTypeClass;
    /**
    * alert type see`AlertType`
    */
    type?: AlertType;
    /**
    * extend snackbar panel by adding more css class e.g.`['rule1', 'rule2']`
    */
    panelClass?: string[];
}

/**
 * Allert types `success | info | warn | danger`
 */
export enum AlertType {
    success = 'S',
    Info = 'I',
    Warn = 'W',
    Danger = 'D'
}

export interface AlertTypeProps {
    success: 'S';
    info: 'I';
    warn: 'W';
    danger: 'D';
}

/**
 * Allert type css class `alert-success | alert-info | alert-warning | alert-danger`
 */
export enum AlertTypeClass {
    success = 'alert-success',
    Info = 'alert-info',
    Warn = 'alert-warning',
    Danger = 'alert-danger'
}
