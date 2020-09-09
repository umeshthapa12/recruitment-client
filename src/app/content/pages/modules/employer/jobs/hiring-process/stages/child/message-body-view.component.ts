import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    templateUrl: './message-body-view.component.html',
})
export class MessageBodyComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: string
    ) { }
}
