import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResponseModel } from '../../../../../../models';
import { BaseUrlCreator } from '../../../../../../utils';

@Injectable()
export class DashboardService {

    private api = this.url.createUrl('Job', 'Employer');

    constructor(
        private http: HttpClient,
        private url: BaseUrlCreator) { }

    getJobs = (jobsFor: string) => this.http.get<ResponseModel>(`${this.api}/GetStats?s=` + jobsFor);

}
