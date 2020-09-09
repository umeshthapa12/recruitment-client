import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { CoreModule } from '../../../../../core/core.module';
import { ChangesConfirmModule } from '../../../components/shared/changes-confirm/changes-confirm.module';
import { ToastSnackbarModule } from '../../../components/shared/snakbar-toast/toast.module';
import { ApplicationService } from '../application.service';
import { SharedOpeningModule } from '../openings/shared-opening.module';
import { AutoTimerComponent } from './auto-timer.component';
import { MessageFormComponent } from './message-form.component';

@NgModule({
    declarations: [
        MessageFormComponent, AutoTimerComponent
    ],
    entryComponents: [MessageFormComponent, AutoTimerComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PerfectScrollbarModule,
        ToastSnackbarModule,
        ChangesConfirmModule,
        SharedOpeningModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatSelectModule,
        MatCheckboxModule,
        MatTooltipModule,
        MatDialogModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatDatepickerModule,
        MatMomentDateModule,
        MatMenuModule,
        DragDropModule,
        CoreModule
    ],
    providers: [ApplicationService]
})
export class MessagingModule { }
