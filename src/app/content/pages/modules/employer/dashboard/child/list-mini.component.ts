import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { fadeIn } from '../../../../../../utils';
import { JobListModel } from '../../../shared/models';
@Component({
    selector: 'list-mini',
    templateUrl: './list-mini.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [fadeIn],
    styles: [`
            .animator span{
                transition: all .2s ease-in-out;
            }
            .animator:hover span{
                /*transform: rotate(-6deg);*/
                transform:  translate(4px,0px) scale(1.1) rotate(-5deg);
                box-shadow: 0px 0px 2px 0px rgba(81, 77, 92, 0.7);
            }


            .m-widget5__item{
                transition: background .2s ease-in-out;
            }
            .m-widget5__item:nth-child(odd){
                background: #fbfbff;
            }
            .m-widget5__item:nth-child(even){
                background: #fbfeff;
            }
            .m-widget5__item:hover{
                background: #f8f8f9;
            }

            .job-action{
                transition: all .2s ease-in-out;
                visibility: hidden;
                opacity:0;
                cursor: pointer;
                background: #eaeaed;
                height: 25px;
                width: 25px;
                border-radius: 100%;
                display: inline-flex;
                flex-grow: 0;
                justify-content: center;
                line-height: 0;
                align-items: center;
                margin-left:5px;
                transform: scale(0);
                color: #333439;
            }
            .m-widget5__item:hover .job-action{
                visibility: visible;
                opacity: 1;
                transform: scale(1);
            }

            .job-action:hover{
                background: #00c5dc;
                color: #fff;
            }
    `]
})
export class ListMiniComponent implements OnInit {
    @Input() jobs: any[] = [];
    constructor() { }

    ngOnInit(): void { }

    createJobLink(job: JobListModel) {
        const str = job.jobTitle.toLocaleLowerCase().replace(/[^\w\s]|\s+/g, '-').replace(/\-{2,}/g, '-');
        return `/job/${job.id}/${str}`;
    }
}
