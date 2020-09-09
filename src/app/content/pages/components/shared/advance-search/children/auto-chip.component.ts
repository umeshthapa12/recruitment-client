import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime, filter, map, startWith, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'chip-list-auto',
    templateUrl: './auto-chip.component.html',
    styles: [`
        .custom-mat-chip{
            border-radius: 0;
            padding: 1px 2px 1px 5px !important;
            line-height: 0.3;
            font-size: 11px;min-height:
            20px; background: #eaeaea
        }
        .mat-option {
            display: block;
            padding: 0 16px;
            text-align: left;
            text-decoration: none;
            max-width: 100%;
            position: relative;
            cursor: pointer;
            outline: 0;
            display: flex;
            flex-direction: row;
            height:auto;
            max-width: 100%;
            box-sizing: border-box;
            align-items: center;
            -webkit-tap-highlight-color: transparent;
            line-height: normal;
            padding-top:7px;
            padding-bottom:7px;
            white-space: normal;
            font-size:12px;
        }
    `]
})
export class ChipListAutoComponent implements OnDestroy, AfterViewInit, OnInit {

    private readonly toDestroy$ = new Subject<void>();

    separatorKeysCodes: number[] = [ENTER, COMMA];
    chipInputCtrl = new FormControl();

    filteredChips: string[] = [];

    selectedChip: string[] = [];

    @Input() masterChips: [{ key: number, value: string }] = [null];
    @Input() inputPlaceholder;
    @Input() filterFormGroup: FormGroup;
    @Input() controlName;
    @Input() clearSelected: EventEmitter<boolean>;

    @ViewChild('input', { static: true }) tokenInput: ElementRef<HTMLInputElement>;
    @ViewChild('auto', { static: true }) matAutocomplete: MatAutocomplete;
    @ViewChild(MatAutocompleteTrigger, { static: true }) matAutoTrigger: MatAutocompleteTrigger;

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    constructor(private cdr: ChangeDetectorRef) { }

    ngOnInit() {
        this.filteredChips = this._filter(null);
        this.clearSelected.pipe(takeUntil(this.toDestroy$), debounceTime(200)).subscribe({
            next: isClear => [this.cdr.markForCheck(), isClear ?
                [this.selectedChip = [],
                this.filteredChips = this._filter(null)] : null]
        });
    }

    ngAfterViewInit() {
        fromEvent(this.tokenInput.nativeElement, 'focus').pipe(
            debounceTime(150),
            filter(_ => this.matAutoTrigger && !this.matAutocomplete.isOpen)
        ).subscribe({
            next: _ => // keep display the autocomplete panel to select more options
                this.matAutoTrigger.openPanel()
        });

        this.chipInputCtrl.valueChanges.pipe(
            debounceTime(100),
            map((value: string | '') => this._filter(value))
        ).subscribe({ next: f => this.filteredChips = f });

    }

    add(event: MatChipInputEvent): void {
        // Add chip only when MatAutocomplete is not open
        // To make sure this does not conflict with OptionSelected Event
        if (!this.matAutocomplete.isOpen) {

            const input = event.input;
            const value = (event.value || '').trim();
            const index = this.masterChips.findIndex(_ => _.value === value);

            // Add our fruit
            if (value && index > -1) {
                this.selectedChip.push(value);
            }

            // Reset the input value
            if (input) {
                input.value = '';
            }

            this.chipInputCtrl.setValue(null);
        }
    }

    remove(chip: string): void {
        const index = this.selectedChip.indexOf(chip);

        if (index > -1) {
            this.selectedChip.splice(index, 1);
        }

        this.filteredChips = this._filter(null);
        this.updateFormControlValue();
    }

    selected(event: MatAutocompleteSelectedEvent): void {
        this.selectedChip.push(event.option.viewValue);
        this.tokenInput.nativeElement.value = '';
        this.chipInputCtrl.setValue(null);
        this.updateFormControlValue();
        this.filteredChips = this._filter(null);
    }

    private updateFormControlValue() {
        const ids = this.masterChips.filter(m => this.selectedChip.includes(m.value)).map(_ => _.key);
        this.filterFormGroup.get(this.controlName).setValue(ids);
    }

    private _filter(value: string): any[] {
        this.cdr.markForCheck();
        if (!value) {
            return this.masterChips.slice().filter(_ => !this.selectedChip.includes(_.value)).map(_ => _.value);
        }
        const filterValue = value.toLowerCase();

        return this.masterChips
            .slice()
            .map(_ => _.value)
            .filter(_ => _.toLowerCase().indexOf(filterValue) === 0 && !this.selectedChip.includes(_));
    }

}
