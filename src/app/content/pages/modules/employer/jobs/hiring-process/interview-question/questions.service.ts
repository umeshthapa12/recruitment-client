import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OpeningModel, QueryModel, ResponseModel } from '../../../../../../../models';
import { ApplicantModel } from '../../../../../../../models/appointment.model';
import { BaseUrlCreator, ParamGenService } from '../../../../../../../utils';

@Injectable({ providedIn: 'root' })
export class QuestionsService {

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
     * Gets generated pdf as CV
     */
    generatePdf(appId: number, userGuid: string) {
        let headers = new HttpHeaders();
        headers = headers.set('Accept', 'application/pdf');
        return this.http.get(`${this.api}/GetApplicantPdf/${appId}/${userGuid}`,
            { responseType: 'blob', headers: headers }
        );
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

}
