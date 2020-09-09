import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseModel } from '../../../../../../models';
import { BaseUrlCreator } from '../../../../../../utils';
import { ServiceModel } from './service.model';
@Injectable()
export class EmployerServiceProvidorService {
    private readonly api = this.helper.createUrl('Service', 'Employer');

    constructor(
        private http: HttpClient,
        private helper: BaseUrlCreator
    ) { }

    /**
     * Gets Employer's service
     */
    getService<T extends ResponseModel>(): Observable<T> {
        return this.http.get<T>(`${this.api}/Get`);
    }

    /**
     * Updates Employer's service.
     * @param body payload
     */
    addOrUpdateService<T extends ResponseModel>(body: ServiceModel): Observable<T> {

        return body.id > 0
            ? this.http.put<T>(`${this.api}/Update`, body)
            : this.http.post<T>(`${this.api}/Create`, body);
    }

    /**
     * Removes Employer's service.
     * @param body payload
     */
    deleteService<T extends ResponseModel>(id: number): Observable<T> {

        return this.http.delete<T>(`${this.api}/Delete/${id}`);
    }
}
