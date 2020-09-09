import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MailServerSetupComponent } from './mail-server.component';
import { RouterModule } from '@angular/router';

@NgModule({
    declarations: [MailServerSetupComponent],
    imports: [
        RouterModule.forChild([
            { path: '', component: MailServerSetupComponent }
        ])
        ,
        CommonModule
    ],
    exports: [],
    providers: [],
})
export class MailServerSetupModule { }