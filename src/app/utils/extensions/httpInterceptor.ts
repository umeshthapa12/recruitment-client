import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class WithCredentialsInterceptor implements HttpInterceptor {

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        request = request.clone({
            withCredentials: true,
            setHeaders: {
                'X-JWT-Token': (localStorage.getItem('X-JWT-Token') || ''),
                'Authorization': 'Bearer ' + (localStorage.getItem('X-JWT-Token') || '')
            }
        });

        return next.handle(request);
    }
}
