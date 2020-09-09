import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseModel } from '../../../../../../models';
import { BaseUrlCreator } from '../../../../../../utils';
import { AccountModel } from './account.model';

@Injectable()
export class AccountService {
    private readonly api = this.helper.createUrl('Socials', 'Employer');

    constructor(
        private http: HttpClient,
        private helper: BaseUrlCreator
    ) { }

    /**
     * Gets Employer's social accounts
     */
    getSocialAccount<T extends ResponseModel>(): Observable<T> {
        return this.http.get<T>(`${this.api}/Get`);
    }

    /**
     * Gets Employer's social account by Id
     */
    getSocialAccountById<T extends ResponseModel>(id: number): Observable<T> {
        return this.http.get<T>(`${this.api}/Get/${id}`);
    }

    /**
     * Updates Employer's social account.
     * @param body payload
     */
    addOrUpdateSocialAccount<T extends ResponseModel>(body: AccountModel): Observable<T> {

        return body.id > 0
            ? this.http.put<T>(`${this.api}/Update`, body)
            : this.http.post<T>(`${this.api}/Create`, body);
    }

    /**
     * Removes Employer's social account.
     * @param body payload
     */
    deleteSocialAccount<T extends ResponseModel>(id: number): Observable<T> {

        return this.http.delete<T>(`${this.api}/Delete/${id}`);
    }
}
