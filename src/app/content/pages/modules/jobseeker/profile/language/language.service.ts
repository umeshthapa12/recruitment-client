import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ResponseModel } from '../../../../../../models';
import { BaseUrlCreator } from '../../../../../../utils';
import { LanguageModel, SectionKey, StarModel } from './language.model';

export const STARS: StarModel[] = [
    { key: 1, text: 'Very poor', isSelected: false, isFocused: false },
    { key: 2, text: 'Poor', isSelected: false, isFocused: false },
    { key: 3, text: 'Fair', isSelected: false, isFocused: false },
    { key: 4, text: 'Good', isSelected: false, isFocused: false },
    { key: 5, text: 'Excellent', isSelected: false, isFocused: false },
];

@Injectable()
export class LanguageService {

    private api: string = this.url.createUrl('Language', 'jobseeker');

    constructor(
        private url: BaseUrlCreator,
        private http: HttpClient
    ) { }

    getLanguages<T extends ResponseModel>(): Observable<T> {
        // simulate loading bar. Demo only
        // we do not want to mutate master data so we map to create new instead
        // return of(LANGUAGES.map(el => ({ ...el }))).pipe(delay(700));

        return this.http.get<T>(`${this.api}/Get`)
            .pipe(delay(1500));
    }

    getLanguage<T extends ResponseModel>(id: number): Observable<T> {
        // const el = LANGUAGES.find(_ => _.id === id);
        // simulate loading bar. Demo only
        // we do not want to mutate master so we create a new object
        // return of({ ...el }).pipe(debounceTime(1500));

        return this.http.get<T>(`${this.api}/Get/${id}`);
    }

    addOrUpdateLanguage<T extends ResponseModel>(body: LanguageModel): Observable<T> {
        // body.id = Math.max(...LANGUAGES.map(_ => _.id)) + 1;
        // // simulate loading bar. Demo only
        // return of(body).pipe(debounceTime(1500));

        const isUpdate = body.id > 0;
        const req = isUpdate
            ? this.http.put<T>(`${this.api}/update`, body)
            : this.http.post<T>(`${this.api}/Create`, body);

        return req;
    }

    deleteLanguage<T extends ResponseModel>(id: number): Observable<T> {
        // if (id <= 0) // id must have valid number
        //     of(throwError(typeof (id) + ' is not greater than zero'));
        // simulate loading bar. Demo only
        // const index = LANGUAGES.findIndex(_ => _.id === id);
        // LANGUAGES.splice(index, 1);
        // return of(id).pipe(debounceTime(1500));

        return this.http.delete<T>(`${this.api}/Delete/${id}`);
    }

    populateStars(langName: string): StarModel[] {
        return STARS.map(el => ({ ...el, lang: langName }));
    }

}

export const LANGUAGES: LanguageModel[] = [
    {
        id: 1, languageName: 'Nepali',
        selectedStars: [
            { sectionKey: SectionKey.Read, value: 4 },
            { sectionKey: SectionKey.Write, value: 2 },
            { sectionKey: SectionKey.Listen, value: 1 },
            { sectionKey: SectionKey.Speak, value: 5 },
        ]
    },
    {
        id: 2, languageName: 'English',
        selectedStars: [
            { sectionKey: SectionKey.Read, value: 1 },
            { sectionKey: SectionKey.Write, value: 2 },
            { sectionKey: SectionKey.Listen, value: 5 },
            { sectionKey: SectionKey.Speak, value: 5 },
        ]
    },
    {
        id: 3, languageName: 'Japanese',
        selectedStars: [
            { sectionKey: SectionKey.Read, value: 5 },
            { sectionKey: SectionKey.Write, value: 2 },
            { sectionKey: SectionKey.Listen, value: 2 },
            { sectionKey: SectionKey.Speak, value: 2 },
        ]
    },
    {
        id: 4, languageName: 'Korean',
        selectedStars: [
            { sectionKey: SectionKey.Read, value: 1 },
            { sectionKey: SectionKey.Write, value: 5 },
            { sectionKey: SectionKey.Listen, value: 2 },
            { sectionKey: SectionKey.Speak, value: 5 },
        ]
    },
    {
        id: 5, languageName: 'Hindi',
        selectedStars: [
            { sectionKey: SectionKey.Read, value: 2 },
            { sectionKey: SectionKey.Write, value: 4 },
            { sectionKey: SectionKey.Listen, value: 1 },
            { sectionKey: SectionKey.Speak, value: 1 },
        ]
    },
];

