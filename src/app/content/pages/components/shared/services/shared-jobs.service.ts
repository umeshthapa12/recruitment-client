import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JobSeekerApplication, JobTypeRouteEnums, ResponseModel } from '../../../../../models';
import { AdvFilterModel, QueryModel } from '../../../../../models/filter-sort-pager.model';
import { BaseUrlCreator, ParamGenService } from '../../../../../utils';
import { of } from 'rxjs';
interface Body {
    openingId: number;
    questionnaire: { question: string, answer: string[], options?: string[] }[];
    isValidationDone: boolean;
}
@Injectable({ providedIn: 'root' })
export class SharedJobService {

    private api = this.baseUrl.createUrl('Job', 'Jobs');

    constructor(
        private http: HttpClient,
        private baseUrl: BaseUrlCreator,
        private paramGen: ParamGenService) { }

    getGroupedJobs = (params?: QueryModel) => {

        const p = this.paramGen.createParams(params);

        return this.http.get<ResponseModel>(`${this.api}/Get`, { params: p });
    }

    getNewspaperJobs = (params?: QueryModel) => {

        const p = this.paramGen.createParams(params);

        return this.http.get<ResponseModel>(`${this.api}/GetNewspaper`, { params: p });
    }

    getJobLists = (params?: QueryModel, byTypes?: JobTypeRouteEnums, searchTerm?: string, adv?: AdvFilterModel) => {

        let p = this.paramGen.createParams(params);
        const st = (searchTerm || '').trim();

        // either advance search or input search if supplied.
        if (adv) {
            if (adv.categories)
                adv.categories.forEach(c => p = p.append('jobCategoryId', c));
            if (adv.jobType)
                adv.jobType.forEach(c => p = p.append('jobTypeId', c));
            if (adv.education)
                adv.education.forEach(c => p = p.append('eduId', c));
            if (adv.experienceLevel)
                adv.experienceLevel.forEach(c => p = p.append('experienceLevel', c));
            if (adv.location)
                adv.location.forEach(c => p = p.append('locations', c));

        } else {

            if (st.length > 0)
                p = p.append('s', st);
        }

        if (byTypes)
            p = p.append('q', byTypes);

        return this.http.get<ResponseModel>(`${this.api}/GetOpeningsList`, { params: p });
    }

    getJobById = (id: number) => this.http.get<ResponseModel>(`${this.api}/Get/${id}`);

    getSimilarOpeningsTitleOnly = (similarText: string) =>
        this.http.get<ResponseModel>(`${this.api}/GetSimilarOpenings?val=${similarText}`)

    apply = (body: JobSeekerApplication) => this.http.post<ResponseModel>(`${this.api}/Apply`, body);

    applyByCriteriaConfirm = (body: JobSeekerApplication) => this.http.post<ResponseModel>(`${this.api}/ApplyIneligible`, body);

    applyWhenValidationDone = (body: Body) => this.http.post<ResponseModel>(`${this.api}/ApplyWhenValidationDone`, body);

    updateJobLikes = (openingId: number, isLiked: boolean) => this.http.post<ResponseModel>(`${this.api}/ToggleLike/${openingId}/${isLiked}`, null);

    getLikedJobsIds = () => this.http.get<ResponseModel>(`${this.api}/GetLikedJobs`, { withCredentials: true });

    updateFav = (openingId: number, isLiked: boolean) => {
        if (openingId > 0) return this.http.post<ResponseModel>(`${this.api}/ToggleFav/${openingId}/${isLiked}`, null);
        return of(<ResponseModel>{});
    }

    getFavJobsIds = () => this.http.get<ResponseModel>(`${this.api}/GetFavJobs`, { withCredentials: true });
    getAppliedJobIds = () => this.http.get<ResponseModel>(`${this.api}/GetApplied`, { withCredentials: true });

    getCompanyJobs = (employerId: number) => this.http.get<ResponseModel>(`${this.api}/GetCompanyJobs/${employerId}`);

}
