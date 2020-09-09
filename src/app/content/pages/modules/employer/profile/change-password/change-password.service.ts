import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseModel } from '../../../../../../models';
import { BaseUrlCreator } from '../../../../../../utils';

@Injectable()
export class ChangePasswordService {
    private readonly api: string = this.url.createUrl('Account', 'Employer');

    constructor(
        private readonly http: HttpClient,
        private readonly url: BaseUrlCreator) {
    }

    changePassword(body: { currentPw: string, newPw: string }): Observable<ResponseModel> {
        return this.http.put<ResponseModel>(`${this.api}/UpdatePassword`, body);
    }

}

