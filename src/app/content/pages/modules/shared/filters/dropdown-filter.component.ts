import { Component, EventEmitter, HostBinding, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { Select } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { DropdownModel, Filter } from '../../../../../models';
import { fadeIn } from '../../../../../utils';
import { FilterService } from './filters.service';


@Component({
    selector: 'header-dropdown-filter',
    templateUrl: './dropdown-filter.component.html',
    styleUrls: ['./filter.component.scss'],
    animations: [fadeIn]
})
export class HeaderDropdownFilterComponent implements OnInit, OnDestroy {
    private readonly toDestroy$ = new Subject<void>();
    @HostBinding('class') class = 'w-100';

    /**
     * Table Header Cell Label
     */
    @Input() headerLabel: string;

    /**
     * sort label unique name
     */
    @Input() sortLabel: string;

    /**
     * Whether to show keyword selection
     */
    @Input() displayKeyword: boolean = true;

    /**
     * Whether the at-menu should add backdrop
     */
    @Input() hasMenuBackdrop: boolean = false;

    /**
     * Emits an event when filter submits
     */
    @Output() filterSubmitted = new EventEmitter<Filter>();

    filterForm: FormGroup;

    @ViewChild('ms', { static: true }) menuTrigger: MatMenuTrigger;

    // name of the slice -> state.action
    @Select('filter', 'filterConditions')
    // returned model
    conditions$: Observable<DropdownModel[]>;

    constructor(
        private fb: FormBuilder,
        private flService: FilterService
    ) { }

    ngOnInit() {
        this.filterForm = this.fb.group({
            condition: 'contains',
            keyword: 'AND',
            firstValue: [null, Validators.required],
            secondValue: null
        });

        this.flService.pushMenu(this.menuTrigger);
    }

    // when multiple mat-menu opens, close previously opened.
    // only needed if we disable the backdrop
    toggleFilter() {

        this.flService.closeAll();
        setTimeout(_ => this.menuTrigger.openMenu(), 100);

    }

    // filter submission
    submitFilter() {
        this.filterSubmitted.emit(this.filterForm.value);
        setTimeout(_ => this.flService.closeAll(), 400);
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }
}
