import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ajax } from 'rxjs/ajax';
import { QueryModel, ResponseModel } from '../../../../models';
import { StageBodyModel } from '../../../../models/application.model';
import { BaseUrlCreator, ParamGenService } from '../../../../utils';

@Injectable({ providedIn: 'root' })
export class JobSeekerStageService {

    private readonly api = this.url.createUrl('JobSeekerStage', 'Employer');

    constructor(
        private http: HttpClient,
        private url: BaseUrlCreator,
        private paramGen: ParamGenService,
    ) { }

    /**
     * Gets openings along with applicants stats
     */
    getView(params: QueryModel) {

        const p = this.paramGen.createParams(params);
        return this.http.get<ResponseModel>(`${this.api}/Get`, { params: p });
    }

    /**
    * Gets applicant current status to update stage and send message
    */
    getApplicants(openingId: number, params: QueryModel) {

        const p = this.paramGen.createParams(params);
        return this.http.get<ResponseModel>(`${this.api}/GetApplicants/${openingId}`, { params: p });
    }

    /**
    * Gets job titles of active employer
    */
    getJobTitles = () => this.http.get<ResponseModel>(`${this.api}/GetJobTitles`);


    /**
     * Updates applicant's stage
     * @param body payload
     */
    changeApplicantStage = (body: StageBodyModel) => this.http.post<ResponseModel>(`${this.api}/Change`, body);

    /**
     * Gets generated pdf or excel-sheet of stage data
     * @param openingIds collection of opening's ID
     * @param jsGuid collection of job seeker Guid
     * @param exportAs Exported file type `PDF` or excel-sheet is default
     * */
    exportStageData(openingIds: number[], jsGuid: string[], exportAs: string) {

        const accept = exportAs === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

        const p = [];
        for (let i = 0; i < openingIds.length; i++)
            p.push(encodeURIComponent('oid') + '=' + encodeURIComponent(openingIds[i]));

        for (let i = 0; i < jsGuid.length; i++)
            p.push(encodeURIComponent('uid') + '=' + encodeURIComponent(jsGuid[i]));

        const params = p.join('&');

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
     * Gets applicant's stage history (grouped by job seekers)
     */
    getApplicantsHistory(openingId: number, params?: QueryModel) {

        const p = this.paramGen.createParams(params);
        return this.http.get<ResponseModel>(`${this.api}/GetHistory/` + openingId, { params: p });
    }

    /**
     * Gets applicants detailed history (lazy sub list of a job seeker)
     */
    getApplicantHistory = (openingId: number, jobSeekerGuid: string) => this.http.get<ResponseModel>(`${this.api}/GetFullHistory/${openingId}/${jobSeekerGuid}`);

    /**
     * Gets message body only
     */
    getMessageBody = (id: number, jobSeekerGuid: string) => this.http.get<ResponseModel>(`${this.api}/GetMessageBody/${id}/${jobSeekerGuid}`);

    /**
    * Deletes stage history
    */
    deleteHistory = (id: number[], jsGuid: string[]) => {
        const p = [];
        for (let i = 0; i < id.length; i++)
            p.push(encodeURIComponent('id') + '=' + encodeURIComponent(id[i]));

        for (let i = 0; i < jsGuid.length; i++)
            p.push(encodeURIComponent('uid') + '=' + encodeURIComponent(jsGuid[i]));

        const params = p.join('&');

        return this.http.delete<ResponseModel>(`${this.api}/Remove?${params}`);

    }

}
