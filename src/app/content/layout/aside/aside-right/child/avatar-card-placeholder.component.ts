import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'avatar-card-placeholder',
    templateUrl: './avatar-card-placeholder.component.html',
    changeDetection:ChangeDetectionStrategy.OnPush,
    styleUrls: ['../../aside-left.component.scss']
})
export class AvatarCardPlaceholderComponent implements OnInit {
    constructor() { }

    ngOnInit(): void { }
}
