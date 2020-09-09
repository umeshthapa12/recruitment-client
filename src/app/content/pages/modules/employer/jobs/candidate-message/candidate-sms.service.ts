import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { QueryModel, ResponseModel } from '../../../../../../models';
import { BaseUrlCreator, ParamGenService } from '../../../../../../utils';

@Injectable()
export class CandidateSmsService {

    private readonly api = this.url.createUrl('JobSeekerMessage', 'Employer');

    constructor(
        private http: HttpClient,
        private url: BaseUrlCreator,
        private paramGen: ParamGenService,
    ) { }
    getGroupedSmsHeaders(params?: QueryModel) {

        const p = this.paramGen.createParams(params);
        return this.http.get<ResponseModel>(`${this.api}/Get`, { params: p });
    }
    getSms = (jobSeekerGuid: string) => this.http.get<ResponseModel>(`${this.api}/GetMessages/${jobSeekerGuid}`);

    getSmsBody = (id: number, jobSeekerGuid: string) => this.http.get<ResponseModel>(`${this.api}/GetMessageBody/${id}/${jobSeekerGuid}`);

    getList(): Observable<any> {
        return of(DATA);
    }
}

const DATA = [
    {
        id: 1,
        sn: 1,
        fullName: 'nasd',
        mobileNumber: '9812345678',
        age: 123,
        totalMessage: 2,
    }
];
