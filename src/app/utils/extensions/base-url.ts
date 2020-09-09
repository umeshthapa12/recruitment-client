import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BaseUrlCreator {

    createUrl(controller: string, area?: string): string {

        return !area
            ? `${environment.baseUrl}/api/v2.0/${controller}`
            : `${environment.baseUrl}/${area}/api/v2.0/${controller}`;

    }
}
