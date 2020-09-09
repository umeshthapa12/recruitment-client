import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseUrlCreator } from '../utils';
import { ResponseModel } from '../models';

@Injectable({ providedIn: 'root' })
export class EmbeddedService {

    private aip = this.url.createUrl('Files', 'Employer');

    constructor(
        private url: BaseUrlCreator,
        private http: HttpClient) { }

    uploadEmbed = (fd: FormData) => {
        let h = new HttpHeaders();
        h = h.set('content-type', 'application/x-www-form-urlencoded')
        return this.http.post<ResponseModel>(`${this.aip}/UploadEmbedded`, fd).toPromise();
    }

}