import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResponseModel } from '../../../../models';
import { BaseUrlCreator } from '../../../../utils';

@Injectable({ providedIn: 'root' })
export class SharedJobService {

    private api = this.baseUrl.createUrl('Job', 'Jobs');
    private statsApi = this.baseUrl.createUrl('Stats', 'JobSeeker');

    constructor(
        private http: HttpClient,
        private baseUrl: BaseUrlCreator) { }

    getRecentOpeningsTitleOnly = () => this.http.get<ResponseModel>(`${this.api}/GetRecentOpenings`);
    getMatchingJobs = (isAll?: boolean) => this.http.get<ResponseModel>(`${this.statsApi}/GetMatchingJobs${isAll ? '?isAll=true' : ''}`);
    getProfileStatus = () => this.http.get<ResponseModel>(`${this.statsApi}/GetProfileStatus`);
    getProfileStrength = () => this.http.get<ResponseModel>(`${this.statsApi}/GetProfileStrength`);
    getFavJobs = (isAll?: boolean) => this.http.get<ResponseModel>(`${this.statsApi}/GetFavoriteJobs${isAll ? '?isAll=true' : ''}`);
    getAppliedJobs = (isAll?: boolean) => this.http.get<ResponseModel>(`${this.statsApi}/GetAppliedJobs${isAll ? '?isAll=true' : ''}`);
    removeFavJob = (id: number) => this.http.delete<ResponseModel>(`${this.statsApi}/RemoveFavorite/` + id);
    quickUpdate = (body: { fullName: string, title: string }) => this.http.put<ResponseModel>(`${this.statsApi}/QuickUpdate/`, body);

}
