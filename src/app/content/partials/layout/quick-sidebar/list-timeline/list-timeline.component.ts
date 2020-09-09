import {
	Component,
	Input,
	ChangeDetectionStrategy
} from '@angular/core';
import {NotificationModel} from '../../../../../core/interfaces/NotificationModel';

@Component({
	selector: 'm-list-timeline',
	templateUrl: './list-timeline.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListTimelineComponent {
	@Input() type: any;
	@Input() heading: any;

	@Input() logList: NotificationModel[];
}
