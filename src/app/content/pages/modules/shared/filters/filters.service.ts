import { Injectable } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';

@Injectable()
export class FilterService {

    /**
     * MatMenuTrigger array to store and close them as needed
     */
    triggers: MatMenuTrigger[] = [];

    pushMenu(m: MatMenuTrigger) {
        this.triggers.push(m);
    }

    // close all active mat-menu opened by this component.
    closeAll() {
        this.triggers.forEach(m => m.closeMenu());
    }
}
