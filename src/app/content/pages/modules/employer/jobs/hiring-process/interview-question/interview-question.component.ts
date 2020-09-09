import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { merge, of, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ApplicationComponent } from './application.component';
import { fadeIn, fadeInX } from '../../../../../../../utils';
import { QueryModel } from '../../../../../../../models';
import { InterViewQuestionModel } from '../../../../../../../models/interview-question.model';

@Component({
    templateUrl: './interview-question.component.html',
    animations: [fadeIn, fadeInX],
    styleUrls: ['../../../../shared/shared.scss']
})

export class InterviewQuestionComponent implements AfterViewInit, OnDestroy {
    private readonly toDestroy$ = new Subject<void>();

    constructor(
        private cdr: ChangeDetectorRef,

        private dialog: MatDialog,

    ) { }

    query: QueryModel = { filters: [] };
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    isLoadingResults = false;
    items: any[] = [
        {
            id: 1,
            jobTitle: 'Sales Executive',
            interviewAttendees: 10,
            questionsCount: 3,
            applicantsCount: 5

        },
    ];
    selection = new SelectionModel<InterViewQuestionModel>(true, []);

    ngAfterViewInit() {

        this.query.paginator = {
            pageIndex: ++this.paginator.pageIndex,
            pageSize: this.paginator.pageSize
        };

        this.initData();
        this.initEvents();
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    toggleSelection(item: InterViewQuestionModel) {
        this.cdr.markForCheck();
        this.selection.toggle(item);
    }

    onAction(openingId: number, title: string) {
        this.dialog.open(ApplicationComponent);
    }

    private initData() {
        this.cdr.markForCheck();
        // TODO: load data from api
    }

    private initEvents() {
        const obs = [
            this.sort ? this.sort.sortChange : of(),
            this.paginator.page
        ];
        merge(...obs).pipe(debounceTime(200), takeUntil(this.toDestroy$)).subscribe({
            next: event => {
                this.selection.clear();

                if ((<Sort>event).active) {
                    this.query.paginator = { pageIndex: 1, pageSize: this.paginator.pageSize };
                    this.query.sort = [{ column: this.sort.active, direction: this.sort.direction }];
                } else {
                    this.query.paginator = { pageIndex: this.paginator.pageIndex + 1, pageSize: this.paginator.pageSize };
                }

                this.initData();
            }
        });
    }

    resetFilters() {
        this.cdr.markForCheck();
        if (this.sort) {
            this.sort.active = null;
            this.sort.direction = null;
        }
        this.query = {};
    }

}
