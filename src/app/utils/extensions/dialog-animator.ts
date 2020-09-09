import { animate, AnimationBuilder, AnimationPlayer, keyframes, style } from '@angular/animations';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { Injectable } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatDialogRef } from '@angular/material/dialog';
import { debounceTime, filter, map } from 'rxjs/operators';

@Injectable()
export class ExtendedMatDialog {

    private player: AnimationPlayer;

    constructor(private animationBuilder: AnimationBuilder) { }

    /**
     * play animation when dialog backdrop clicks.
     * @param instance And instance of dialog
     */
    animateBackdropClick<T extends MatDialogRef<any> | MatBottomSheetRef<any>>(instance: T) {
        // mat-bottom-sheet-container
        instance.backdropClick().pipe(
            debounceTime(400),
            map(_ => instance instanceof MatDialogRef ? document.getElementById(instance.id) : document.getElementsByClassName('mat-bottom-sheet-container')[0]),
            filter(_ => _ !== undefined),
        ).subscribe(el => this.animate(el as HTMLElement));
        return this;
    }

    /**
     * Enable/disable opacity to dialog container when drag move.
     * @param drag An instance of CdkDrag to process.
     */
    makeTransparentWhenDragMove(drag: CdkDrag, ) {

        setTimeout(() => {
            const dialogWrapper = document.querySelectorAll('.cdk-overlay-pane');

            if (!dialogWrapper) return;

            dialogWrapper.forEach((el: HTMLElement) => {
                el.style.transition = 'opacity .4s';
                const matBottomSheet = el && el.getElementsByTagName('mat-bottom-sheet-container')[0] as HTMLElement;
                drag.started.subscribe(_ => {
                    if (matBottomSheet) {
                        matBottomSheet.style.transition = `
                        border-radius .4s cubic-bezier(.98,.26,.8,.51),
                        opacity .2s ease-in
                        `;
                    }
                    if (matBottomSheet) {

                        matBottomSheet.style.opacity = '0.35';
                        matBottomSheet.style.borderRadius = '5%';

                    } else {
                        el.style.opacity = '0.35';
                    }
                });
                drag.ended.subscribe(_ => {
                    if (matBottomSheet) {
                        matBottomSheet.style.opacity = '1';
                        matBottomSheet.style.borderRadius = '0';
                    } else {
                        el.style.opacity = '1';
                    }
                });
            });


        }, 0);
        return this;
    }

    private animate(el: HTMLElement) {
        if (!el) return;
        if (this.player) this.player.destroy();
        this.player = this.animationBuilder
            .build([
                animate('.7s', keyframes([
                    style({ transform: 'rotate3d(0, 0, 1, 17deg)', offset: 0.20 }),
                    style({ transform: 'rotate3d(0, 0, 1, -12deg)', offset: 0.40 }),
                    style({ transform: 'rotate3d(0, 0, 1, 6deg)', offset: 0.60 }),
                    style({ transform: 'rotate3d(0, 0, 1, -6deg)', offset: 0.80 }),
                    style({ transform: 'rotate3d(0, 0, 1, 0deg)', offset: 1 }),
                ]))
            ])
            .create(el);

        this.player.play();
    }
}
