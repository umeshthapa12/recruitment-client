import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JobSeekerMessage, OpeningModel, QueryModel, ResponseModel } from '../../../../models';
import { BaseUrlCreator, ParamGenService } from '../../../../utils';

@Injectable({ providedIn: 'root' })
export class ApplicationService {

    private readonly api = this.url.createUrl('Application', 'Employer');
    private readonly openingApi = this.url.createUrl('Job', 'Employer');

    constructor(
        private http: HttpClient,
        private url: BaseUrlCreator,
        private paramGen: ParamGenService,
    ) { }

    /**
     * Gets applications
     */
    getApps(params?: QueryModel) {

        const p = this.paramGen.createParams(params);
        return this.http.get<ResponseModel>(`${this.api}/Get`, { params: p });
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
     * Gets an application by Id
     */
    getOpening = (id: number) => this.http.get<ResponseModel>(`${this.api}/Get/${id}`);

    /**
    * Updates application's status
    * @param body payload
    */
    sendMessage = (body: JobSeekerMessage[]) => {
        return this.http.post<ResponseModel>(`${this.api}/SendMessage`, body);
    }

    /**
     * Removes an application
     * @param id element Id
     */
    deleteApp = (id: number) => this.http.delete<ResponseModel>(`${this.api}/Delete/${id}`);

    /**
     * Updates opening data as minor update.
     * @param body opening's body
     */
    updateOpeningMinorData = (body: OpeningModel) => this.http.put<ResponseModel>(`${this.openingApi}/UpdateMinor`, body);

}
