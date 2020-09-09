import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    Output
} from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { OpeningModel } from '../../../../../models';
import { collectionInOut } from '../../../../../utils';
import { copyToClipboard } from '../../../../../utils/generators/custom-utility';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'job-list',
    templateUrl: './list.component.html',
    animations: [collectionInOut],
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [`
        .font-dark {
            color: #575962 !important
        }

        .icon-animator .action-icon {
            transition: all .2s ease-in-out;
        }

        .icon-animator .action-icon:hover {
            transform: translate(0px, -4px) scale(1.07);
        }

        @media (min-width: 1025px) {
            .adjust-mobile-position {
                bottom: 3px;
                position: absolute;
            }
        }

        .m-widget4__item {
            transition: box-shadow .4s cubic-bezier(.5, 0, .3, 1),
            transform .2s ease-in-out,
            background .2s cubic-bezier(.4, 0, .2, 1);
            border-top: 1px dotted #f5f5f8;
            border-bottom: 1px dashed #f2f2f9;
            padding: 0;
            position: relative;
        }

        .m-widget4__item:hover {
            box-shadow: 0 6px 6px -3px rgba(0, 0, 0, .2), 0 10px 14px 1px rgba(0, 0, 0, .14), 0 4px 18px 3px rgba(0, 0, 0, .12)
        }

        .m-widget4__item:before {
            content: " ";
            position: absolute;
            width: 100%;
            height: 3px;
            bottom: -1px;
            z-index: 2;
            background: -webkit-linear-gradient(34deg, rgb(120, 214, 249) 0%, rgb(58, 115, 253) 100%);
            background: linear-gradient(34deg, rgb(120, 214, 249) 0%, rgb(58, 115, 253) 100%);
            visibility: hidden;
            -webkit-transform: scaleX(0.04);
            transform: scaleX(0.04);
            -webkit-transition: all 0.3s cubic-bezier(0.5, 0.25, 0, 1);
            transition: all 0.3s cubic-bezier(0.5, 0.25, 0, 1);
        }

        .m-widget4__item:hover:before {
            visibility: visible;
            -webkit-transform: scaleX(1);
            transform: scaleX(1);
        }

        .custom-background {
            background: #f4f5f8e8;
            background: linear-gradient(135deg, #f4f5f8e8 30%, #ffffff 100%);
            border: none;

        }

        .custom-background-reverse {
            background: #ededed;
            background: linear-gradient(135deg, #ffffff 30%, #eeeeee8c 100%);
        }

        .custom-box-shadow-group {
            box-shadow: 1px 1px 3px 1px rgba(113, 106, 202, 0.17) !important;
        }

        #skills .m-badge:hover {
            cursor: pointer;
            color: #2095e5;
        }
	`]
})
export class JobListComponent implements OnDestroy {

    private toDestroy$ = new Subject<void>();

    @Input() jobLists: OpeningModel[] = [];

    @Output() listActionEvent = new EventEmitter<{ action: string, opening: OpeningModel }>();

    get windowWidth() {
        return (window.outerWidth || document.body.clientWidth);
    }

    @Select('listingJobs', 'likedJobIds')
    jsLikedId$: Observable<number[]>;
    @Select('listingJobs', 'favJobIds')
    jsFavJobId$: Observable<number[]>;

    constructor(
        private cdr: ChangeDetectorRef,
        private snack: MatSnackBar
    ) {
    }

    createJobLink(job: OpeningModel) {
        let str = job.jobTitle.toLocaleLowerCase().replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '-').replace(/\-{2,}/g, '-');
        if (str.lastIndexOf('-') > -1)
            str = str.substring(0, str.lastIndexOf('-'));
        return `/job/${job.id}/${str}`;
    }

    createCompanyLink(job: OpeningModel) {
        let str = job.toString().toLocaleLowerCase().replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '-').replace(/\-{2,}/g, '-');
        if (str.lastIndexOf('-') > -1)
            str = str.substring(0, str.lastIndexOf('-'));
        return `/company/${job.employerId}/${str}`;
    }

    onAction(action: string, o: OpeningModel) {
        if (!o) return;
        if (action === 'share') {
            const base = (window.location.hostname || document.location.hostname) + (window.location.port ? ':' + window.location.port : '');
            copyToClipboard(base + this.createJobLink(o));
            this.snack.open('Link copied to clipboard.', 'Close', { panelClass: ['bg-info'], duration: 10000 });
            return;
        }

        this.cdr.markForCheck();
        this.listActionEvent.emit({ action: action, opening: o });
    }


    hasValue(prev: number[], currentId: number) {
        return prev && prev.indexOf(currentId) > -1;
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }
}
