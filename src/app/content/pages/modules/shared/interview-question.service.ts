import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OpeningModel, QueryModel, ResponseModel } from '../../../../models';
import { BaseUrlCreator, ParamGenService } from '../../../../utils';

@Injectable({ providedIn: 'root' })
export class InterViewQuestionService {

    private readonly api = this.url.createUrl('Appointment', 'Employer');
    private readonly openingApi = this.url.createUrl('Job', 'Employer');

    constructor(
        private http: HttpClient,
        private url: BaseUrlCreator,
        private paramGen: ParamGenService,
    ) { }

    /**
     * Gets Questions
     */
    getView(params: QueryModel) {

        const p = this.paramGen.createParams(params);
        return this.http.get<ResponseModel>(`${this.api}/Get`, { params: p });
    }

    getApplicantStatus(openingId: number, params: QueryModel) {

        const p = this.paramGen.createParams(params);
        return this.http.get<ResponseModel>(`${this.api}/GetApplicantStatus/${openingId}`, { params: p });
    }

    generatePdf(appId: number, userGuid: string) {
        let headers = new HttpHeaders();
        headers = headers.set('Accept', 'application/pdf');
        return this.http.get(`${this.api}/GetApplicantPdf/${appId}/${userGuid}`,
            { responseType: 'blob', headers: headers }
        );
    }

    updateOpeningMinorData = (body: OpeningModel) => this.http.put<ResponseModel>(`${this.openingApi}/UpdateMinor`, body);

    sendMessageNow = (body: any[]) => this.http.post<ResponseModel>(`${this.api}/SendExistingMessage`, body);

}
