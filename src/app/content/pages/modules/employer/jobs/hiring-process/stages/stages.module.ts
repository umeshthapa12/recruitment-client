import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { NgxsModule } from '@ngxs/store';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ChangesConfirmModule } from '../../../../../components/shared/changes-confirm/changes-confirm.module';
import { DeleteConfirmModule } from '../../../../../components/shared/delete-confirm/delete-confirm.module';
import { ToastSnackbarModule } from '../../../../../components/shared/snakbar-toast/toast.module';
import { FiltersModule } from '../../../../shared/filters/filters.module';
import { ApplicantsComponent } from './child/applicants.component';
import { ByJobSeekerComponent } from './child/by-job-seekers.component';
import { ByOpeningComponent } from './child/by-opening.component';
import { MessageBodyComponent } from './child/message-body-view.component';
import { StageChangeFormComponent } from './child/stage-change-form.component';
import { StageHistoryComponent } from './child/stage-history.component';
import { StagesComponent } from './stages.component';

@NgModule({
    declarations: [
        StagesComponent,
        ByOpeningComponent,
        ByJobSeekerComponent,
        ApplicantsComponent,
        StageChangeFormComponent,
        StageHistoryComponent,
        MessageBodyComponent
    ],
    entryComponents: [ApplicantsComponent, StageChangeFormComponent, StageHistoryComponent, MessageBodyComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild([
            { path: '', component: StagesComponent }
        ]),
        NgxsModule.forFeature([
            //  AppointmentState
        ]),
        ToastSnackbarModule,
        ChangesConfirmModule,
        DeleteConfirmModule,
        PerfectScrollbarModule,
        FiltersModule,
        MatProgressSpinnerModule,
        MatPaginatorModule,
        MatTooltipModule,
        MatCardModule,
        MatCheckboxModule,
        MatMenuModule,
        MatDialogModule,
        MatProgressBarModule,
        MatTableModule,
        DragDropModule,
        MatDividerModule,
        MatSortModule,
        MatSelectModule,
        MatDatepickerModule,
        MatMomentDateModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatRippleModule,
        MatExpansionModule,
    ],
    exports: [],
    providers: [],
})
export class StagesModule { }
