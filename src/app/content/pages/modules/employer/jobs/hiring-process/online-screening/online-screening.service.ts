import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { QueryModel, ResponseModel } from '../../../../../../../models';
import { BaseUrlCreator, ParamGenService } from '../../../../../../../utils';

@Injectable()
export class OnlineScreeningService {

    private readonly api = this.url.createUrl('Application', 'Employer');

    constructor(
        private http: HttpClient,
        private url: BaseUrlCreator,
        private paramGen: ParamGenService,
    ) { }

    /**
     * Gets questionnaire answered users as group
     */
    getQuestionnaireAns(params?: QueryModel) {

        const p = this.paramGen.createParams(params);
        return this.http.get<ResponseModel>(`${this.api}/GetScreeningUsers`, { params: p });
    }

    /**
     * Gets questionnaire opening's titles
     */
    getQuestionnaireOpeningTitles(jsGuid: string) {
        return this.http.get<ResponseModel>(`${this.api}/GetScreeningOpeningTitles/${jsGuid}`);
    }

    /**
     * Gets questionnaire answer metadata
     */
    getQuestionnaireAnsData(id: number, jsGuid: string) {
        return this.http.get<ResponseModel>(`${this.api}/GetScreeningAnswerBody/${id}/${jsGuid}`);
    }
}
