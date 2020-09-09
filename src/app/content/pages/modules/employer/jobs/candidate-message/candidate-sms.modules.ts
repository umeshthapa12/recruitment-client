import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
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
import { CandidateSmsComponent } from './candidate-sms.component';
import { CandidateSmsService } from './candidate-sms.service';

@NgModule({
    declarations: [CandidateSmsComponent],
    imports: [
        CommonModule,
        RouterModule.forChild([
            { path: '', component: CandidateSmsComponent }
        ]),
        ToastSnackbarModule,
        ChangesConfirmModule,
        DeleteConfirmModule,
        FiltersModule,
        PerfectScrollbarModule,
        MatExpansionModule,
        MatPaginatorModule,
        MatSortModule,
        MatTableModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        MatDialogModule
    ],
    exports: [],
    entryComponents: [],
    providers: [CandidateSmsService]
})

export class CandidateSmsModule {

}
