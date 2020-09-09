import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { ChangesConfirmModule } from '../../../../components/shared/changes-confirm/changes-confirm.module';
import { DeleteConfirmModule } from '../../../../components/shared/delete-confirm/delete-confirm.module';
import { SharedDirectivesModule } from '../../../../components/shared/directives/directives.module';
import { MatCardPlaceholderModule } from '../../../../components/shared/grid-placeholder/mat-card-placeholder/placeholder.module';
import { AccountFormComponent } from './account-form.component';
import { AccountComponent } from './account.component';
import { AccountService } from './account.service';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatDialogModule,
        MatInputModule,
        MatDividerModule,
        MatCardPlaceholderModule,
        SharedDirectivesModule,
        MatTooltipModule,
        RouterModule.forChild([
            { path: '', component: AccountComponent }
        ]),
        ChangesConfirmModule,
        DeleteConfirmModule],
    declarations: [AccountComponent, AccountFormComponent],
    entryComponents: [AccountFormComponent],
    providers: [

        AccountService
    ]
})

export class SocialAccountModule {

}
