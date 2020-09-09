import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime, filter, map, startWith } from 'rxjs/operators';
import { DropdownModel } from '../../../../../../../models';
import { RandomUnique } from '../../../../../../../utils';

@Component({
    selector: 'chip-list-auto',
    templateUrl: './auto-chicp.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('fadeInRight', [
            transition('* => *', [ // each time the binding value changes
                query(':leave', [
                    stagger('200ms reverse', [
                        animate('0.2s', style({ opacity: 0, transform: 'translate(-15px, 5px)' })),
                    ]),

                ], { optional: true }),
                query(':enter', [
                    style({ opacity: 0, transform: 'translate(-15px, 5px)' }),
                    stagger('100ms', [
                        animate('0.3s',
                            style({ opacity: 1, transform: 'translate(0, 0)' })
                        ),
                    ]),
                ], { optional: true })
            ])
        ])
    ],
    styles: [`
        mat-form-field{
            width: 100%;
        }
        .custom-mat-chip{
            border-radius: 3px;
            padding: 1px 2px 1px 5px !important;
            line-height: 0.3;
            font-size: 11px;
            min-height: 20px;
            overflow: hidden;
            position: relative;
            background: #e8ebf3;
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
export class AutoChipComponent implements OnChanges, AfterViewInit {

    // chiplist error message if the field is mark as required
    get errorState() {
        return this.controlName && this.controlName.dirty && this.controlName.touched && this.controlName.invalid;
    }

    constructor(private cdr: ChangeDetectorRef) {

        // per component ngChanges stream to debounce.
        this.stream.pipe(
            debounceTime(100)
        ).subscribe(_ => this.PatchChips());

    }

    separatorKeysCodes: number[] = [ENTER, COMMA];
    chipInputCtrl = new FormControl();

    filteredChips: string[] = [];
    selectedChip: SelectedChips[] = [];

    /**
     * Label of a form field
     * @requires label
     */
    @Input() label: string;

    /**
     * Chiplist for the autocomplete control when user start typing
     * @optional DropdownModel[]
     */
    @Input() masterChips: DropdownModel[] = [];

    /**
     * Input placeholder
     * @optional placeholder
     */
    @Input() inputPlaceolder: string;

    /**
     * Form control of the formGroup. Values are being updated when chiplist gets changed.
     * @requires formControlName
     */
    @Input() controlName: FormControl;

    /**
     * Make input field required
     * @optional required
     */
    @Input() required: boolean = false;

    /**
     * Whether the user should not allowed to add custom chips than master only
     * @optional masterOnly
     */
    @Input() masterOnly: boolean;

    @ViewChild('input')
    private tokenInput: ElementRef<HTMLInputElement>;

    @ViewChild('auto')
    private matAutocomplete: MatAutocomplete;

    @ViewChild(MatAutocompleteTrigger)
    private matAutoTrigger: MatAutocompleteTrigger;

    // local use only, Making debounce for the same input changes.
    // We must be careful to use such method if we have infinite changes
    private stream = new Subject<FormControl>();

    ngOnChanges() {
        // be careful with debounce time here. You might never get values due to stream being debounced
        this.stream.next(this.controlName);
    }

    // Patch display text based on control value as an array of number
    private PatchChips() {

        if (this.controlName && this.controlName.value) {
            const val = this.controlName.value;
            // value must be an array of keys/numbers
            if (Array.isArray(val)) {
                this.cdr.markForCheck();
                // if the array contains number only, this mean it should be populated from master
                if (!val.some(isNaN) && this.masterChips.length > 0) {
                    // set chip text
                    this.selectedChip = this.masterChips.filter(_ => val.includes(_.key)).map(_ => {
                        // since we need local unique ID to reduce performance impat caused by NgFor, use trackBy Fn
                        return { id: new RandomUnique().uid(), value: _.value };
                    });
                    // if there is master chip to be filtered, initial load being filtered when patching chips
                    this.filteredChips = this._filter(null);
                } else {
                    // array of string, populate directly
                    this.selectedChip = val.map(value => {
                        // since we need local unique ID to reduce performance impat caused by NgFor, use trackBy Fn
                        return { id: new RandomUnique().uid(), value: value };
                    });
                }
            }
        }
    }

    ngAfterViewInit() {
        this.openAutocompleteOnInputFocus();
    }

    // E.G. https://netbasal.com/angular-2-improve-performance-with-trackby-cc147b5104e5
    trackbyFn = (_: number, item: SelectedChips) => item.id; //

    private openAutocompleteOnInputFocus() {
        if (!this.tokenInput) return;

        fromEvent(this.tokenInput.nativeElement, 'focus').pipe(
            debounceTime(150),
            filter(_ => this.matAutoTrigger && !this.matAutocomplete.isOpen)
        ).subscribe(_ => {
            // keep display the autocomplete panel to sellect more options
            this.matAutoTrigger.openPanel();
        });

        this.chipInputCtrl.valueChanges.pipe(
            debounceTime(300),
            startWith(null),
            map(value => this._filter(value))
        ).subscribe(filtered => this.filteredChips = filtered);
    }

    add(event: MatChipInputEvent): void {

        // Add chip only when MatAutocomplete is not open
        // To make sure this does not conflict with OptionSelected Event
        if (!this.matAutocomplete.isOpen) {

            const input = event.input;
            const value = (event.value || '').trim();

            const index = this.selectedChip.findIndex(v => v.value.toLowerCase() === value.toLowerCase());

            // either master has value so check it an add in or dedupe and add it
            if (!(index > -1) && value.length > 0) {

                const isMaster = this.masterChips.length > 0
                    && this.masterChips.findIndex(_ => _.value.toLowerCase() === value.toLowerCase()) > -1;
                if (this.masterOnly) {
                    if (isMaster)
                        this.selectedChip.push({ id: new RandomUnique().uid(), value: value.trim() });
                } else {
                    this.selectedChip.push({ id: new RandomUnique().uid(), value: value.trim() });
                }
            }

            // Reset the input value
            if (input) {
                input.value = '';
            }

            // value added without autocomplete
            this.updateConrolValue();

            this.chipInputCtrl.setValue(null);
        }
    }

    remove(chip: SelectedChips): void {
        const index = this.selectedChip.indexOf(chip);

        if (index >= 0) {
            this.selectedChip.splice(index, 1);

            // we only interested with ID
            this.updateConrolValue();
        }

        this.filteredChips = this._filter(null);
    }

    selected(event: MatAutocompleteSelectedEvent): void {

        this.selectedChip.push({ id: new RandomUnique().uid(), value: event.option.viewValue });
        this.tokenInput.nativeElement.value = '';
        this.chipInputCtrl.setValue(null);

        // we only interested with ID
        this.updateConrolValue();

        this.filteredChips = this._filter(null);
    }

    private updateConrolValue() {

        const ids = this.masterChips.filter(m => this.selectedChip.findIndex(_ => _.value === m.value) > -1).map(_ => _.key);
        const selected = this.selectedChip.map(_ => _.value);
        this.controlName.setValue(ids.length > 0 && this.masterOnly ? ids : selected);
        this.controlName.markAsDirty();
        this.controlName.markAsTouched();

        this.controlName.updateValueAndValidity();
    }

    private _filter(value: string): string[] {

        // filter must have master value
        if (this.masterChips.length <= 0) return undefined;

        const sliced = this.masterChips.slice().map(newObj => ({ ...newObj }));
        let items: string[];

        if (!value) {
            // Returns entire list excluding already selected
            items = sliced
                .filter(_ => !(this.selectedChip.findIndex(y => y.value === _.value) > -1))
                .map(_ => _.value);
        } else {
            const filterValue = value.toLowerCase();

            // returns filtered list by input char index excluding already selected
            items = sliced
                .map(_ => _.value)
                .filter(
                    // char index must be greater than or eq to 0
                    v => v.toLowerCase().indexOf(filterValue) >= 0 &&
                        // index must be -1
                        !(this.selectedChip.findIndex(y => y.value === v) > -1)
                );
        }

        return items;
    }

}

interface SelectedChips {

    /**
     * A unique ID for internal use only to use ngFor trackByFn
     */
    id?: string;

    /**
     * Actual value set in from control
     */
    value?: string;
}
