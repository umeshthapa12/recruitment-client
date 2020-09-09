import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { QueryModel, ResponseModel } from '../../../../../../models';
import { BaseUrlCreator, ParamGenService } from '../../../../../../utils';

@Injectable()
export class DraftService {

    private readonly api = this.url.createUrl('Job', 'Employer');

    constructor(
        private http: HttpClient,
        private url: BaseUrlCreator,
        private paramGen: ParamGenService,
    ) { }

    getDrafts(params?: QueryModel) {

        const p = this.paramGen.createParams(params);
        return this.http.get<ResponseModel>(`${this.api}/GetDrafted`, { params: p });
    }

}
