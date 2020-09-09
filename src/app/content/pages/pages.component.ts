import { AnimationPlayer } from '@angular/animations';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input } from '@angular/core';
import { Select } from '@ngxs/store';
import * as objectPath from 'object-path';
import { BehaviorSubject, fromEvent, Observable } from 'rxjs';
import { debounceTime, filter, map } from 'rxjs/operators';
import { ClassInitService } from '../../core/services/class-init.service';
import { LayoutConfigService } from '../../core/services/layout-config.service';
import { fadeInOutDown } from '../../utils';
import { CoverConfigModel } from './store/page-store/cover.store';

@Component({
	selector: 'm-pages',
	templateUrl: './pages.component.html',
	animations: [fadeInOutDown],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagesComponent implements AfterViewInit {

	@HostBinding('class') classes = 'm-grid m-grid--hor m-grid--root m-page';
	@Input() selfLayout: any = 'blank';
	@Input() asideLeftDisplay: any;
	@Input() asideRightDisplay: any;
	@Input() asideLeftCloseClass: any;

	public player: AnimationPlayer;

	// class for the header container
	pageBodyClass$: BehaviorSubject<string> = new BehaviorSubject<string>('');

	isSmallScreen = new BehaviorSubject<boolean>(window.outerWidth <= 1024);

	showCover: { main?: boolean, mini?: boolean };

	@Select('cover_config', 'config') coverConfig$: Observable<CoverConfigModel>;

	constructor(
		private cdr: ChangeDetectorRef,
		private configService: LayoutConfigService,
		public classInitService: ClassInitService,
	) {
		this.configService.onLayoutConfigUpdated$.pipe(debounceTime(50)).subscribe({
			next: model => {

				this.cdr.markForCheck();

				const config = model.config;

				let pageBodyClass = '';
				this.selfLayout = objectPath.get(config, 'self.layout');
				if (this.selfLayout === 'boxed' || this.selfLayout === 'wide') {
					pageBodyClass += ' m-container m-container--responsive m-container--xxl m-page__container';
				}
				this.pageBodyClass$.next(pageBodyClass);

				this.asideLeftDisplay = objectPath.get(config, 'aside.left.display');

				this.asideRightDisplay = objectPath.get(config, 'aside.right.display');
			}
		});

		this.classInitService.onClassesUpdated$.pipe(debounceTime(50)).subscribe({
			next: c => this.asideLeftCloseClass = objectPath.get(c, 'aside_left_close')
		});

		// switch homepage cover based on window screen size
		fromEvent(window, 'resize')
			.pipe(
				debounceTime(400),
				map(_ => window.outerWidth <= 1024)
			).subscribe({ next: small => this.isSmallScreen.next(small) });

	}

	ngAfterViewInit() {
		this.coverConfig$.pipe(filter(_ => _ ? true : false))
			.subscribe({
				next: c => [
					this.cdr.markForCheck(),
					this.showCover = c?.showCover,
					this.toggleAsides(c)
				]
			});
	}

	private toggleAsides(c: CoverConfigModel) {
		objectPath.set(this.configService.layoutConfig, 'config.aside.left.display', c.showLeftAside);
		objectPath.set(this.configService.layoutConfig, 'config.aside.right.display', c.showRightAside);
		 const updatedLayout = objectPath.get(this.configService.layoutConfig);
		this.configService.setModel(updatedLayout);
	}

}
