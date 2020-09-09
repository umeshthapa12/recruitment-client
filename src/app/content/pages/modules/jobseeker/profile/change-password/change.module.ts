import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { SharedDirectivesModule } from '../../../../components/shared/directives/directives.module';
import { ChangeComponent } from './change.component';
import { ChangeService } from './change.service';
import { CompareValidatorsDirective } from './compare-validator.directive';

@NgModule({
    declarations: [
        ChangeComponent,
        CompareValidatorsDirective
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        RouterModule.forChild([
            { path: '', component: ChangeComponent }
        ]),
        // RecaptchaModule.forRoot({
        //     siteKey: '6Ldw2nAUAAAAAOMXJwUKt-uHRZDzUaSehv1GDi0R',
        // }),
        SharedDirectivesModule,
        MatDividerModule
    ],

    exports: [

    ],
    providers: [
        ChangeService,
    ]
})

export class ChangeModule {

}
