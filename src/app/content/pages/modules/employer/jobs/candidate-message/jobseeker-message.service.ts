import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { QueryModel, ResponseModel } from '../../../../../../models';
import { BaseUrlCreator, ParamGenService } from '../../../../../../utils';

@Injectable()
export class JobSeekerMessageService {

    private readonly api = this.url.createUrl('JobSeekerMessage', 'Employer');

    constructor(
        private http: HttpClient,
        private url: BaseUrlCreator,
        private paramGen: ParamGenService,
    ) { }

    /**
     * Gets job seeker messages header
     */
    getGroupedMessageHeaders(params?: QueryModel) {

        const p = this.paramGen.createParams(params);
        return this.http.get<ResponseModel>(`${this.api}/Get`, { params: p });
    }

    /**
     * Gets job seeker messages without body (lazy sub list)
     */
    getMessages = (jobSeekerGuid: string) => this.http.get<ResponseModel>(`${this.api}/GetMessages/${jobSeekerGuid}`);

    /**
     * Gets message body only
     */
    getMessageBody = (id: number, jobSeekerGuid: string) => this.http.get<ResponseModel>(`${this.api}/GetMessageBody/${id}/${jobSeekerGuid}`);


}
