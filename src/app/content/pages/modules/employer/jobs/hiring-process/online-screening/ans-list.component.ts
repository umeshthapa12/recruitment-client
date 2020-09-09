import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { delay, takeUntil } from 'rxjs/operators';
import { OnlineScreeningService } from './online-screening.service';
import { collectionInOut } from '../../../../../../../utils';
import { QuestionnaireAnswersModel } from '../../../../../../../models/application.model';
import { environment } from '../../../../../../../../environments/environment';
interface AnswerMeta { question: string; answer: string[]; options: string[]; }
interface CachedModel { id: number; jsGUid: string; items: AnswerMeta[]; }

@Component({
    templateUrl: './ans-list.component.html',
    animations: [collectionInOut],
    styleUrls: ['../../../../shared/custom-styles-mat-table.scss'],
})
export class AnsListComponent implements OnInit, OnDestroy {

    private readonly toDestroy$ = new Subject<void>();

    items: QuestionnaireAnswersModel[] = [];
    isLazyListLoading: boolean;
    private readonly cachedData: CachedModel[] = [];
    answerData: any[] = [];

    pdfGetterUrl: string;

    constructor(
        private cdr: ChangeDetectorRef,
        private oqService: OnlineScreeningService,
        @Inject(MAT_DIALOG_DATA)
        public data: QuestionnaireAnswersModel[],
        private dialogRef: MatDialogRef<AnsListComponent>
    ) {
        const jsGuid = data && data.length > 0 ? data[0].jobSeekerGuid : '';
        this.pdfGetterUrl = `${environment.baseUrl}/Employer/api/v2.0/Application/DownloadScreeningAsPdf/${jsGuid}`;
    }

    ngOnInit() {
        this.items = this.data;
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    xpanChange(isExpanded: boolean, id: number, jsGuid: string) {

        if (!isExpanded) return;

        this.cdr.markForCheck();

        const index = this.cachedData.findIndex(_ => _.id === id && _.jsGUid === jsGuid);
        if (index > -1) {
            this.answerData = this.cachedData[index].items;
            return;
        }

        this.isLazyListLoading = true;

        this.oqService.getQuestionnaireAnsData(id, jsGuid).pipe(
            takeUntil(this.toDestroy$), delay(400)
        ).subscribe({
            next: res => {
                this.cdr.markForCheck();
                const data = res.contentBody;
                this.cachedData.push({ id: id, jsGUid: jsGuid, items: data });
                this.answerData = data;
                this.isLazyListLoading = false;
                this.dialogRef.disableClose = true;
            },
            error: _ => [this.cdr.markForCheck(), this.isLazyListLoading = false]
        });

    }
}
