import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ControlBase } from '../../../../../../models/dynamic-form/control-base';

@Injectable()
export class ControlService {

    toFormGroup(questions: ControlBase[]) {
        const group: any = {};

        questions.forEach(question => {
            group[question.key] = question.required
                ? new FormControl(question.value || '', Validators.required)
                : new FormControl(question.value || '');
        });
        return new FormGroup(group);
    }
}
