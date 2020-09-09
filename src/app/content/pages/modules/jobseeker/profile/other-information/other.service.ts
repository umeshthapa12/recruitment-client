import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseUrlCreator } from '../../../../../../utils';
@Injectable()

export class OtherService {
    private readonly api: string = this.url.createUrl('other', 'Joobseeker');

    constructor(
        private readonly http: HttpClient,
        private readonly url: BaseUrlCreator) {

    }
}
