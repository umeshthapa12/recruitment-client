import { Action, State, StateContext, Store } from '@ngxs/store';
import { ApplicantModel, AppointmentModel } from '../../../../../../../../models/appointment.model';
import { AppointmentService } from '../../../../../shared/appointment.service';
import { Injectable } from '@angular/core';

export interface AppointmentStateModel {
    appointment?: AppointmentModel;
    applicant?: ApplicantModel;
}

export class AddOrUpdateAppointmentAction {
    static readonly type = '[Appointments] add or update appointments';
    constructor(public updates: AppointmentStateModel) { }
}

export class SendMessageSuccessAction {
    static readonly type = '[Appointments] send appointment schedule message';
    constructor(public updates: AppointmentStateModel) { }
}

/**
 * Appointment state
 */
@Injectable()
@State({
    name: 'appointments',
    defaults: {},
})
export class AppointmentState {

    constructor(
        private cService: AppointmentService,
        private store: Store) { }

    @Action(SendMessageSuccessAction)
    sendMessage(ctx: StateContext<any>, action: SendMessageSuccessAction) {
        ctx.setState({ ...action.updates });
    }

}
