import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { debounceTime, delay, filter, switchMap, takeUntil } from 'rxjs/operators';
import { ResponseModel } from '../../../../../../models';
import { ExtendedMatDialog } from '../../../../../../utils';
import { SnackToastService } from '../../../../components/shared/snakbar-toast/toast.service';
import { JobPrefModel, JobSearchStatus } from '../../../shared/models';
import { PreferenceFormComponent } from './child/preference-form.component';
import { PreferenceService } from './preference.service';

@Component({
    selector: 'app-preference',
    templateUrl: './preference.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [`
        .search-status-wrapper{
            transition: transform .4s ease-in-out, all .3s cubic-bezier(.89,.59,.25,.98);
            min-height:200px;
            max-height:200px;
            display: flex;
            justify-content: space-arround;
            flex-direction: column;
            padding: 20px 10px;
            position:relative;
            border-radius: 5px;
            border: 1px solid #edf3ff;
        }
        .icon-placeholder{
            position: absolute;
            left: -5px;
            top: -4px;
            height: 25px;
            width: 25px;
            opacity: 0;
            background: #36a3f7 !important;
            transition: all .3s cubic-bezier(.89,.59,.25,.98);
            transform: scale(.5);
        }
        .search-status-box{

            background: #fafbfd;
            cursor:pointer;
        }
        .search-status-box:hover{
            background:#f4f8ff;
            transform: scale(1.02);
            border-color: #c6dbff;
        }

        .icon-checked{
            opacity: 1;
            transform: scale(1);
        }

        .search-status-box-selected{
            box-shadow:inset 0 0 0 4px #36a3f7, 0 4px 5px -2px rgba(0, 0, 0, 0.2);
            transform: scale(1.02);
            border:none;
        }
        .job-pref__custom-badge{
            border-radius: 4px;
            padding: 0 5px;
            background: #FFF;
            border: 1px solid #e3e4f5;
            font-weight: 400;
            font-size: 11px;
            letter-spacing: 0.2px;
        }
    `]
})

export class PreferenceComponent implements OnInit, OnDestroy, AfterViewInit {

    private toDestroy$ = new Subject<void>();

    private readonly statusUpdator = new Subject<string>();

    // trun on/off loading bar/placeholder when http request being made
    isLoading: boolean;
    jobPref: JobPrefModel;
    searchStatus = JobSearchStatus;

    constructor(
        private pService: PreferenceService,
        private dialog: MatDialog,
        private cdr: ChangeDetectorRef,
        private snackBar: SnackToastService,
        private dialogUtil: ExtendedMatDialog
    ) {
    }

    ngOnInit() {

        this.isLoading = true;

        this.pService.getJobPref()
            .pipe(takeUntil(this.toDestroy$), delay(1000))
            .subscribe(res => this.initJobPref(res.contentBody),
                e => this.onError(e));
    }

    ngAfterViewInit() {

        this.statusUpdator.pipe(
            debounceTime(1500),
            takeUntil(this.toDestroy$),
            switchMap(s => this.pService.updateJobSearchStatus(s)),
            takeUntil(this.toDestroy$)
        ).subscribe(res => this.onSuccess(res), e => this.onError(e));
    }

    private initJobPref(d: JobPrefModel) {
        this.cdr.markForCheck();
        this.resetFlags();
        this.jobPref = d;
    }

    onSearchStatusSelected(status: JobSearchStatus) {

        this.jobPref.jobSearchStatus = status;

        // TODO: update status on API
        this.statusUpdator.next(status);

    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    onEdit(focusTo: string) {
        const data = { focusToElem: focusTo, content: this.jobPref };
        let instance: MatDialogRef<PreferenceFormComponent, ResponseModel>;

        instance = this.dialog.open(PreferenceFormComponent, {
            width: '850px',
            data: data,
            autoFocus: false,
        });
        instance.afterClosed().pipe(
            takeUntil(this.toDestroy$),
            filter(res => res && res.contentBody)
        ).subscribe(res => {

            this.initJobPref(res.contentBody);
            this.onSuccess(res);

        });

        this.dialogUtil.animateBackdropClick(instance);
    }

    private onSuccess(res: ResponseModel) {


        // init snackbar
        this.snackBar.when('success', res, () => this.resetFlags());

    }

    private resetFlags() {
        this.cdr.markForCheck();
        this.isLoading = false;
    }

    private onError(ex: any) {

        this.snackBar.when('danger', ex, () => this.resetFlags());

    }
}
