import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseModel } from '../../../../../../models';
import { BaseUrlCreator } from '../../../../../../utils';
import { WorkExperienceModel } from './work.model';

@Injectable()
export class WorkService {
    private readonly api = this.helper.createUrl('Experience', 'Jobseeker');

    constructor(
        private http: HttpClient,
        private helper: BaseUrlCreator
    ) { }

    /**
     * Gets jobseeker's work experiences
     */
    getWorkExpes<T extends ResponseModel>(): Observable<T> {
        return this.http.get<T>(`${this.api}/Get`);
    }

    /**
     * Gets jobseeker's work experience by Id
     */
    getWorkExpeById<T extends ResponseModel>(id: number): Observable<T> {
        return this.http.get<T>(`${this.api}/Get/${id}`);
    }

    /**
     * Updates jobseeker's work experience.
     * @param body payload
     */
    addOrUpdateWorkExpec<T extends ResponseModel>(body: WorkExperienceModel): Observable<T> {

        return body.id > 0
            ? this.http.put<T>(`${this.api}/Update`, body)
            : this.http.post<T>(`${this.api}/Create`, body);
    }

    /**
     * Removes jobseeker's work experiences.
     * @param body payload
     */
    deleteWorkExpe<T extends ResponseModel>(id: number): Observable<T> {

        return this.http.delete<T>(`${this.api}/Delete/${id}`);
    }
}
