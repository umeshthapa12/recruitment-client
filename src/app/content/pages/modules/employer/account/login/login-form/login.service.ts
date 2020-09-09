import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ResponseModel } from '../../../../../../../models';
import { BaseUrlCreator } from '../../../../../../../utils';

@Injectable({ providedIn: 'root' })
export class LoginService {
	private readonly api = this.url.createUrl('Account', 'Employer');

	constructor(private url: BaseUrlCreator,
		private http: HttpClient,
	) {
	}

	login(body: any): Observable<any> {

		return this.http.post<HttpResponse<ResponseModel>>(`${this.api}/login`,
			body, { observe: 'response' }).pipe(
				tap(_ => [localStorage.setItem('X-JWT-Token', _.headers.get('X-JWT-Token'))])
			);

	}

	requestPasswordResetLink = (body: { email: string }) => this.http.put<ResponseModel>(`${this.api}/ResetLink`, body);

	setNewPassword = (body: { password: string, vToken: string }) => this.http.put<ResponseModel>(`${this.api}/ResetPassword`, body);


}

