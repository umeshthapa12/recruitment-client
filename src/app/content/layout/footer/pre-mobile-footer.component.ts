import { Component, OnInit, HostBinding } from '@angular/core';

@Component({
    selector: 'pre-mobile-footer',
    templateUrl: './pre-mobile-footer.component.html',
    styles: [`
    .mobile-app-image-bg{
    background: url(assets/app/media/img/misc/mobile-app.png);
    height: 380px;
    background-repeat: no-repeat;
    margin-top: 10px;
    bottom: -18px;
    position: relative;
    z-index: 1;
    background-position: right;
    }
    `]
})
export class PreMobileFooterComponent implements OnInit {
    @HostBinding('class') classes = 'pre-mobile-footer-bg m-grid__item m-footer ';
    constructor() { }

    ngOnInit() { }
}
