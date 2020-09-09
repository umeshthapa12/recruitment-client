import { AfterViewInit, ChangeDetectorRef, Directive, ElementRef } from '@angular/core';

@Directive({
    selector: '[fallback-img-src]',
})
export class FallbackImgSrcDirective implements AfterViewInit {

    constructor(
        private el: ElementRef,
        private cdr: ChangeDetectorRef
    ) { }

    ngAfterViewInit() {

        const img: HTMLImageElement = this.el.nativeElement;

        // img.onload = (e) => {
        //     console.log(e)
        // }
        img.onerror = () => {
            this.cdr.markForCheck();
            img.title = 'This is a fallback avatar.';
            // fallback source
            img.src = 'https://api.adorable.io/avatars/face/eyes7/nose10/mouth9/7e7acc/200';
        };
    }
}
