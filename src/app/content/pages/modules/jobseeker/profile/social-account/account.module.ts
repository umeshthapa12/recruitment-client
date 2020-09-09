import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { ChangesConfirmModule } from '../../../../components/shared/changes-confirm/changes-confirm.module';
import { DeleteConfirmModule } from '../../../../components/shared/delete-confirm/delete-confirm.module';
import { SharedDirectivesModule } from '../../../../components/shared/directives/directives.module';
import { MatCardPlaceholderModule } from '../../../../components/shared/grid-placeholder/mat-card-placeholder/placeholder.module';
import { AccountComponent } from './account.component';
import { AccountService } from './account.service';
import { AccountFormComponent } from './child/account-form.component';

@NgModule({
    declarations: [
        AccountComponent,
        AccountFormComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatDialogModule,
        MatTableModule,
        RouterModule.forChild([
            { path: '', component: AccountComponent }
        ]),
        MatTooltipModule,
        MatCardModule,
        ChangesConfirmModule,
        DeleteConfirmModule,
        MatDividerModule,
        SharedDirectivesModule,
        MatCardPlaceholderModule
    ],
    exports: [

    ],
    providers: [
        AccountService,
    ],
    entryComponents: [
        AccountFormComponent
    ]
})

export class AccountModule {

}
