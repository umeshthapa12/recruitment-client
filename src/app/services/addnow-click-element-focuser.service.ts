import { AnimationBuilder, AnimationPlayer, animate, keyframes, style } from '@angular/animations';
import { ElementRef, Injectable } from '@angular/core';
import { of } from 'rxjs';
import { delay, filter, map } from 'rxjs/operators';
@Injectable({ providedIn: 'root' })
export class AddNowClickElementFocuserService {

    private player: AnimationPlayer;

    constructor(private builder: AnimationBuilder) { }

    /**
     * @param focusToElem same as formControlName ```string```
     * @param formInputElements list of ```ElementRef``` which has formControlName directive.
     */
    initFocusEmptyElement(focusToElem: string, formInputElements: ElementRef[]) {
        const option: any = { behavior: 'smooth' };

        // we wrap it to rxjs chain so we can pipe fn as much as we want
        of(focusToElem).pipe(

            // the key from the parent must be defined so we check here
            filter(_ => _ !== undefined),

            // if we have 3rd party plugin than angular, we may need different logic here
            map(_ => {
                const el = formInputElements
                    .filter(x => x.nativeElement)
                    // return an item comparing with key of the formControlName
                    .find(e => e.nativeElement.getAttribute('formControlName') === focusToElem);

                // if we come this far, we have to look for an element by key
                const elem: HTMLElement = el ? el.nativeElement : undefined;
                if (elem)
                    elem.scrollIntoView(option);
                return elem;
            }),
            delay(800)
        ).subscribe(controlEl => {
            // control element must be returned
            if (controlEl) {
                // then this is a formControlName key
                controlEl.focus();

                this.play(controlEl);
            }
        });
    }

    private play(el: HTMLElement) {
        const flexField = el.closest('.mat-form-field-flex').querySelector('.mat-form-field-outline-thick');
        if (!flexField) return;
        if (this.player) this.player.destroy();

        this.player = this.builder.build([
            animate('3s', keyframes([
                style({ 'background-color': 'transparent', offset: 0 }),
                style({ 'background-color': '#ffdb8e', offset: .2 }),
                style({ 'background-color': 'transparent', offset: .4 }),
                style({ 'background-color': '#ffdb8e', offset: .6 }),
                style({ 'background-color': 'transparent', offset: 1 })
            ]))
        ]).create(flexField);

        this.player.play();
    }
}
