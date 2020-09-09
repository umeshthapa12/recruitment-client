import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef } from '@angular/material/snack-bar';
import { ResponseModel } from '../../../../../models/app.model';
import { RandomUnique } from '../../../../../utils';
import { AlertType, AlertTypeClass, AlertTypeProps, SnackbarModel } from './extended-snackbar.model';
import { SnackToastComponent } from './toast.component';

@Injectable()
export class SnackToastService {
    // toast model
    private model: SnackbarModel[] = [];
    // toast component ref
    private snack: MatSnackBarRef<SnackToastComponent>;

    constructor(private sb: MatSnackBar, private util: RandomUnique) { }

    /**
     * init snack bar and create stacked items with alert type. A custom extended snackbar.
     * @param data
     */
    private initSnakbar(data: SnackbarModel, options?: MatSnackBarConfig) {

        setTimeout(() => {

            const duration = ( options && options.duration || 15000);

            // internal config if user input isn't available or passed
            data.uid = this.util.uid();
            data.duration = duration;

            // reuse to track snackbar instance close until the length is 0;
            this.model.push({ ...data });

            const config: MatSnackBarConfig = {
                horizontalPosition: 'right',
                verticalPosition: 'top',
                duration: 999999,
                panelClass: ['px-0', 'pt-0', 'pb-0', 'custom-snackbar', 'mat-elevation-z5']
            };

            // opening multiple snackbar instance is not possible, so we open it once and stacking alert boxes in it.
            if (!this.snack)
                this.snack = this.sb.openFromComponent(SnackToastComponent, { ...config, ...options });

            // cleanup
            this.snack.afterDismissed().subscribe(_ => {
                this.model = [];
                this.snack = null;
            });

            // after assigning unique id for each alert, display to the UI
            this.snack.instance.items.next(this.model);

        }, 100);
    }

    /**
     * Initialize a toast based on snackbar. Custom extended mat-snackbar toast
     * @param res ResponseModel object contains user friendly information
     * @param status Toast status
     * @param fn Fn to invoke along with toast. Example: ```()=> fn```
     * @param options mat snackbar options
     */
    when<A extends keyof AlertTypeProps, T extends ResponseModel>(status: A, res: T, fn?: Function, options?: MatSnackBarConfig) {

        const title = status === 'danger' ? (<any>res).status + ' ' + ((<any>res).statusText as any || 'Error') : status;

        const type = status === 'success' ? AlertType.success
            : status === 'danger' ? AlertType.Danger
                : status === 'warn' ? AlertType.Warn
                    : AlertType.Info;

        const cssClass = status === 'success' ? AlertTypeClass.success :
            status === 'danger' ? AlertTypeClass.Danger :
                status === 'warn' ? AlertTypeClass.Warn : AlertTypeClass.Info;

        const message = (res.messageBody || res.error && res.error.messageBody || `Something went wrong.`);

        const c: SnackbarModel = {
            title: title,
            type: type,
            typeClass: cssClass,
            message: message
        };

        this.initSnakbar(c, options);

        // we may have some fn to invoke
        if (fn !== undefined && typeof (fn) === 'function')
            fn();

    }
}

