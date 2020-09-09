import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResponseModel } from '../../../../../../../../models';
import { BaseUrlCreator } from '../../../../../../../../utils';

@Injectable()
export class ResetService {

    private readonly api: string = this.url.createUrl('Account', 'Jobseeker');

    constructor(
        private readonly http: HttpClient,
        private readonly url: BaseUrlCreator) {

    }

    requestPasswordResetLink = (body: { email: string }) => this.http.put<ResponseModel>(`${this.api}/ResetLink`, body);

    setNewPassword = (body: { password: string, vToken: string }) => this.http.put<ResponseModel>(`${this.api}/ResetPassword`, body);

}
