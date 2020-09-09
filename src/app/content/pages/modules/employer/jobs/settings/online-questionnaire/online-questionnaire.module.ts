import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { OnlineQuestionnaireComponent } from './online-questionnaire.component';

@NgModule({
    declarations: [OnlineQuestionnaireComponent],
    imports: [
        RouterModule.forChild([
            { path: '', component: OnlineQuestionnaireComponent }
        ]),
        CommonModule
    ],
    exports: [],
    providers: [],
})
export class OnlineQuestionnaireModule { }