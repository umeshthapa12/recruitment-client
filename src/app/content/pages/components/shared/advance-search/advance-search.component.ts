import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, delay, switchMap, takeUntil, tap } from 'rxjs/operators';
import { collectionInOut } from '../../../../../utils';
import { DropdownProviderService } from '../services/dropdown-provider.service';

@Component({
    selector: 'advance-search',
    templateUrl: './advance-search.component.html',
    animations: [collectionInOut],
    styles: [`
        .adjust-row-margin-for-mat-panel{
            margin: 0px -37px;
        }
    `]
})
export class AdvanceSearchComponent implements OnInit, OnDestroy, AfterViewInit {
    private toDestroy$ = new Subject<void>();

    // this is the master with label and form control name to match formGroup control
    // you must change the control name here if you change on formGroup
    // the data property will be filled when the API content is retrieved
    private elementItems: any = [
        {
            label: 'Categories',
            formControlName: 'categories',
            data: []
        },
        {
            label: 'Industries',
            formControlName: 'industries',
            // TODO: data of this prop is still unknown.
            data: [
                { key: 1, value: 'Banks' },
                { key: 2, value: 'Event Management' },
                { key: 3, value: 'Engineering Firms' },
                { key: 4, value: 'Audit Firms' },
                { key: 5, value: 'Others' },
            ]
        },
        {
            label: 'Experience Level',
            formControlName: 'experienceLevel',
            data: []
        },
        {
            label: 'Education',
            formControlName: 'education',
            data: []
        },
        {
            label: 'Job type',
            formControlName: 'jobType',
            data: []
        },
        {
            label: 'Location',
            formControlName: 'location',
            data: []
        },
    ];

    // clear the formGroup along with UI reset
    @Input() clearInputs: EventEmitter<boolean>;

    // sends data to parent as an $event
    @Output() advanceFormChanged = new EventEmitter();

    // main formGroup to retrieve data from child
    filterForm: FormGroup;

    // Prepared items of the array for the child
    items: any[] = [];

    constructor(
        private cdr: ChangeDetectorRef,
        private dropdown: DropdownProviderService,
        private fb: FormBuilder
    ) {
        // prepare the form group with control. Please note that
        this.filterForm = this.fb.group({
            categories: null,
            industries: null,
            experienceLevel: null,
            education: null,
            jobType: null,
            location: null,
        });
    }


    ngOnInit() {

        this.dropdown.getJobCategories().pipe(
            tap(res => {
                this.cdr.markForCheck();
                const index = this.elementItems.findIndex(_ => _.formControlName === 'categories');
                this.elementItems[index].data = res;
            }),
            switchMap(_ => this.dropdown.getJobTypes()),
            tap(res => {
                this.cdr.markForCheck();
                const index = this.elementItems.findIndex(_ => _.formControlName === 'jobType');
                this.elementItems[index].data = res;

            }),
            switchMap(_ => this.dropdown.getExperienceLevel()),
            tap(res => {
                this.cdr.markForCheck();
                const index = this.elementItems.findIndex(_ => _.formControlName === 'experienceLevel');
                this.elementItems[index].data = res.map(_ => ({ ..._, key: _.value }));

            }),
            switchMap(_ => this.dropdown.getQualifications()),
            tap(res => {
                this.cdr.markForCheck();
                const index = this.elementItems.findIndex(_ => _.formControlName === 'education');
                this.elementItems[index].data = res;

            }),
            switchMap(_ => this.dropdown.getAllJobLocations()),
            tap(res => {
                this.cdr.markForCheck();
                const index = this.elementItems.findIndex(_ => _.formControlName === 'location');
                this.elementItems[index].data = res;

            }),
            delay(100),
            tap(_ => [this.items = this.elementItems.slice()]),
            takeUntil(this.toDestroy$)
        ).subscribe({ next: _ => this.cdr.detectChanges() });
    }

    ngAfterViewInit() {

        this.filterForm.valueChanges.pipe(
            debounceTime(500),
            takeUntil(this.toDestroy$)
        ).subscribe({ next: _ => this.advanceFormChanged.emit(this.filterForm.value) });

        this.clearInputs.pipe(takeUntil(this.toDestroy$), debounceTime(200)).subscribe({
            next: isClear => [this.cdr.markForCheck(), isClear ? this.filterForm.reset() : null]
        });
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

}
