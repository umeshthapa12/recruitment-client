import { SelectionModel } from '@angular/cdk/collections';
import { ChangeDetectorRef, Component, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { Select } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { AjaxResponse } from 'rxjs/ajax';
import { delay, filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Filter, QueryModel } from '../../../../../../../models';
import { ApplicantModel, AppointmentModel } from '../../../../../../../models/appointment.model';
import { fadeIn, fadeInX } from '../../../../../../../utils';
import { ChangesConfirmComponent } from '../../../../../components/shared/changes-confirm/changes-confirm.component';
import { SnackToastService } from '../../../../../components/shared/snakbar-toast/toast.service';
import { JobSeekerStageService } from '../../../../shared/js-stage.service';

interface FilterFormType {
    fullName: string;
    appliedStart: Date;
    appliedEnd: Date;
    appointmentStart: Date;
    appointmentEnd: Date;
    isEligible: boolean;
    stage: string;
    jobTitle: string;
}

@Component({
    templateUrl: './stages.component.html',
    animations: [fadeInX, fadeIn],
    styleUrls: ['../../../../shared/shared.scss'],
})
export class StagesComponent implements OnInit {

    private readonly toDestroy$ = new Subject<void>();

    isGirdView: boolean = true;
    reloadData = new EventEmitter();

    filterForm: FormGroup;
    selectionApplicant = new SelectionModel<ApplicantModel>(true, []);
    selectionAppointment = new SelectionModel<AppointmentModel>(true, []);
    @Select('dropdowns', 'stages') stage$: Observable<any[]>;
    query: QueryModel = { filters: [], sort: [] };

    jobTitles = this.aService.getJobTitles();
    isFileDownloading: boolean;
    isSelectionEmpty: boolean;

    constructor(
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder,
        private aService: JobSeekerStageService,
        private dialog: MatDialog,
        private notify: SnackToastService
    ) { }

    ngOnInit() {

        this.filterForm = this.fb.group({
            fullName: null,
            jobTitle: null,
            isEligible: null,
            stage: null,
        });

        const isGrid = localStorage.getItem('isGridView');
        if (isGrid) this.isGirdView = isGrid === 'true';
    }

    toggleViewMode() {

        this.selectionApplicant.clear();
        this.selectionAppointment.clear();

        this.isGirdView = !this.isGirdView;
        localStorage.setItem('isGridView', `${this.isGirdView}`);

    }

    filter(m: MatMenuTrigger) {

        const fl: Filter[] = [];

        const d: FilterFormType = this.filterForm.value;

        if (Object.values(d).filter(_ => _).length === 0) return;

        Object.keys(d).forEach(key => {

            const x: any = key === 'fullName' && d.fullName ? { column: 'fullName', condition: 'contains', firstValue: d.fullName }
                : key === 'isEligible' && d.isEligible ? { column: 'isEligible', condition: 'eq', firstValue: d.isEligible }
                    : key === 'stage' && d.stage ? { column: 'stage', condition: 'eq', firstValue: d.stage }
                        : key === 'jobTitle' && d.jobTitle ? { column: 'jobTitle', condition: 'eq', firstValue: d.jobTitle }
                            : null;

            if (x) fl.push(x);
        });

        this.selectionApplicant.clear();

        this.query.filters = fl;

        this.reloadData.emit(this.query);
        m.closeMenu();
    }

    exportTo(exportAs: string) {
        this.cdr.markForCheck();

        this.isSelectionEmpty = this.selectionAppointment.isEmpty();
        if (this.isSelectionEmpty) return;

        const ids = this.selectionAppointment.selected.map(_ => _.id);

        if (ids == null) throw Error('IDs not found.');

        const instance = this.dialog.open(ChangesConfirmComponent, {
            autoFocus: false,
            data: { message: ` <strong>Note:</strong> When you receive a success message, but the exported excel-sheet or pdf file isn't downloading, it is probably your popup blocker preventing to download.<br><br> we recommend you disable your popup blocker or allow it to this page for downloading files.` },
            width: '500px'
        });

        instance.afterClosed().pipe(
            filter(yes => yes),
            tap(_ => [this.cdr.markForCheck(), this.isFileDownloading = true]),
            switchMap(_ => this.aService.exportStageData([... new Set(ids)], [], exportAs)),
            delay(500), takeUntil(this.toDestroy$)
        ).subscribe({
            next: this.handleDownloadSuccess,
            error: _ => [this.cdr.markForCheck(),
            this.isFileDownloading = false,
            this.notify.when('danger', _)]
        });
    }

    private handleDownloadSuccess = (response: AjaxResponse) => {

        this.cdr.markForCheck();

        const a = document.createElement('a');

        a.href = window.URL.createObjectURL(response.response);

        const disposition = response.xhr.getResponseHeader('Content-Disposition');

        if (disposition) {
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) {
                const filename = matches[1].replace(/['"]/g, '');
                a.download = filename;
            }
        }

        document.body.appendChild(a);
        this.isFileDownloading = false;
        a.target = '_blank';
        a.click();
        this.notify.when('success', { messageBody: 'File download success.' });
        document.body.removeChild(a);
        this.selectionAppointment.clear();

    }

    clearErrors() {
        this.cdr.markForCheck();
        this.isSelectionEmpty = null;

    }

    // TODO: download files from grid section
}
