import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, Renderer2 } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime, filter, map, takeUntil, tap } from 'rxjs/operators';

@Directive({
    selector: '[list-sticky-header]',
})
export class ListStickyHeaderDirective implements AfterViewInit, OnDestroy {

    private toDestroy$ = new Subject<void>();

    @Input() showHideOnScroll: boolean = false;

    constructor(
        private elem: ElementRef,
        private renderer: Renderer2
    ) { }

    ngAfterViewInit() {

        this.initDefaultElementStyles(this.elem.nativeElement);

        this.addRemoveBoxShadowToStickyHeader(this.elem.nativeElement);

    }

    private initDefaultElementStyles(el: HTMLElement) {
        if (el) {
            el.classList.add('sticky-header');
        }
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
        this.elem = null;
    }

    private addRemoveBoxShadowToStickyHeader(el: HTMLElement) {

        if (this.showHideOnScroll) {
            this.renderer.addClass(el, 'sticky-header-hide');
        }

        fromEvent(window, 'scroll').pipe(
            map(_ => el.getBoundingClientRect().top),
            debounceTime(100),
            tap(offset => {

                if (offset <= 60) {
                    if (this.showHideOnScroll) {
                        this.renderer.removeClass(el, 'sticky-header-hide');
                        this.renderer.addClass(el, 'sticky-header-show');
                    }
                    this.renderer.removeClass(el, 'sticky-header-shadow-inactive');
                    this.renderer.addClass(el, 'sticky-header-shadow-active');
                }
            }),
            filter(offset => offset > 61),
            debounceTime(70), takeUntil(this.toDestroy$))
            .subscribe(_ => {
                this.renderer.removeClass(el, 'sticky-header-shadow-active');
                this.renderer.addClass(el, 'sticky-header-shadow-inactive');

                if (this.showHideOnScroll) {
                    this.renderer.removeClass(el, 'sticky-header-show');
                    this.renderer.addClass(el, 'sticky-header-hide');
                }
            });
    }
}
