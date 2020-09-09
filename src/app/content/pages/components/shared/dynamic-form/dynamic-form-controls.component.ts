import { ChangeDetectorRef, Component, Input, OnChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ControlBase, ControlTypes } from '../../../../../models';

@Component({
    selector: 'd-form',
    templateUrl: './dynamic-form-controls.component.html',
})
export class DynamicFormControlsComponent implements OnChanges {

    // Gets data from parent component
    @Input() question: ControlBase;
    @Input() form: FormGroup;

    // view ref props
    type = ControlTypes;
    viewItem: ControlBase;

    constructor(private cdr: ChangeDetectorRef) { }

    ngOnChanges() {

        this.viewItem = this.question;
        this.cdr.detectChanges();
    }

    timeUpdate(time: any) {
        if (!time) return;

        this.cdr.markForCheck();

        let hours = time.split(':')[0];
        const minutes = time.split(':')[1];
        const suffix = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        hours = hours < 10 ? '0' + hours : hours;
        this.question.value = hours + ':' + minutes + ' ' + suffix;
    }

}
