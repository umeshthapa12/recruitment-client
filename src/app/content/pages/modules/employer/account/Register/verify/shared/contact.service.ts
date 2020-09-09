import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUrlCreator } from '../../../../../../../../utils';

@Injectable()
export class ContactPersonService {

    private readonly api: string = this.url.createUrl('Account', 'Employer');

    constructor(
        private http: HttpClient,
        private url: BaseUrlCreator
    ) { }

    emailVerify(t: string): Observable<any> {
        const url = `${this.api}/AccountVerify?t=${t}`;
        return this.http.get(url);
    }
}
