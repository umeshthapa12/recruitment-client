import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { FiltersModule } from '../../../../shared/filters/filters.module';
import { AnsListComponent } from './ans-list.component';
import { OnlineScreeningComponent } from './online-screening.component';
import { OnlineScreeningService } from './online-screening.service';
@NgModule({
    declarations: [OnlineScreeningComponent, AnsListComponent],
    entryComponents: [AnsListComponent],
    imports: [
        CommonModule,
        RouterModule.forChild([
            { path: '', component: OnlineScreeningComponent }
        ]),
        PerfectScrollbarModule,
        FiltersModule,
        MatCardModule,
        MatPaginatorModule,
        MatSortModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatBadgeModule,
        MatTooltipModule,
        MatDividerModule,
        MatDialogModule,
        MatExpansionModule,
        MatDialogModule

    ],
    providers: [OnlineScreeningService],
})
export class OnlineScreeningModule { }
