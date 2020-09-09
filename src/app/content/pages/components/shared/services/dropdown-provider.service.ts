import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DropdownModel, ResponseModel } from '../../../../../models';
import { BaseUrlCreator } from '../../../../../utils';

@Injectable()
export class DropdownProviderService {

    private readonly url = this.baseUrl.createUrl('Dropdowns', 'Shared');

    constructor(
        private http: HttpClient,
        private baseUrl: BaseUrlCreator) { }

    getCountries<T extends DropdownModel[]>(): Observable<T> {
        return this.http.get<T>(`${this.url}/GetCountries`);
    }

    getProvinces<T extends DropdownModel[]>(countryId: number): Observable<T> {
        return this.http.get<T>(`${this.url}/GetProvinces/${countryId}`);
    }

    getDistricts<T extends DropdownModel[]>(provinceId: number): Observable<T> {
        return this.http.get<T>(`${this.url}/GetDistricts/${provinceId}`);
    }

    getMunicipalities<T extends DropdownModel[]>(countryId: number, provinceId: number, districtId: number): Observable<T> {
        return this.http.get<T>(`${this.url}/GetMunicipalities/${countryId}/${provinceId}/${districtId}`);
    }

    getDepartments<T extends DropdownModel[]>(): Observable<T> {
        return this.http.get<T>(`${this.url}/GetDepartments`);
    }

    GetDesignations<T extends DropdownModel[]>(): Observable<T> {
        return this.http.get<T>(`${this.url}/GetDesignations`);
    }

    getJobCategories<T extends DropdownModel[]>(): Observable<T> {
        return this.http.get<T>(`${this.url}/GetJobCategory`);
    }

    getJobLocations<T extends DropdownModel[]>(): Observable<T> {
        return this.http.get<T>(`${this.url}/GetJobLocations`);
    }

    getGender<T extends DropdownModel[]>(): Observable<T> {
        return this.http.get<T>(`${this.url}/GetGender`);
    }

    getSalutation<T extends DropdownModel[]>(): Observable<T> {
        return this.http.get<T>(`${this.url}/GetSalutation`);
    }

    getMaritalStatus<T extends DropdownModel[]>(): Observable<T> {
        return this.http.get<T>(`${this.url}/GetMaritalStatus`);
    }

    getStages<T extends any[]>(): Observable<T> {
        return this.http.get<T>(`${this.url}/GetStages`);
    }

    getQualifications<T extends DropdownModel[]>(): Observable<T> {
        return this.http.get<T>(`${this.url}/GetQualifications`);
    }

    getStudyModes<T extends DropdownModel[]>(): Observable<T> {
        return this.http.get<T>(`${this.url}/GetStudyModes`);
    }

    getCompanyTypes<T extends DropdownModel[]>(): Observable<T> {
        return this.http.get<T>(`${this.url}/GetCompanyTypes`);
    }

    getMailTemplateTitles<T extends DropdownModel[]>(): Observable<T> {
        return this.http.get<T>(`${this.url}/GetMailTemplateTitles`);
    }

    getMailTemplateBody<T extends ResponseModel>(templateId: number): Observable<T> {
        return this.http.get<T>(`${this.url}/GetMailTemplateTitles/${templateId}`);
    }

    getExperienceLevel<T extends DropdownModel[]>(): Observable<T> {
        return this.http.get<T>(`${this.url}/GetExperienceLevel`);
    }

    getReligion<T extends DropdownModel[]>(): Observable<T> {
        return this.http.get<T>(`${this.url}/GetReligion`);
    }

    getJobTypes<T extends DropdownModel[]>(): Observable<T> {
        return this.http.get<T>(`${this.url}/GetJobTypes`);
    }

    getStatus<T extends DropdownModel[]>(): Observable<T> {
        return this.http.get<T>(`${this.url}/GetStatus`);
    }

    getFilterConditions<T extends DropdownModel[]>(): Observable<T> {
        return this.http.get<T>(`${this.url}/GetFilterConditions`);
    }

    getOpeningServiceTypes<T extends DropdownModel[]>(): Observable<T> {
        return this.http.get<T>(`${this.url}/GetOpeningServiceTypes`);
    }

    getAllJobLocations<T extends DropdownModel[]>(): Observable<T> {
        return this.http.get<T>(`${this.url}/GetAllJobLocations`);
    }

    getActiveCategories<T extends { counts: number, category: DropdownModel }[]>(): Observable<T> {
        return this.http.get<T>(`${this.url}/GetActiveJobCategories`);
    }

    getPageCoverNav = () => this.http.get<any>(`${this.url}/GetPublicNav`);

    getDynamicFormTitles = <T extends DropdownModel[]>() => this.http.get<T>(`${this.url}/GetDynamicFormTitles`);

    getDynamicFormMetadata = <T>(dataId: number) => this.http.get<T>(`${this.url}/GetDynamicFormMetadata/${dataId}`);

     /**
    * Gets job location tags by search term
    */
   getLocationBySearchTerm = (term: string) => this.http.get<string[]>(`${this.url}/GetJobLocationBySearchTerm?q=${term}`);

   /**
   * Gets skill tags by search term
   */
   getSkillTagsBySearchTerm = (term: string) => this.http.get<string[]>(`${this.url}/GetSkillTagsBySearchTerm?q=${term}`);

}
