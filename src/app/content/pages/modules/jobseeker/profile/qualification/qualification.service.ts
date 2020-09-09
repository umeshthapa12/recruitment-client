import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseModel } from '../../../../../../models';
import { BaseUrlCreator } from '../../../../../../utils';
import { QualModel } from '../../../shared/models';

@Injectable()
export class QualificationService {

    private readonly api = this.helper.createUrl('Edu', 'Jobseeker');

    constructor(
        private http: HttpClient,
        private helper: BaseUrlCreator
    ) { }

    /**
     * Gets jobseeker's Qualifications
     */
    getQualific<T extends ResponseModel>(): Observable<T> {
        return this.http.get<T>(`${this.api}/Get`);
    }

    /**
     * Gets jobseeker's Qualification by Id
     */
    getQualificById<T extends ResponseModel>(id: number): Observable<T> {
        return this.http.get<T>(`${this.api}/Get/${id}`);
    }

    /**
     * Updates jobseeker's Qulification.
     * @param body payload
     */
    addOrUpdateQualific<T extends ResponseModel>(body: QualModel): Observable<T> {

        return body.id > 0
            ? this.http.put<T>(`${this.api}/Update`, body)
            : this.http.post<T>(`${this.api}/Create`, body);
    }

    /**
     * Removes jobseeker's Qulification.
     * @param body payload
     */
    deleteQualific<T extends ResponseModel>(id: number): Observable<T> {

        return this.http.delete<T>(`${this.api}/Delete/${id}`);
    }


}
