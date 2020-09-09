import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { GoToComponent } from './go.component';
import { ContactPersonService } from './shared/contact.service';
import { AccountVerifyComponent } from './verify.component';

@NgModule({
    declarations: [AccountVerifyComponent, GoToComponent],
    entryComponents: [GoToComponent],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild([
            { path: '', component: AccountVerifyComponent }
        ]),
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        MatInputModule,
        MatFormFieldModule,
        DragDropModule

    ],
    providers: [ContactPersonService]
})

export class AccountVerifyModule { }
