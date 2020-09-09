import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
    template: `
    <h2 mat-dialog-title>Schedule Confirm!</h2>
    <mat-dialog-content>
        <mat-form-field appearance="outline" class="mb-3">
            <mat-label>Schedule Publish Date</mat-label>
            <input [formControl]="dControl" (focus)="shDate.open()" (click)="shDate.open()" #x [matDatepicker]="shDate" matInput placeholder="Auto publish date?">
            <mat-datepicker #shDate></mat-datepicker>
            <mat-hint *ngIf="x?.value">Automatically publish on: <b>{{x.value | date}}</b></mat-hint>
        </mat-form-field>
        <mat-form-field appearance="outline">
            <mat-label>Expiry Date</mat-label>
            <input [formControl]="expiryDControl" (focus)="exDate.open()" (click)="exDate.open()" [matDatepicker]="exDate" matInput placeholder="Valid until?">
            <mat-datepicker #exDate></mat-datepicker>
        </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions class="mt-3 pb-4" align="center">
        <button [mat-dialog-close]="true" type="button" class="btn btn-outline-accent btn-sm m-btn m-btn--icon mx-1">
            <span>
                <i class="flaticon-stopwatch"></i>
                <span>Schedule Post</span>
            </span>
        </button>
        <button mat-dialog-close type="button" class="btn btn-outline-warning btn-sm m-btn m-btn--icon mx-1">
            <span>
                <i class="la la-close"></i>
                <span>Cancel</span>
            </span>
        </button>
    </mat-dialog-actions>
    `,
})
export class SchedulePostConfirmComponent {
    // access and set value to parent prop from this prop
    dControl = new FormControl();
    expiryDControl = new FormControl();
}
