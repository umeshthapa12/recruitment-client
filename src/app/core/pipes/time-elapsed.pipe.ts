/**
 * https://github.com/AndrewPoyntz/time-ago-pipe
 * An Angular pipe for converting a date string into a time ago
 */
import {
	Pipe,
	PipeTransform,
	OnDestroy,
	ChangeDetectorRef,
	NgZone
} from '@angular/core';
import * as moment from 'moment';

@Pipe({
	name: 'mTimeElapsed'
})
export class TimeElapsedPipe implements PipeTransform, OnDestroy {
	private timer: number;
	constructor(
		private changeDetectorRef: ChangeDetectorRef,
		private ngZone: NgZone
	) { }
	transform(value: string) {
		this.removeTimer();
		const d = new Date(value);
		const now = new Date();
		const seconds = Math.round(
			Math.abs((now.getTime() - d.getTime()) / 1000)
		);
		const timeToUpdate = this.getSecondsUntilUpdate(seconds) * 1000;
		this.timer = this.ngZone.runOutsideAngular(() => {
			if (typeof window !== 'undefined') {
				return window.setTimeout(() => {
					this.ngZone.run(() =>
						this.changeDetectorRef.markForCheck()
					);
				}, timeToUpdate);
			}
			return null;
		});
		const minutes = Math.round(Math.abs(seconds / 60));
		const hours = Math.round(Math.abs(minutes / 60));
		const days = Math.round(Math.abs(hours / 24));
		const months = Math.round(Math.abs(days / 30.416));
		const years = Math.round(Math.abs(days / 365));
		if (seconds <= 45) {
			return 'just now';
		} else if (seconds <= 90) {
			return '1 min';
		} else if (minutes <= 45) {
			return minutes + ' mins';
		} else if (minutes <= 90) {
			return '1 hr';
		} else if (hours <= 22) {
			return hours + ' hrs';
		} else if (hours <= 36) {
			return '1 day';
		} else if (days <= 25) {
			return days + ' days';
		} else if (days <= 45) {
			return '1 month';
		} else if (days <= 345) {
			return months + ' months';
		} else if (days <= 545) {
			return '1 year';
		} else {
			// (days > 545)
			return years + ' years';
		}
	}
	ngOnDestroy(): void {
		this.removeTimer();
	}
	private removeTimer() {
		if (this.timer) {
			window.clearTimeout(this.timer);
			this.timer = null;
		}
	}
	private getSecondsUntilUpdate(seconds: number) {
		const min = 60;
		const hr = min * 60;
		const day = hr * 24;
		if (seconds < min) {
			// less than 1 min, update ever 2 secs
			return 2;
		} else if (seconds < hr) {
			// less than an hour, update every 30 secs
			return 30;
		} else if (seconds < day) {
			// less then a day, update every 5 mins
			return 300;
		} else {
			// update every hour
			return 3600;
		}
	}
}


@Pipe({
	name: 'remainingDays'
})
export class RemainingDaysPipe implements PipeTransform {
	private readonly _MS_PER_DAY = 1000 * 60 * 60 * 24;
	private dateDiffInDays(a: Date, b: Date) {
		// Discard the time and time-zone information.
		const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
		const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

		return Math.floor((utc2 - utc1) / this._MS_PER_DAY);
	}
	transform(value: string) {
		const date = moment(value);
		if (!date.isValid()) return value;
		const days = this.dateDiffInDays(new Date(), date.toDate());
		return `${days} day${days > 1 ? 's' : ''} left`;
	}
}


export function toAmPmTime(time: any) {
    if (!time) return time;

    let hours = time.split(':')[0];
    const minutes = time.split(':')[1];
    const suffix = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    hours = hours < 10 ? '0' + hours : hours;
    return hours + ':' + minutes + ' ' + suffix;
}

@Pipe({ name: 'time' })
export class AmPmTimePipe implements PipeTransform {
    transform(value: any): any {
        return toAmPmTime(value);
    }

}
