import { Injectable } from '@angular/core';
import * as objectPath from 'object-path';
import { BehaviorSubject } from 'rxjs';
import { ClassInitService } from '../class-init.service';
import { MenuConfigService } from '../menu-config.service';

@Injectable()
export class MenuHorizontalService {
	menuList$: BehaviorSubject<any[]> = new BehaviorSubject([]);
	attributes: any;
	menuClasses: string;

	constructor(
		private menuConfigService: MenuConfigService,
		private classInitService: ClassInitService
	) {
		// get menu list
		this.menuConfigService.onMenuUpdated$.subscribe(model => {
			this.menuList$.next(objectPath.get(model.config, 'header.items'));
		});

		// subscribe to menu classes update
		this.classInitService.onClassesUpdated$.subscribe(classes => {
			// default class
			this.menuClasses =
				'm-header-menu m-aside-header-menu-mobile m-aside-header-menu-mobile--offcanvas';
			// join the classes array and pass to variable
			// add classes to this host binding class
			this.menuClasses += ' ' + classes.header_menu.join(' ');
		});
	}
}
