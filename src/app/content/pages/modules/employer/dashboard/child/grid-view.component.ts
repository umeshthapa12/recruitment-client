import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { fadeIn } from '../../../../../../utils';
import { JobListModel } from '../../../shared/models';

@Component({
    selector: 'grid-view',
    templateUrl: './grid-view.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [fadeIn],
    styles: [`
        .opening-detail-row{
          transition:  background .3s ease-in-out;
        }
        .opening-detail-row:hover{
            background: #FFFFFF;
        }
        .opening-detail-row-footer{
            background: #f7f7f7;
        }
        .desc-block{
            display:inline-block;
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

        @media(max-width: 1024px){
            .m-widget24__item:hover .job-action{
                visibility: visible;
                opacity: 1;
                transform: scale(1);
            }

            .job-action:hover{
                background: #00c5dc;
                color: #fff;
            }
        }

        .m-widget24{
         transition: background .2s ease-in-out;
         box-shadow: 0 1px 4px -1px #d1d9e0;
        }
        .m-widget24:hover{
            background:#f9fbff;
        }
    `]
})
export class GridViewComponent implements OnInit {
    @Input() jobs: JobListModel[];
    constructor() { }

    ngOnInit(): void { }

    // this might be open XSS
    removeHtml(str: string) {
        if (!str || !str.length) return '';

        const strr = str.replace(/<script.*?>.*?<\/script>/igm, '');

        const tmp = document.createElement('DIV');
        tmp.innerHTML = strr;

        return tmp.textContent || tmp.innerText || '';
    }

    createJobLink(job: JobListModel) {
		const str = job.jobTitle.toLocaleLowerCase().replace(/[^\w\s]|\s+/g, '-').replace(/\-{2,}/g, '-');
		return `/job/${job.id}/${str}`;
	}
}
