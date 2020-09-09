import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'content-list-placeholder',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './placeholder.component.html',
    styles: [`
            .text-input__loading {
                height: 100px;
                width: 100%;
                }
                .text-input__loading--line {
                height: 10px;
                margin: 10px;
                -webkit-animation: pulse 1s infinite ease-in-out;
                        animation: pulse 1s infinite ease-in-out;
            }
            #box{
                display:block;
                height:70px;
                width: 80px;
                margin-top:10px;
                -webkit-animation: pulse 1s infinite ease-in-out;
                animation: pulse 1s infinite ease-in-out;
            }

            #lines div:nth-child(1) {
                width: 50%;
            }

            #lines div:nth-child(2) {
                width: 70%;
            }
            #lines div:nth-child(3) {
                width: 95%;
            }
            #lines div:nth-child(4) {
                width: 85%;
            }

            @-webkit-keyframes pulse {
                0% {
                    background-color: rgba(165, 165, 165, 0.1);
                }
                50% {
                    background-color: rgba(165, 165, 165, 0.3);
                }
                100% {
                    background-color: rgba(165, 165, 165, 0.1);
                }
            }

            @keyframes pulse {
                0% {
                    background-color: rgba(165, 165, 165, 0.1);
                }
                50% {
                    background-color: rgba(165, 165, 165, 0.3);
                }
                100% {
                    background-color: rgba(165, 165, 165, 0.1);
                }
            }
`]
})
export class ContentListPlaceholderComponent implements OnChanges {

    // main body wrapper
    @Input() wrapperHeight = 100;

    // height of div for line
    @Input() lineHeight = 10;

    // square box thumbnail height
    @Input() thumbnailHeight = 70;

    // square box thumbnail width
    @Input() thumbnailWidth = 80;

    // no of creating lines
    @Input() lineCount = 4;

    @Input() linesOnly = false;

    // an array for ngfor directive
    lineNumbers: number[];
    constructor() {
        this.lineNumbers = Array.from(Array(this.lineCount).keys());
    }

    ngOnChanges() {
        this.lineNumbers = Array.from(Array(this.lineCount).keys());
    }

}
