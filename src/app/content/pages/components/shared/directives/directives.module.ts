import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FallbackImgSrcDirective } from './img-src.directive';
import { ListStickyHeaderDirective } from './sticky-list-header.directive';

@NgModule({
    declarations: [FallbackImgSrcDirective, ListStickyHeaderDirective],
    imports: [CommonModule],
    exports: [FallbackImgSrcDirective, ListStickyHeaderDirective],
})
export class SharedDirectivesModule { }
