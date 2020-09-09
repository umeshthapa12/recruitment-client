import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RouterModule } from '@angular/router';
import { SharedDirectivesModule } from '../../../../components/shared/directives/directives.module';
import { OtherComponent } from './other.component';
import { OtherService } from './other.service';

@NgModule({
    declarations: [
        OtherComponent
    ],
    imports: [
        CommonModule,
        MatSlideToggleModule,
        MatBadgeModule,
        RouterModule.forChild([
            { path: '', component: OtherComponent }
        ]),
        MatDividerModule,
        SharedDirectivesModule
    ],

    exports: [

    ],
    providers: [
        OtherService,
    ]
})

export class OtherModule {

}
