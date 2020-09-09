import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CoreModule } from '../../../../core/core.module';
import { ContactUsComponent } from './contact-us.component';

@NgModule({
    declarations: [ContactUsComponent],
    imports: [
        CommonModule,
        CoreModule,
        RouterModule.forChild([
            {
                path: '',
                component: ContactUsComponent
            }
        ]),
    ]
})
export class ContactUsModule { }
