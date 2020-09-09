import { Component, EventEmitter, Input, Output, OnChanges, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { SnackbarModel, AlertType } from './extended-snackbar.model';

@Component({
    selector: 'snack-toast-alert',
    templateUrl: './alert.component.html',
    styles: [`
    .custom-alert{
        transition: transform .2s ease-in-out;
        display:block;
        margin-bottom:0;
    }
    .custom-alert:focus, .custom-alert:active, .custom-alert:hover{
        transform: translate(0, -2px) scale(1.02) !important;
    }

    #dismiss{
        transition: transform .2s ease-in-out, box-shadow .3s ease-in-out;
        padding:1px;
        border-radius: 50%;
    }
    #dismiss:hover{
        transform: scale(1.01) translate(0,-2px);
        box-shadow: 0 0 5px 0 rgba(100,100,100,0.6);
    }

    .alert-icon{
        font-size: 30px;

        text-align: top;
        margin-bottom:5px;
        margin-right: 7px;
    }

    .alert-icon-wrapper{
        display: flex; align-items: center; justify-content: center;
    }
    .alert-message{
        display: flex; align-items: center; margin-top: 5px
    }

    .alert-header{
        display: flex; align-items: center; justify-content: space-between;
    }

    .custom-alert{
        min-height: 48px; padding: 10px 15px;
    }

    `]
})
export class AlertComponent implements OnChanges {


    @Input() item: SnackbarModel;

    @Output() timeout = new EventEmitter();

    private timer: any;

    // type of the alerts `S,I,W,D`
    type = AlertType;

    constructor(private cdr: ChangeDetectorRef) { }

    ngOnChanges() {
        if (this.item && this.item.duration > 0) {
            this.cdr.markForCheck();
            // alert box has duration
            this.item.duration = (this.item.duration || 5500);
            this.alertDuration(this.item.duration, this.item.uid, null);
        }
    }

    close(id: string) {

        this.timeout.emit(id);
    }

    alertDuration(d: number, id: string, el: HTMLElement) {

        if (el)
            d <= 0 ? el.style.opacity = '1' : el.style.opacity = '0.8';

        if (!(d > 0 || id && id.length > 0)) {
            clearTimeout(this.timer);
        } else {
            this.timer = setTimeout(() => this.close(id), d);
        }
    }
}
