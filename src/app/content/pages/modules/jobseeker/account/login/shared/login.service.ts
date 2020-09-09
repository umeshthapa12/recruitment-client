import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ResponseModel } from '../../../../../../../models';
import { BaseUrlCreator } from '../../../../../../../utils';

@Injectable({ providedIn: 'root' })
export class LoginService {

	private readonly api = this.url.createUrl('Account', 'Jobseeker');

	constructor(
		private http: HttpClient,
		private url: BaseUrlCreator
	) {
	}

	login(email: string, password: string) {

		return this.http.post<HttpResponse<ResponseModel>>(`${this.api}/login`, {
			email: email,
			password: password
		}, { observe: 'response' })
			.pipe(tap(_ => [localStorage.setItem('X-JWT-Token', _.headers.get('X-JWT-Token'))])
			);
	}

	emailVerify = (t: string): Observable<any> => this.http.get(`${this.api}/AccountVerify?t=${t}`);
}
