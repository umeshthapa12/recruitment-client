import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
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
import { CoreModule } from '../../../../../../../core/core.module';
import { MessagingModule } from '../../../../shared/messaging/messaging.module';
import { ApplicantsComponent } from './applicants.component';
import { AppointmentComponent } from './appointment.component';
import { AttendeesComponent } from './attendees.component';
import { AppointmentState } from './store/appointments.store';

@NgModule({
    declarations: [
        AppointmentComponent,
        ApplicantsComponent,
        AttendeesComponent
    ],
    imports: [
        CommonModule,
        PerfectScrollbarModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild([
            { path: '', component: AppointmentComponent }
        ]),
        NgxsModule.forFeature([
            AppointmentState
        ]),
        MatProgressSpinnerModule,
        MatPaginatorModule,
        MatTooltipModule,
        MatCardModule,
        MatCheckboxModule,
        MatMenuModule,
        MatDialogModule,
        MatProgressBarModule,
        ScrollingModule,
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatMomentDateModule,
        CoreModule,
        MessagingModule,
        DragDropModule,
        MatDividerModule,
        MatSortModule,
        MatSelectModule,
    ],
    entryComponents: [ApplicantsComponent, AttendeesComponent],
    providers: [],
})
export class AppointmentModule { }
