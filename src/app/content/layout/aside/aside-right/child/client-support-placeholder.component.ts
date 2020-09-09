import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'client-support-placeholder',
    templateUrl: './client-support-placeholder.component.html',
    changeDetection:ChangeDetectionStrategy.OnPush,
    styleUrls: ['../../aside-left.component.scss']
})
export class ClientSupportPlaceholderComponent implements OnInit {
    constructor() { }

    ngOnInit(): void { }
}
