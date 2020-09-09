import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ajax } from 'rxjs/ajax';
import { JobSeekerMessage, OpeningModel, QueryModel, ResponseModel } from '../../../../models';
import { ApplicantModel } from '../../../../models/appointment.model';
import { BaseUrlCreator, ParamGenService } from '../../../../utils';

@Injectable({ providedIn: 'root' })
export class AppointmentService {

    private readonly api = this.url.createUrl('Appointment', 'Employer');
    private readonly openingApi = this.url.createUrl('Job', 'Employer');

    constructor(
        private http: HttpClient,
        private url: BaseUrlCreator,
        private paramGen: ParamGenService,
    ) { }

    /**
     * Gets applications
     */
    getView(params: QueryModel) {

        const p = this.paramGen.createParams(params);
        return this.http.get<ResponseModel>(`${this.api}/Get`, { params: p });
    }

    /**
    * Gets applicant current status to check/set/update next appointment
    */
    getApplicantStatus(openingId: number, params: QueryModel) {

        const p = this.paramGen.createParams(params);
        return this.http.get<ResponseModel>(`${this.api}/GetApplicantStatus/${openingId}`, { params: p });
    }

    /**
     * Gets generated pdf or excel-sheet of appointment data
     * @param openingIds collection of opening's ID
     * @param exportAs Exported file type `PDF` or excel-sheet is default
     * */
    exportAppointment(openingIds: number[], exportAs: string) {
        const accept = exportAs === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        const ids = [];
        for (let i = 0; i < openingIds.length; i++) {
            const id = openingIds[i];
            ids.push(encodeURIComponent('openingIds') + '=' + encodeURIComponent(id));
        }
        const params = ids.join('&');
        return ajax({
            url: `${this.api}/Export/${exportAs}?${params}`,
            method: 'GET',
            responseType: 'blob',
            headers: {
                'Content-Type': 'application/json',
                'Accept': accept,
                'Cache-Control': 'no-cache',
                'Access-Control-Expose-Headers': 'Content-Disposition'
            },
            withCredentials: true,
            crossDomain: true
        });
    }

    /**
    * Updates opening data as minor update.
    * @param body opening's body
    */
    updateOpeningMinorData = (body: OpeningModel) => this.http.put<ResponseModel>(`${this.openingApi}/UpdateMinor`, body);

    /**
     * send message now
     * @param body payload
     */
    sendMessageNow = (body: ApplicantModel[]) => this.http.post<ResponseModel>(`${this.api}/SendExistingMessage`, body);

    /**
    * Updates job seeker message attended status
    * @param body job seeker messages
    */
    updateAttendees = (body: JobSeekerMessage[]) => this.http.put<ResponseModel>(`${this.api}/UpdateAttendees`, body);

    /**
     * cancels (Deletes) all appointments which was scheduled to auto send using timer.
     * @param ids opening IDs
     */
    cancelScheduledTimer = (ids: number[]) => {

        const prm = [];
        ids.forEach(id => prm.push('ids=' + id));

        return this.http.delete<ResponseModel>(`${this.api}/ClearAppointmentTimer${ids.length > 0 ? '?' + prm.join('&') : ''}`);
    }

}
