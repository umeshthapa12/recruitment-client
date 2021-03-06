import { Directive, Input } from '@angular/core';
import { Validator, AbstractControl, ValidationErrors, NG_VALIDATORS } from '@angular/forms';
import { Subscription } from 'rxjs';


@Directive({
    selector: '[compare]',
    providers: [{provide: NG_VALIDATORS , useExisting: CompareValidatorsDirective , multi: true}]
})

export class CompareValidatorsDirective implements Validator {
    @Input('compare') controlNameToCompare: string;

    validate(c: AbstractControl): ValidationErrors | null {
        if (c.value === null || c.value.length === 0) {
            return null ;
        }
        const controlToCompare = c.root.get(this.controlNameToCompare);
        if (controlToCompare) {
            const subscription: Subscription = controlToCompare.valueChanges.subscribe(() => {
                c.updateValueAndValidity();
                subscription.unsubscribe();
            });
        }
        console.log(controlToCompare.value !== c.value);
        return controlToCompare && controlToCompare.value !== c.value ? { 'compare': true} : null;
    }
}
