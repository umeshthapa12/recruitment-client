import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../../environments/environment';
import { ResponseModel } from '../../../../../../models';
import { BaseUrlCreator } from '../../../../../../utils';
import { DocumentModel } from './document.model';

@Injectable()
export class DocumentService {

    private readonly api = this.helper.createUrl('Docs', 'Jobseeker');

    constructor(
        private http: HttpClient,
        private helper: BaseUrlCreator
    ) { }

    /**
     * Gets jobseeker's text docs
     */
    getTextDocs<T extends ResponseModel>(): Observable<T> {
        return this.http.get<T>(`${this.api}/Get`);
    }

    /**
     * Gets jobseeker's text doc by Id
     */
    getTextDocById<T extends ResponseModel>(id: number): Observable<T> {
        return this.http.get<T>(`${this.api}/Get/${id}`);
    }

    /**
     * Updates jobseeker's text doc.
     * @param body payload
     */
    addOrUpdateTextDoc<T extends ResponseModel>(body: DocumentModel, fd: FormData): Observable<T> {
        const b = this.toFormData(body, fd);
        return body.id > 0
            ? this.http.put<T>(`${this.api}/Update`, b)
            : this.http.post<T>(`${this.api}/Create`, b);
    }

    /**
     * Removes jobseeker's text doc.
     * @param body payload
     */
    deleteTextDoc<T extends ResponseModel>(id: number): Observable<T> {

        return this.http.delete<T>(`${this.api}/Delete/${id}`);
    }

    /**
     * Removes jobseeker's file.
     * @param body payload
     */
    deleteFile<T extends ResponseModel>(url: string): Observable<T> {

        return this.http.delete<T>(`${environment.baseUrl}/Jobseeker/api/v2.0/${url}`);
    }

    private toFormData(body: any, fd: FormData, makeUpperCaseKey?: boolean): FormData {
        for (const key in body) {
            if (body.hasOwnProperty(key)) {

                if (body[key])
                    fd.append(makeUpperCaseKey ? this.capitalizeFirstLetter(key) : key, body[key]);
            }
        }
        return fd;
    }

    private capitalizeFirstLetter(inputKey: string) {
        return inputKey.charAt(0).toUpperCase() + inputKey.slice(1);
    }
}
