import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChildren } from '@angular/core';
import { FormBuilder, FormControlName, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fromEvent, merge, Observable, Subject } from 'rxjs';
import { debounceTime, delay, filter, takeUntil } from 'rxjs/operators';
import { fadeInUpEnterOnly, GenericValidator } from '../../../../../../../utils';
import { ChangesConfirmComponent } from '../../../../../components/shared/changes-confirm/changes-confirm.component';
import { SnackToastService } from '../../../../../components/shared/snakbar-toast/toast.service';
import { SectionKey, SelectedStarModel, StarModel } from '../language.model';
import { LanguageService } from '../language.service';

@Component({
    selector: 'lang-form',
    templateUrl: './language-form.component.html',
    animations: [fadeInUpEnterOnly]
})

export class LanguageFormComponent implements OnInit, AfterViewInit, OnDestroy {

    languageForm: FormGroup;

    private toDestroy$ = new Subject<void>();

    // confirm dialog
    // private changesConfirmRef: MatDialogRef<ChangesConfirmComponent>;

    // for validation
    @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
    private genericValidator: GenericValidator;
    displayMessage: { [key: string]: string } | any = {};

    // form value to set when post, also init default value to view
    private userSelectedStars: SelectedStarModel[] = [
        { sectionKey: SectionKey.Read, value: 1 },
        { sectionKey: SectionKey.Write, value: 1 },
        { sectionKey: SectionKey.Listen, value: 1 },
        { sectionKey: SectionKey.Speak, value: 1 },
    ];

    // all section stars
    stars: {
        [SectionKey.Read]?: StarModel[],
        [SectionKey.Write]?: StarModel[],
        [SectionKey.Listen]?: StarModel[],
        [SectionKey.Speak]?: StarModel[],
    } = {};

    // ref to view
    key = SectionKey;

    // show/hide form submission process spinner
    isWorking: boolean;

    constructor(
        private fb: FormBuilder,
        private lService: LanguageService,
        private dialog: MatDialog,
        private snackBar: SnackToastService,
        public formRef: MatDialogRef<LanguageFormComponent>,
        @Inject(MAT_DIALOG_DATA)
        public data: { id: number }
    ) {
        this.genericValidator = new GenericValidator({
            'languageName': {
                'required': 'This field is required.'
            }
        });

        // init stars
        this.initStars();
    }

    private initStars(model?: SelectedStarModel[]) {
        if (!(model && model.length > 0)) {
            this.stars[SectionKey.Read] = this.populateWithSection(SectionKey.Read);
            this.stars[SectionKey.Write] = this.populateWithSection(SectionKey.Write);
            this.stars[SectionKey.Listen] = this.populateWithSection(SectionKey.Listen);
            this.stars[SectionKey.Speak] = this.populateWithSection(SectionKey.Speak);
        } else {
            model.forEach(m => {
                const r = this.populateWithSection(m.sectionKey);
                r.forEach(_ => _.isSelected = _.key <= m.value);
                this.stars[m.sectionKey] = r;
            });
        }
    }

    populateWithSection(s: SectionKey) {
        // get stars from loacal
        const st = this.lService.populateStars('new');
        st.forEach(_ => [_.sectionKey = s]);

        // make 1st star selected as default

        st[0].isSelected = true;
        return st;
    }

    ngOnInit() {
        this.languageForm = this.fb.group({
            id: 0,
            languageName: [null, [Validators.required]],

            // init default value
            selectedStars: [this.userSelectedStars]  /* see SelectedStarModel  */
        });
    }


    ngAfterViewInit() {
        this.validation();
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    // when user clicks to any star, get the key of it to set value. `keyRange: 1 -5`
    starClicked(s: StarModel) {
        const index = this.userSelectedStars.findIndex(_ => _.sectionKey === s.sectionKey);
        if (index > -1)
            this.userSelectedStars[index].value = s.key;
        else this.userSelectedStars.push({ sectionKey: s.sectionKey, value: s.key });

        this.languageForm.get('selectedStars').setValue(this.userSelectedStars);
    }

    onSubmit() {

        if (this.languageForm.invalid) return;

        this.isWorking = true;

        // submit the form and close dialog with response args
        this.lService.addOrUpdateLanguage(this.languageForm.value)
            .pipe(takeUntil(this.toDestroy$), delay(1500)).subscribe(res => [this.formRef.close(res), this.isWorking = false], err => {

                this.snackBar.when('danger', err);

                this.isWorking = false;
            });
    }

    onCancel() {
        if (this.languageForm.dirty)
            this.dialog.open(ChangesConfirmComponent).beforeClosed().pipe(
                takeUntil(this.toDestroy$),
                filter(_ => _)
            ).subscribe(_ => this.formRef.close());

        else this.formRef.close();
    }

    private validation() {
        const controlBlurs: Observable<any>[] = this.formInputElements
            .map(fCtrl => fromEvent(fCtrl.nativeElement, 'blur'));
        merge(this.languageForm.valueChanges, ...controlBlurs)
            .pipe(
                debounceTime(800),
                takeUntil(this.toDestroy$),
            ).subscribe(_ => this.displayMessage =
                this.genericValidator.processMessages(this.languageForm));
    }
}
