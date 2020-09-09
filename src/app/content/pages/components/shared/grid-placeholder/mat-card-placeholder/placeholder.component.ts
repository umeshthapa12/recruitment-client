import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'm-grid-placeholder',
    templateUrl: './placeholder.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [`
    .grid-title{
        height: 14px;
        background: #eee;
        -webkit-animation: pulse 1.1s infinite ease-in-out;
        animation: pulse 1.1s infinite ease-in-out;
    }

    .content-wrapper{
        display: flex;
        flex-direction: row;
        padding: 0; width: 100%;
    }

    .input-url{
        height: 9px;
        background: #eee; margin:15px 0 10px 0;
        border-radius: 3px;
        -webkit-animation: pulse 1s infinite ease-in-out;
        animation: pulse 1s infinite ease-in-out;
    }

    .action-btn{
        height: 30px; width: 30px; border-radius: 50%; background: #eee; margin: 0 7px;
        -webkit-animation: pulse 900ms infinite ease-in-out;
        animation: pulse 900ms infinite ease-in-out;
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
export class MatCardPlaceholderComponent {

}
