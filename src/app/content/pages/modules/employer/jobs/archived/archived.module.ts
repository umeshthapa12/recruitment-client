import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
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
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ChangesConfirmModule } from '../../../../components/shared/changes-confirm/changes-confirm.module';
import { DeleteConfirmModule } from '../../../../components/shared/delete-confirm/delete-confirm.module';
import { SharedDirectivesModule } from '../../../../components/shared/directives/directives.module';
import { ToastSnackbarModule } from '../../../../components/shared/snakbar-toast/toast.module';
import { FiltersModule } from '../../../shared/filters/filters.module';
import { ExpandedOpeningModule } from '../../../shared/opening-expand/expand.module';
import { SharedOpeningModule } from '../../../shared/openings/shared-opening.module';
import { StatusUpdaterModule } from '../../../shared/status-updater/status-updater.module';
import { ArchivedComponent, RePostConfirmComponent } from './archived.component';
import { ArchivedService } from './archived.service';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([
            { path: '', component: ArchivedComponent }
        ]),
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        PerfectScrollbarModule,
        ToastSnackbarModule,
        ChangesConfirmModule,
        DeleteConfirmModule,
        SharedDirectivesModule,
        StatusUpdaterModule,
        FiltersModule,
        MatSelectModule,
        MatDialogModule,
        MatCardModule,
        MatDividerModule,
        MatInputModule,
        MatTooltipModule,
        MatIconModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatTabsModule,
        MatAutocompleteModule,
        MatChipsModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatTableModule,
        MatMenuModule,
        MatPaginatorModule,
        MatSortModule,
        MatCheckboxModule,
        MatExpansionModule,
        ExpandedOpeningModule,
        SharedOpeningModule
    ],
    declarations: [ArchivedComponent, RePostConfirmComponent],
    providers: [ArchivedService],
    entryComponents: [RePostConfirmComponent]
})

export class ArchivedModule {

}
