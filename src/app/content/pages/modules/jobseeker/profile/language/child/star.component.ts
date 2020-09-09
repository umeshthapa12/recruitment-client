import { animate, animateChild, query, stagger, style, transition, trigger } from '@angular/animations';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import { StarModel } from '../language.model';
import { fadeInX } from '../../../../../../../utils';

@Component({
    selector: 'lang-stars',
    templateUrl: './star.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        fadeInX
    ],
    styles: [`
        i.la{
            text-shadow: 0px 1px 1px #bdbdbd;
            transition: transform .2s ease, color .1s ease-in;
        }
        .lang-star{
            cursor: pointer;
        }
        .lang-star:hover{
            transform: scale(1.3) translate(0, -2px);
            color: #ffb822 !important;
        }

       i.la:active{
            transform: scale(1.4) translate(0, 1px)
        }
    `]
})
export class LangStarsComponent implements OnInit, OnChanges {

    @Output() starSelected = new EventEmitter(true);
    @Input() stars: StarModel[];
    @Input() selectedLang: number;

    coppiedStars: StarModel[] = [];

    private selectedStar: StarModel;

    constructor(private cdr: ChangeDetectorRef) { }

    ngOnChanges() {

        setTimeout(() => {
            // Since parent comonent change detection is onPush, we have to call this method.
            this.cdr.markForCheck();

            if (this.stars)
                this.coppiedStars = this.stars.map(el => ({ ...el }));

        }, 100);
    }

    ngOnInit() {
        // console.log(this.inputControl);
    }

    starFocus(p: { key: number }) {
        this.coppiedStars.forEach(s => {
            if ((p && p.key || this.selectedStar && this.selectedStar.key) >= s.key)
                s.isFocused = true;
            else
                s.isFocused = false;
        });
    }

    clickedStar(selected: StarModel) {

        // reuse selected object
        this.selectedStar = selected;

        this.coppiedStars.forEach(s => {
            if (selected && selected.key >= s.key)
                s.isSelected = true;
            else
                s.isSelected = false;
        });

        this.starSelected.emit(selected);
    }

    trackByStars = (index, item: StarModel) => item.key;


}
