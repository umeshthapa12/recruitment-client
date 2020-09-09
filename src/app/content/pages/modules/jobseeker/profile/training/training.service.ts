import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseModel } from '../../../../../../models';
import { BaseUrlCreator } from '../../../../../../utils';
import { TrainingModel } from './training.model';

@Injectable()
export class TrainingService {

    private readonly api = this.helper.createUrl('Training', 'Jobseeker');

    constructor(
        private http: HttpClient,
        private helper: BaseUrlCreator
    ) { }

    /**
     * Gets jobseeker's trainings
     */
    getTraining<T extends ResponseModel>(): Observable<T> {
        return this.http.get<T>(`${this.api}/Get`);
    }

    /**
     * Gets jobseeker's training by Id
     */
    getTrainingById<T extends ResponseModel>(id: number): Observable<T> {
        return this.http.get<T>(`${this.api}/Get/${id}`);
    }

    /**
     * Updates jobseeker's training.
     * @param body payload
     */
    addOrUpdateTraining<T extends ResponseModel>(body: TrainingModel): Observable<T> {

        return body.id > 0
            ? this.http.put<T>(`${this.api}/Update`, body)
            : this.http.post<T>(`${this.api}/Create`, body);
    }

    /**
     * Removes jobseeker's training.
     * @param body payload
     */
    deleteTraining<T extends ResponseModel>(id: number): Observable<T> {

        return this.http.delete<T>(`${this.api}/Delete/${id}`);
    }

    /**
     * Removes jobseeker's training.
     * @param body payload
     */
    getDurationModes<T extends string[]>(): Observable<T> {

        return this.http.get<T>(`${this.api}/DurationMode`);
    }

}
