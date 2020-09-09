import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
    selector: 'aside-right-cover',
    templateUrl: './aside-right-cover.component.html',
    styleUrls: ['./page-cover.component.scss']
})
export class AsideRightCoverComponent implements OnDestroy {
    private toDestroy$ = new Subject<void>();
    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

}
