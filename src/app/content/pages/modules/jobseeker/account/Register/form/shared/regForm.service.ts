import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUrlCreator } from '../../../../../../../../utils';
import { IRegister } from './regForm.model';

@Injectable()
export class RegFormService {

    private api = this.url.createUrl('account', 'jobseeker');
    private dropdowns = this.url.createUrl('Dropdowns', 'Shared');

    constructor(
        private http: HttpClient,
        private url: BaseUrlCreator
    ) { }

    addOrUpdate(body: IRegister): Observable<any> {
        return this.http.post<any>(`${this.api}/register`, body);

    }

    // for async email validation
    lookup(query: string): Observable<any> {
        return this.http.get(`${this.api}/lookup?q=${query}`);
    }

    getJobCategory(): Observable<any> {
        return this.http.get(`${this.dropdowns}/GetJobCategory`);
    }

}

