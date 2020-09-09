import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { JobServiceTypeModel } from '../../../../models';
// import { HubConnectionBuilder } from '@aspnet/signalr';
@Component({
	selector: 'm-dashboard',
	templateUrl: './homepage.component.html'
})
export class DashboardComponent implements AfterViewInit, OnDestroy {

	private toDestroy$ = new Subject<void>();

	/**-----------------------------------------------------
	 Note: To list all of the available opening service type keywords,
	 #### refer to this @link http://{backend url}/shared/api/v2.0/Dropdowns/GetOpeningServiceTypes
	 ----------------------------------------------------- */
	jobServiceType: JobServiceTypeModel[];

	private sections = [

		{ keyword: 'top-jobs', displayText: 'Top Jobs', icon: 'la la-arrow-circle-o-up m--font-primary', hasSearchInput: false },
		{ keyword: 'hot-jobs', displayText: 'Hot Jobs', icon: 'la la-fire m--font-danger' },
		{ keyword: 'featured-jobs', displayText: 'Featured Jobs', icon: 'flaticon-medal m--font-warning' },
	];

	constructor(private cdr: ChangeDetectorRef) {

		// cleanup before re-init from the view to prevent conflict
		// this.jobServiceType.map(_ => _.keyword)
		// 	.forEach(key => localStorage.removeItem(key));

	}

	loadCount = 0;

	dataLoaded(x: { hasLen: boolean, keyword: string }) {
		this.cdr.markForCheck();
		// cleaning up the previous keys from the  ctor.
		const el = this.jobServiceType.find(_ => _.keyword === x.keyword);
		++this.loadCount;
		el.hasLen = x.hasLen;
		// localStorage.setItem(x.keyword, JSON.stringify(x))
	}

	itHasData() {

		this.cdr.markForCheck();
		return this.loadCount === 3 && this.jobServiceType.filter(_ => _ && _.hasLen).length > 0;
	}

	ngAfterViewInit() {

		setTimeout(() => {
			this.cdr.markForCheck();
			this.jobServiceType = this.sections.slice();
		}, 100);

		// this.initSingleSearchInput();

		// const connection = new HubConnectionBuilder().withUrl('http://192.168.100.4:4000/ChatHub').build();

		// connection.on('ReceiveMessage', function (user, message) {
		// 	console.log(user);
		// 	const msg = message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		// 	const encodedMsg = '<b>' + user + '</b> says ' + msg;
		// 	const li = document.createElement('li');
		// 	li.innerHTML = encodedMsg;
		// 	document.getElementById('messagesList').appendChild(li);
		// });

		// connection.start().catch(function (err) {
		// 	return console.error(err.toString());
		// });

		// document.getElementById('sendButton').addEventListener('click', function (event) {
		// 	const user = (document.getElementById('userInput') as any).value;
		// 	const message = (document.getElementById('messageInput') as any).value;
		// 	connection.send('SendMessage', user, message).catch(function (err) {
		// 		return console.error(err.toString());
		// 	});
		// 	event.preventDefault();
		// });


	}

	private initSingleSearchInput() {
		const x = () => this.jobServiceType.forEach(j => {
			this.cdr.markForCheck();
			const exist = this.jobServiceType.findIndex(_ => _.hasSearchInput) > -1;
			if (exist)
				return;
			const lKey = localStorage.getItem(j.keyword);
			if (!lKey)
				return;
			const o: JobServiceTypeModel = JSON.parse(lKey);
			if (j.hasSearchInput)
				return;
			if (o && o.keyword === 'top-jobs' && o.keyword === j.keyword && o.hasLen) {
				j.hasSearchInput = true;
				return;
			}
			if (o && o.hasLen && o.keyword === 'hot-jobs' && o.keyword === j.keyword) {
				j.hasSearchInput = true;
				return;
			}
			if (o && o.hasLen && o.keyword === 'featured-jobs' && o.keyword === j.keyword) {
				j.hasSearchInput = true;
				return;
			}
		});
		setInterval(_ => x(), 1000);
	}

	ngOnDestroy() {
		this.toDestroy$.next();
		this.toDestroy$.complete();
	}

}
