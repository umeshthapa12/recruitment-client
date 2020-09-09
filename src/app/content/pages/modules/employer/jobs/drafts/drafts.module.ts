import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ChangesConfirmModule } from '../../../../components/shared/changes-confirm/changes-confirm.module';
import { DeleteConfirmModule } from '../../../../components/shared/delete-confirm/delete-confirm.module';
import { ToastSnackbarModule } from '../../../../components/shared/snakbar-toast/toast.module';
import { FiltersModule } from '../../../shared/filters/filters.module';
import { ExpandedOpeningModule } from '../../../shared/opening-expand/expand.module';
import { SharedOpeningModule } from '../../../shared/openings/shared-opening.module';
import { DraftService } from './draft.service';
import { DraftsComponent } from './drafts.component';

@NgModule({
    declarations: [DraftsComponent],
    imports: [
        CommonModule,
        RouterModule.forChild([
            { path: '', component: DraftsComponent }
        ]),
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        PerfectScrollbarModule,
        ToastSnackbarModule,
        ChangesConfirmModule,
        DeleteConfirmModule,
        SharedOpeningModule,
        FiltersModule,
        MatDialogModule,
        MatDividerModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatMenuModule,
        MatPaginatorModule,
        MatSortModule,
        MatCheckboxModule,
        MatTableModule,
        ExpandedOpeningModule,
        SharedOpeningModule
    ],
    providers: [DraftService],
})
export class DraftsModule { }
