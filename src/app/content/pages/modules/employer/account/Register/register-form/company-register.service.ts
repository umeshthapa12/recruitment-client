import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../../../environments/environment';
import { ResponseModel } from '../../../../../../../models';
import { BaseUrlCreator } from '../../../../../../../utils';
import { ICompany } from './register.model';

@Injectable()

export class CompanyRegisterService {

  private dropdowns = this.url.createUrl('Dropdowns', 'Shared');
  private baseUrl = environment.baseUrl + '/employer/api/v2.0/account';

  constructor(
    private http: HttpClient,
    private url: BaseUrlCreator
  ) { }

  registercompany(body: ICompany): Observable<any> {
    const res = this.http.post<any>(`${this.baseUrl}/register`, body);
    return res;
  }

  getCompTypes(): Observable<any> {
    return this.http.get(`${this.dropdowns}/GetCompanyTypes`);
  }

  lookup(query: string): Observable<ResponseModel> {
    return this.http.get(`${this.baseUrl}/lookup?q=${query}`);
  }
}
