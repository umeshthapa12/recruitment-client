import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseModel } from '../../../../../../models';
import { BaseUrlCreator } from '../../../../../../utils';
import { ReferenceModel } from './reference.model';

@Injectable()
export class ReferenceService {

    private readonly api = this.helper.createUrl('Reference', 'Jobseeker');

    constructor(
        private http: HttpClient,
        private helper: BaseUrlCreator
    ) { }

    /**
     * Gets jobseeker's references
     */
    getRefs<T extends ResponseModel>(): Observable<T> {
        return this.http.get<T>(`${this.api}/Get`);
    }

    /**
     * Gets jobseeker's reference by Id
     */
    getRefById<T extends ResponseModel>(id: number): Observable<T> {
        return this.http.get<T>(`${this.api}/Get/${id}`);
    }

    /**
     * Updates jobseeker's reference.
     * @param body payload
     */
    addOrUpdateRef<T extends ResponseModel>(body: ReferenceModel): Observable<T> {

        return body.id > 0
            ? this.http.put<T>(`${this.api}/Update`, body)
            : this.http.post<T>(`${this.api}/Create`, body);
    }

    /**
     * Removes jobseeker's reference.
     * @param body payload
     */
    deleteRef<T extends ResponseModel>(id: number): Observable<T> {

        return this.http.delete<T>(`${this.api}/Delete/${id}`);
    }
}
