import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CriteriaModel, DynamicFormMetadata, MandatoryModel, OpeningModel, QualificationModel, QueryModel, ResponseModel } from '../../../../../../models';
import { BaseUrlCreator, ParamGenService } from '../../../../../../utils';

@Injectable({ providedIn: 'root' })
export class JobService {

    private readonly api = this.url.createUrl('Job', 'Employer');

    constructor(
        private http: HttpClient,
        private url: BaseUrlCreator,
        private paramGen: ParamGenService,
    ) { }

    /**
     * Gets openings
     */
    getOpenings(params?: QueryModel) {

        const p = this.paramGen.createParams(params);
        return this.http.get<ResponseModel>(`${this.api}/Get`, { params: p });
    }

    /**
     * Gets an opening by Id
     */
    getOpening = (id: number) => this.http.get<ResponseModel>(`${this.api}/Get/${id}`);

    /**
     * Gets an opening by Id
     */
    getLazyOpening = (id: number) => this.http.get<ResponseModel>(`${this.api}/GetLazy/${id}`);

    /**
     * Updates an opening.
     * @param body payload
     */
    addOrUpdateOpening(body: OpeningModel) {

        return body.id > 0
            ? this.http.put<ResponseModel>(`${this.api}/Update`, body)
            : this.http.post<ResponseModel>(`${this.api}/Create`, body);
    }

    /**
    * Updates opening's status
    * @param body payload
    */
    updateStatus = (body: OpeningModel) => this.http.put<ResponseModel>(`${this.api}/UpdateStatus`, body);

    /**
     * Removes an opening
     * @param id element Id
     */
    deleteOpening = (id: number) => this.http.delete<ResponseModel>(`${this.api}/Delete/${id}`);

    /**
     * @param body a criteria model
     */
    addOrUpdateCriteria = (body: CriteriaModel) => this.http.put<ResponseModel>(`${this.api}/UpdateCriteria`, body);

    /**
     * @param openingId id of an opening
     */
    getCriteria = (openingId: number) => this.http.get<ResponseModel>(`${this.api}/GetCriteria/${openingId}`);

    /**
     * @param id a opening Id
     */
    removeCriteria = (id: number) => this.http.delete<ResponseModel>(`${this.api}/DeleteCriteria/` + id);

    /**
     * @param body a qualification model
     */
    addOrUpdateQualification = (body: QualificationModel[]) => this.http.put<ResponseModel>(`${this.api}/UpdateQualifications`, body);

    /**
     * @param openingId id of an opening
     */
    getQualification = (openingId: number) => this.http.get<ResponseModel>(`${this.api}/GetQualifications/${openingId}`);

    /**
     * @param id a opening Id
     */
    removeQualification = (id: number) => this.http.delete<ResponseModel>(`${this.api}/DeleteQualification/` + id);

    /**
    * @param body a qualification model
    */
    addOrUpdateMandatory = (body: MandatoryModel[]) => this.http.put<ResponseModel>(`${this.api}/UpdateMandatory`, body);

    /**
     * @param openingId id of an opening
     */
    getMandatory = (openingId: number) => this.http.get<ResponseModel>(`${this.api}/GetMandatory/${openingId}`);

    /**
     * @param id a opening Id
     */
    removeMandatory = (id: number) => this.http.delete<ResponseModel>(`${this.api}/DeleteMandatory/` + id);

    /**
    * @param body a dynamic questionnaire form metadata
    */
    addOrUpdateDynamicForm = (body: DynamicFormMetadata) => this.http.put<ResponseModel>(`${this.api}/UpdateDynamicForm`, body);

    /**
     * @param openingId id of an opening
     */
    getDynamicForm = (openingId: number) => this.http.get<ResponseModel>(`${this.api}/GetDynamicForm/${openingId}`);

    /**
     * @param id a opening Id
     */
    removeDynamicFormData = (id: number) => this.http.delete<ResponseModel>(`${this.api}/DeleteDynamicForm/` + id);

}
