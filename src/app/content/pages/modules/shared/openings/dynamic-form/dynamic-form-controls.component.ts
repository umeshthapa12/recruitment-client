import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, HostBinding, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { of, Subject } from 'rxjs';
import { delay, filter, takeUntil } from 'rxjs/operators';
import { ControlActionTypes, ControlBase, ControlTypes } from '../../../../../../models/dynamic-form/control-base';
import { fadeIn } from '../../../../../../utils';

@Component({
    selector: 'd-form',
    templateUrl: './dynamic-form-controls.component.html',
    animations: [fadeIn],
    styles: [`
    .btn{
        height: 25px;
        width: 25px;
    }
    `]
})
export class DynamicFormControlsComponent implements AfterViewInit, OnDestroy, OnChanges {

    @HostBinding('class') hClass = 'btn-block';
    private readonly toDestroy$ = new Subject<void>();

    // Gets data from parent component
    @Input() question: ControlBase;
    @Input() form: FormGroup;

    // Emits data for parent component
    @Output() controlAction = new EventEmitter<ControlActionTypes>();

    // view ref props
    type = ControlTypes;
    viewItem: ControlBase;

    constructor(private cdr: ChangeDetectorRef) { }

    ngOnChanges() {

        this.viewItem = this.question;
        this.cdr.detectChanges();
    }

    trackByFn = (_: any, index: number) => index;

    ngAfterViewInit() {

        // scroll to the added item
        of(document.getElementById(this.question.key)).pipe(
            filter(el => el ? true : false),
            takeUntil(this.toDestroy$),
            delay(200)
        ).subscribe({ next: el => el.focus() });

    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    actionInvoked(a: string, key: string) {
        switch (a) {
            case 'copy':
                this.controlAction.emit({ copied: true, key: key });
                break;
            case 'remove':
                this.controlAction.emit({ removed: true, key: key });
                break;
            case 'selected':
                this.controlAction.emit({ selected: true, key: key });
                break;
        }
    }
}
