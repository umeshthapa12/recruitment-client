import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { DropdownModel } from '../../../../../models';
import { RowContentStatus } from '../../../../../utils';

@Component({
    selector: 'status-updater',
    templateUrl: './status-updater.component.html',
    styles: [`
        mat-option{
            height: 2rem !important;
        }
        .status-wrap{
            display: flex; flex-direction: row;  flex-wrap: wrap
        }
    `]
})
export class StatusUpdaterComponent {

    @HostBinding('class') private class = 'w-100';

    @Select('dropdowns', 'status') status$: Observable<DropdownModel[]>;

    constructor(
        // private cdr: ChangeDetectorRef,
        private rowStatus: RowContentStatus, ) { }

    /**Currently selected status text */
    @Input() currentStatus: string;

    /**Whether the status updater is display only mode  */
    @Input() isReadonly: boolean;

    /** Emits an event with updated status value */
    @Output() statusChanged = new EventEmitter<string>();

    selectionChange(s: MatSelectChange) {
        this.statusChanged.emit(s.value);
    }

    // preps css class based on status text (all static)
    contentStatus = (s: string) => this.rowStatus.initContentStatusCssClass(s);

}
