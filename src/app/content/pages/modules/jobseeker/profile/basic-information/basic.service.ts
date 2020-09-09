import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../../../environments/environment';
import { FileUrlsModel, ResponseModel } from '../../../../../../models';
import { BaseUrlCreator } from '../../../../../../utils';
import { ProfileModel } from '../../../shared/models';

@Injectable()
export class ProfileService {

    private api = this.url.createUrl('Profile', 'Jobseeker');
    
    constructor(
        private http: HttpClient,
        private url: BaseUrlCreator
    ) { }

    getBasicInfo<T extends ResponseModel>(): Observable<T> {
        return this.http.get<T>(`${this.api}/Get`);
    }

    updateBasicInfo<T extends ResponseModel>(body: ProfileModel): Observable<T> {

        return this.http.put<T>(`${this.api}/Update`, body);
    }

    getProfilePictures<T extends ResponseModel>(): Observable<T> {
        return this.http.get<T>(`${this.api}/GetProfilePicture`)
            .pipe(
                map(res => {

                    const u: FileUrlsModel[] = res.contentBody;
                    u.forEach(_ => {
                        const gt = `${environment.baseUrl}/${_.getUrl}`.replace('//', '/');
                        const dl = `${environment.baseUrl}/${_.deleteUrl}`.replace('//', '/');
                        // modify urls with API endpoint
                        _.getUrl = gt;
                        _.deleteUrl = dl;
                    });
                    res.contentBody = [...u];

                    return res;
                })
            );
    }

    addProfilePicture<T extends ResponseModel>(fd: FormData): Observable<T> {
        return this.http.post<T>(`${this.api}/UploadProfilePicture`, fd).pipe(
            map(res => {
                const u: FileUrlsModel = res.contentBody;
                const gt = `${environment.baseUrl}/${u.getUrl}`.replace('//', '/');
                const dl = `${environment.baseUrl}/${u.deleteUrl}`.replace('//', '/');
                // modify urls with API endpoint
                u.getUrl = gt;
                u.deleteUrl = dl;

                res.contentBody = { ...u };

                return res;
            })
        );
    }

    deleteProfilePicture<T extends ResponseModel>(url: string): Observable<T> {
        return this.http.delete<T>(url);
    }

    updateImgStatus = (status: string, uFilename: string) => this.http.put<ResponseModel>(`${this.api}/UpdateImgStatus`, { status: status, fileUniqueId: uFilename });
}
