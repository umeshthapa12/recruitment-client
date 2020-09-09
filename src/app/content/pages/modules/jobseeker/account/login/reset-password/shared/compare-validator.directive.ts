import { Directive, Input } from '@angular/core';
import { Validator, AbstractControl, ValidationErrors, NG_VALIDATORS } from '@angular/forms';
import { Subscription } from 'rxjs';


@Directive({
    selector: '[match]',
    providers: [{provide: NG_VALIDATORS , useExisting: ComparePasswordDirective , multi: true}]
})

export class ComparePasswordDirective implements Validator {
    @Input('match') controlNameToCompare: string;

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
        return controlToCompare && controlToCompare.value !== c.value ? { 'match': true} : null;
    }
}
