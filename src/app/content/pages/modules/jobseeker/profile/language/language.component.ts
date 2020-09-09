import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged, filter, switchMap, takeUntil } from 'rxjs/operators';
import { ResponseModel } from '../../../../../../models';
import { ExtendedMatDialog, fadeInOutStagger, fadeInUpEnterOnly } from '../../../../../../utils';
import { DeleteConfirmComponent } from '../../../../components/shared/delete-confirm/delete-confirm.component';
import { SnackToastService } from '../../../../components/shared/snakbar-toast/toast.service';
import { LanguageFormComponent } from './child/language-form.component';
import { LanguageModel, SectionKey, SelectedStarModel, StarModel } from './language.model';
import { LanguageService } from './language.service';


@Component({
    selector: 'app-language',
    templateUrl: './language.component.html',
    animations: [fadeInUpEnterOnly, fadeInOutStagger],
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [`
        .mat-elevation-z7-custom{
          transition:  box-shadow .3s ease-in
        }
        .mat-elevation-z7-custom:hover{
            box-shadow: 0 4px 5px -2px rgba(0,0,0,.2), 0 7px 10px 1px rgba(0,0,0,.14), 0 2px 16px 1px rgba(0,0,0,.12)
        }
    `]
})

export class LanguageComponent implements OnInit, OnDestroy, AfterViewInit {
    @HostBinding('class') class = 'display-block';
    formRef: MatDialogRef<LanguageFormComponent>;
    private toDestroy$ = new Subject<void>();

    // trun on/off loading bar/placeholder when http request being made
    isLoading: boolean;

    // current language id when user clicks to edit
    selectedLangId: number;

    languages: LanguageModel[] = [];

    editForm: FormGroup;

    // show/hide form submission process spinner
    isWorking: boolean;

    // form value to set when post, also init default value to view
    readonly userSelectedStars: SelectedStarModel[] = [
        { sectionKey: SectionKey.Read, value: 1 },
        { sectionKey: SectionKey.Write, value: 1 },
        { sectionKey: SectionKey.Listen, value: 1 },
        { sectionKey: SectionKey.Speak, value: 1 },
    ];

    // get current language index by selected language Id
    private get langIndex(): number {
        return this.languages.findIndex(_ => _.id === this.selectedLangId);
    }

    // set updated language name by index
    private set updateLanguageName(v: string) {
        this.languages[this.langIndex].languageName = v;
    }

    constructor(
        private lService: LanguageService,
        private dialog: MatDialog,
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef,
        private snackBar: SnackToastService,
        private dialogUtil: ExtendedMatDialog
    ) {
        this.editForm = this.fb.group({
            id: 0,
            languageName: [null, [Validators.required]],

            // init default value
            selectedStars: null  /* see SelectedStarModel  */
        });
    }

    ngOnInit() {
        this.isLoading = true;
        this.lService.getLanguages().pipe(
            takeUntil(this.toDestroy$)
        ).subscribe(l => this.prepareLanguage(l.contentBody),
            err => this.onError(err));
    }

    private prepareLanguage(l: LanguageModel[]) {
        this.cdr.markForCheck();
        // mutation happens here
        l.forEach(el => {

            if (!(el && el.selectedStars && el.selectedStars.length > 0)) {
                el.unselectedStars = this.lService.populateStars(el.languageName);
                return;
            }

            this.populateLangModel(el);

        });

        this.isLoading = false;

        this.languages = l;
    }

    ngAfterViewInit() {
        this.editForm.get('languageName').valueChanges.pipe(
            filter(_ => this.langIndex > -1),
            takeUntil(this.toDestroy$),
            debounceTime(400),
            distinctUntilChanged()
        ).subscribe(name => this.updateLanguageName = name);
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    onAdd() {
        const dialogConfig = {
            disableClose: true,
            data: null,
            width: '400px'
        };

        const instance = this.dialog.open(LanguageFormComponent, dialogConfig);

        instance.afterClosed().pipe(
            takeUntil(this.toDestroy$),
            filter((_: ResponseModel) => _ && _.contentBody.selectedStars && _.contentBody.selectedStars.length > 0)
        ).subscribe(res => {

            // must call this fn to update changes on view
            this.cdr.markForCheck();

            this.populateLangModel(res.contentBody);

            this.languages.unshift(res.contentBody);

            // this is a success toast
            this.onSuccess(res);
        });

        this.dialogUtil.animateBackdropClick(instance);
    }

    private populateLangModel(lang: LanguageModel) {
        lang.selectedStars.forEach(m => {
            const stars = this.lService.populateStars(lang.languageName);
            stars.forEach((r) => {
                r.sectionKey = m.sectionKey;
                if (m.value >= r.key) {
                    r.isSelected = true;
                    this.setStarValuesWhenStarSelected(r);
                }
                r.langId = lang.id;

            });

            switch (m.sectionKey) {
                case SectionKey.Read:
                    lang.read = stars;
                    break;
                case SectionKey.Write:
                    lang.write = stars;
                    break;
                case SectionKey.Listen:
                    lang.listen = stars;
                    break;
                case SectionKey.Speak:
                    lang.speak = stars;
                    break;
            }
        });
    }

    // determine selected star model and mmark as selected
    starClicked(s: StarModel) {
        // track changes
        this.cdr.markForCheck();

        const index = this.languages.findIndex(_ => _.id === s.langId);
        if (index <= -1) return;

        const mutateStars = s.sectionKey === SectionKey.Read ? this.languages[index].read :
            s.sectionKey === SectionKey.Write ? this.languages[index].write :
                s.sectionKey === SectionKey.Listen ? this.languages[index].listen :
                    s.sectionKey === SectionKey.Speak ? this.languages[index].speak : [];

        // muttation happens here
        mutateStars.forEach(_ => {
            if (s.key >= _.key) {
                _.isSelected = true;
            } else {
                _.isSelected = false;
            }
        });

        this.setStarValuesWhenStarSelected(s);
    }

    private setStarValuesWhenStarSelected(s: StarModel) {
        const index = this.userSelectedStars.findIndex(_ => _.sectionKey === s.sectionKey);
        if (index > -1)
            this.userSelectedStars[index].value = s.key;
        else this.userSelectedStars.push({ sectionKey: s.sectionKey, value: s.key });

        this.editForm.get('selectedStars').setValue(this.userSelectedStars);
    }

    updateLanguage() {

        this.cdr.markForCheck();
        this.isWorking = true;

        this.lService.addOrUpdateLanguage(this.editForm.value).pipe(
            takeUntil(this.toDestroy$),
            delay(800)
        ).subscribe(res => {
            this.cdr.markForCheck();
            // TODO: response is arrived

            // this is success toast
            this.onSuccess(res);

            this.isWorking = false;
        }, e => this.onError(e));
    }

    onEditClicked(langId) {

        this.cdr.markForCheck();
        this.selectedLangId = langId;

        this.lService.getLanguage(langId).pipe(
            takeUntil(this.toDestroy$)
        ).subscribe(res => {
            const l: LanguageModel = res.contentBody;
            this.editForm.get('languageName').setValue(l ? l.languageName : null);
            this.editForm.get('id').setValue(langId);
        }, e => this.onError(e));
    }

    onDelete(id: number) {
        this.dialog.open(DeleteConfirmComponent).afterClosed()
            .pipe(
                takeUntil(this.toDestroy$),
                filter(yes => yes),
                switchMap(() => this.lService.deleteLanguage(id).pipe(takeUntil(this.toDestroy$))),
                delay(600)
            )
            .subscribe(res => {

                this.cdr.markForCheck();

                // this is success toast
                this.onSuccess(res);

                const index = this.languages.findIndex(_ => _.id === id);
                if (index > -1)
                    this.languages.splice(index, 1);

            }, e => this.onError(e));
    }

    private onSuccess(res: ResponseModel) {
        this.cdr.markForCheck();


        // init snackbar
        this.snackBar.when('success', res);

        this.selectedLangId = 0;

    }

    private onError(ex: any) {

        this.cdr.markForCheck();
        this.snackBar.when('danger', ex);
        this.isWorking = false;

        this.selectedLangId = 0;

        this.isLoading = false;

    }

}
