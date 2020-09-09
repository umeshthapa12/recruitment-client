import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { NgxsModule } from '@ngxs/store';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ChangesConfirmModule } from '../../../../components/shared/changes-confirm/changes-confirm.module';
import { DeleteConfirmModule } from '../../../../components/shared/delete-confirm/delete-confirm.module';
import { ToastSnackbarModule } from '../../../../components/shared/snakbar-toast/toast.module';
import { FiltersModule } from '../../../shared/filters/filters.module';
import { ExpandedOpeningModule } from '../../../shared/opening-expand/expand.module';
import { SharedOpeningModule } from '../../../shared/openings/shared-opening.module';
import { StatusUpdaterModule } from '../../../shared/status-updater/status-updater.module';
import { JobListComponent } from './job-list.component';
import { JobSelectionComponent } from './job-selection.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            { path: '', component: JobListComponent, }
        ]),
        NgxsModule.forFeature([

        ]),
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PerfectScrollbarModule,
        ToastSnackbarModule,
        ChangesConfirmModule,
        DeleteConfirmModule,
        SharedOpeningModule,
        StatusUpdaterModule,
        FiltersModule,
        MatDialogModule,
        MatCardModule,
        MatDividerModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatTableModule,
        MatMenuModule,
        MatPaginatorModule,
        MatSortModule,
        MatExpansionModule,
        MatCheckboxModule,
        ExpandedOpeningModule,
        SharedOpeningModule,
        MatTabsModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
    ],
    declarations: [
        JobListComponent,
        JobSelectionComponent
    ],
    providers: [],
    entryComponents: [],
})
export class JobsModule { }
