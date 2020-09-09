import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { DeleteConfirmModule } from '../../../../components/shared/delete-confirm/delete-confirm.module';
import { SharedDirectivesModule } from '../../../../components/shared/directives/directives.module';
import { ToastSnackbarModule } from '../../../../components/shared/snakbar-toast/toast.module';
import { FiltersModule } from '../../../shared/filters/filters.module';
import { MessagingModule } from '../../../shared/messaging/messaging.module';
import { StatusUpdaterModule } from '../../../shared/status-updater/status-updater.module';
import { ApplicationComponent } from './application.component';

@NgModule({
    declarations: [
        ApplicationComponent,
    ],
    imports: [
        CommonModule,
        RouterModule.forChild([
            { path: '', component: ApplicationComponent }
        ]),
        PerfectScrollbarModule,
        ToastSnackbarModule,
        DeleteConfirmModule,
        SharedDirectivesModule,
        StatusUpdaterModule,
        FiltersModule,
        MessagingModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatCheckboxModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatMenuModule,
        MatTooltipModule,
        MatDialogModule,
    ],
    providers: [],
})
export class ApplicationModule { }
