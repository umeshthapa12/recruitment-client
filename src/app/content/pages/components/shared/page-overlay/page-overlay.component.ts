import { BlockScrollStrategy, Overlay, OverlayRef, ViewportRuler } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { AfterViewInit, Component, Input, OnDestroy, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { StateReset } from 'ngxs-reset-plugin';
import { merge, Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';
import { PageOverlayState } from '../../../../../store/app-store';

@Component({
    selector: 'j-page-overlay',
    templateUrl: './page-overlay.component.html',
    styleUrls: ['./page-overlay-styles.scss'],
})
export class PageOverlayComponent implements AfterViewInit, OnDestroy {

    private toDestroy$ = new Subject<void>();

    // ref of the ng-template
    @ViewChild(TemplateRef, { static: true }) _templateRef: TemplateRef<any>;

    // ref of the overlay
    private _overlayRef: OverlayRef;

    // portal to attach overlay
    private _portal: TemplatePortal;

    // get slices from the page overlay state
    @Select('pageOverlay', 'attach') onActivated$: Observable<any>;
    @Select('pageOverlay', 'detach') onDeactivated$: Observable<any>;

    @Input() hasBackdrop: boolean = true;

    constructor(
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef,
        private _viewportRuler: ViewportRuler,
        private store: Store) {

    }

    ngAfterViewInit() {

        // block page scrolling
        const scrollStrategy = new BlockScrollStrategy(this._viewportRuler, document);
        this._portal = new TemplatePortal(this._templateRef, this._viewContainerRef);

        this._overlayRef = this._overlay.create({
            positionStrategy: this._overlay.position().global().centerHorizontally().centerVertically(),
            hasBackdrop: this.hasBackdrop,
            scrollStrategy: scrollStrategy
        });

        const obs = [this.onActivated$, this.onDeactivated$];

        merge(...obs).pipe(

            tap(isActive => {
                if (isActive && !this._overlayRef.hasAttached()) this._overlayRef.attach(this._portal);
            }),
            debounceTime(1000),
            takeUntil(this.toDestroy$),
        ).subscribe({ next: _ => [!_ ? this._overlayRef.detach() : [], this.store.dispatch(new StateReset(PageOverlayState))] });

        // this.onActivated$.pipe(
        //     tap(_ => console.log(_)),
        //     // filter(_ => _),
        //     // debounceTime(100),

        //     tap(_ => _ ? this._overlayRef.attach(this._portal) : this._overlayRef.detach()),
        //     takeUntil(this.toDestroy$),
        // ).subscribe(_ => []
        //     // [this.store.dispatch(new StateReset(PageOverlayState))]
        // );

        // this.onDeactivated$.pipe(
        //     debounceTime(100),
        //     tap(_ => this._overlayRef.hasAttached() ? this._overlayRef.detach() : []),
        //     takeUntil(this.toDestroy$),
        // ).subscribe(_ => []);
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
        this._overlayRef.dispose();
    }

}
