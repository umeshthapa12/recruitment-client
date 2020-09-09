import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseModel } from '../../../../../../models';
import { BaseUrlCreator } from '../../../../../../utils';
import { JobPrefModel } from '../../../shared/models';

@Injectable()

export class PreferenceService {

    private readonly api = this.helper.createUrl('JobPref', 'Jobseeker');

    constructor(
        private http: HttpClient,
        private helper: BaseUrlCreator
    ) { }

    /**
     * Gets jobseeker's Job Preference from the API
     */
    getJobPref<T extends ResponseModel>(): Observable<T> {
        return this.http.get<T>(`${this.api}/Get`);
    }

    /**
     * Updates jobseeker's Job Preference.
     * @param body payload
     */
    updateJobPref<T extends ResponseModel>(body: JobPrefModel): Observable<T> {

        return this.http.put<T>(`${this.api}/Update`, body);
    }

    /**
     * Updates jobseeker's Job Job Search Status.
     * @param status payload
     */
    updateJobSearchStatus<T extends ResponseModel>(status: string): Observable<T> {

        return this.http.put<T>(`${this.api}/UpdateJobSearchStatus?s=${status}`, status);
    }

}



