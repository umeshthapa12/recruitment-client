import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import moment from 'moment';
import { merge, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CustomAnimationPlayer } from '../../../../../utils';

@Component({
    templateUrl: './auto-timer.component.html',
})
export class AutoTimerComponent implements AfterViewInit, OnDestroy {

    private readonly toDestroy$ = new Subject<void>();

    readonly min = new Date();

    dControl = new FormControl();
    tControl = new FormControl();

    invalidTimer: boolean;

    private get combined() {
        return moment(moment(this.dControl.value).format('YYYY-MM-DDT') + this.tControl.value);
    }

    constructor(
        private cdr: ChangeDetectorRef,
        private matRef: MatDialogRef<AutoTimerComponent>,
        private cap: CustomAnimationPlayer) { }

    ngAfterViewInit() {

        merge(...[this.dControl.valueChanges, this.tControl.valueChanges])
            .pipe(takeUntil(this.toDestroy$)).subscribe({
                next: _ => [
                    this.cdr.markForCheck(),
                    this.invalidTimer = this.isPastDate()
                ]
            });

    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    /**
     * Scheduled date must be the future
     */
    private isPastDate = () => this.dControl.touched &&
        this.dControl.dirty &&
        this.tControl.touched &&
        this.tControl.dirty && (!this.combined.isValid() || this.combined.toDate() <= new Date())

    /**
     * This method is get accessed from parent component for the API payload.
     */
    getTimerDate = () => this.combined.format('MM-DD-YYYY hh:mm:ss');

    onSet() {
        this.cdr.markForCheck();
        this.dControl.updateValueAndValidity();
        this.tControl.updateValueAndValidity();

        if (!(this.dControl.value && this.tControl.value) || this.isPastDate()) {
            this.invalidTimer = true;
            setTimeout(_ => this.cap.animate('shake', document.querySelector('#err')), 100);
            return false;
        } else
            this.matRef.close(true);
    }

}
