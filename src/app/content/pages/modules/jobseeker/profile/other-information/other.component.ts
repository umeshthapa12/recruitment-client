import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';


@Component({
    selector: 'app-other',
    templateUrl: './other.component.html',
    styles: [`
        .row-hover {
            padding:10px 5px;
            transition:background .2s ease-in-out, border-radius .6s ease-in-out, box-shadow .5s ease-in-out;
            align-items: center;
        }
        .row-hover:hover {
            background:#f9fbff;
            border-radius: 50px;
            box-shadow: 0px 5px 4px 0px rgba(81,77,92,0.07)
        }

        .row-hover h5{
            margin:0
        }
    `]
})

export class OtherComponent implements OnDestroy {
    color = 'accent';
    locations = false;
    checkedTwo = false;
    checkedFour = false;

    private toDestroy$ = new Subject<void>();

    constructor() {

    }

    onLocationChange(e: HTMLInputElement) {
        this.locations = e.checked;
    }

    twoWheeler(event: HTMLInputElement) {
        this.checkedTwo = event.checked;

    }

    public fourWheeler(event: HTMLInputElement) {
        this.checkedFour = event.checked;
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

}
