import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ResponseModel, UsersModel, UserType } from '../models';
import { BaseUrlCreator } from '../utils';
import { tap, map } from 'rxjs/operators';

@Injectable()
export class AuthService {
    private jobseekerUrl = this.url.createUrl('Account', 'Jobseeker');
    private employerUrl = this.url.createUrl('Account', 'Employer');

    constructor(
        private http: HttpClient,
        private url: BaseUrlCreator
    ) { }

    /**
     * User authentication
     * @param model valid user model with email & password
     * @param type type of the user E.G. employer, jobseeker etc.,
     */
    userLogin(model: UsersModel, type: UserType) {

        if (!type) return of(null);

        const api = type === UserType.JobSeeker
            ? this.jobseekerUrl : type === UserType.Employer
                ? this.employerUrl : null;
        // const fd = new FormData();
        // fd.append('Email', model.email);
        // fd.append('Password', model.password);
        // fd.append('IsPersistent', `${model.isPersistent}`);
        return this.http.post<ResponseModel>(`${api}/Login`, model).pipe(
            tap(res => localStorage.setItem('X-JWT-Token', res?.contentBody?.token))
            );
    }

    /**
     *  log out active user authentication from server & client
      * @param type type of the user E.G. employer, jobseeker etc.,
     */
    userLogout(type: UserType): Observable<ResponseModel> {
        localStorage.removeItem('X-JWT-Token');
        if (!type) return of(null);

        const api = type === UserType.JobSeeker
            ? this.jobseekerUrl : type === UserType.Employer
                ? this.employerUrl : null;

        return this.http.get<ResponseModel>(`${api}/Logout`, {
            withCredentials: true
        });

    }

    /**
     * Checks whether the active session is a valid user. If so, get user information
     */
    isUserSessionValid(type: UserType): Observable<ResponseModel> {

        // const prefix = this.cookieService.get(CookieKeys.Subject);
        const u = `${this.rootAccountValidationUrl(type)}/IsValid`;

        return this.http.get<ResponseModel>(u, {
            // this will make authentication of cookie of origins
            withCredentials: true,
        });

    }

    isActiveAccount = (type: UserType) => this.http.get<boolean>(`${this.rootAccountValidationUrl(type)}/IsActive`, {
        withCredentials: true
    })

    private rootAccountValidationUrl(type: UserType) {
        // reuse within the auth service
        return this.url.createUrl('Account', `${type}/Security`);
    }
}


