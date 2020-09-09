import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import Cropper from 'cropperjs';
import Quill from 'quill';
import { Subject, timer } from 'rxjs';
import { debounceTime, delay, filter, takeUntil, withLatestFrom } from 'rxjs/operators';
import { FileUrlsModel, ResponseModel, UserType } from '../../../../../../models';
import { IsUserLoggedInAction } from '../../../../../../store/app-store';
import { ExtendedMatDialog, fadeInOutStagger } from '../../../../../../utils';
import { SnackToastService } from '../../../../components/shared/snakbar-toast/toast.service';
import { ProfileModel } from '../../../shared/models';
import { BasicInfoFormComponent } from './basic-info-form.component';
import { BasicInfoService } from './basic-info.service';
import { ContactPersonFormComponent } from './contact-person-form.component';
import { ExtraSetupFormComponent } from './extra-setup-form.component';

@Component({
  templateUrl: './basic-info.component.html',
  animations: [fadeInOutStagger],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .container{
        padding:0px;
        min-height:10px;
        max-height: 400px;
        box-shadow: 0 3px 5px -1px rgba(0,0,0,.2), 0 5px 8px 0 rgba(0,0,0,.14), 0 1px 14px 0 rgba(0,0,0,.12);

    }
    .img-drag-tip{
        display: flex;
        position: absolute;
        color: #fff;
        z-index: 1;
        top: 45%;
        left: 37%;
        background: #444343b3;
        border: 1px solid;
        padding: 2px 5px;
        border-radius: 3px;
    }

    #info-tip:before{
        font-weight: 600;
    }
    .custom-air{
        box-shadow: 0px 3px 20px 0px rgba(113,106,202,0.17) !important;
    }

    .middle {
        transition: .2s cubic-bezier(.43,.24,.73,.92),
                    transform .3s cubic-bezier(.82,.37,.47,1.26),
                    border-radius .4s cubic-bezier(1,.75,.28,.61);
		opacity: 0;
		position: absolute;
		display: flex;
        justify-content: center;
        align-items: center;
        top: 27%;
        left: 22%;
        height: 50%;
        width: 50%;
        transform: scale(0);
        border-radius: 100%;
    }

    .img-wrap{
        transition: box-shadow .2s cubic-bezier(.82,.37,.47,1.26),
        transform .3s cubic-bezier(.85,.08,.29,.94);
        min-height: 145px;
        height: 100%;
        width: 100%;
        background-repeat: no-repeat !important;
        background-size: cover !important;
        background-position: center !important;
        position: relative;
    }

    .img-wrap:hover {
        box-shadow: 0 3px 5px -1px rgba(0,0,0,.2), 0 5px 8px 0 rgba(0,0,0,.14), 0 1px 14px 0 rgba(0,0,0,.12);
        transform: scale(1.1);
    }

    .img-wrap:hover .middle {
        opacity: 1;
        background:  #00132382;
        transform: scale(.95);
        box-shadow: 0px 0px 5px 0px rgba(113,106,202,.7);
        top:0;
        left:0;
        width:100%;
        height:100%;
        border-radius:0;
    }

    .crop-preview-text{
        margin-top: -19px;
        position: absolute;
        margin-left: 33%;
        background: #2229387a;
        color: #fff;
        padding: 0 5px;
        font-size: 12px;
        border: 1px solid #4799ea;
        opacity: 0.7;
    }
    #crop-preview-wrap:hover .crop-preview-text{
        opacity: 1;
    }
    `]
})
export class BasicInfoComponent implements OnInit, AfterViewInit, OnDestroy {

  profile: ProfileModel;

  private toDestroy$ = new Subject<void>();

  @ViewChild('container') editorContainer: ElementRef<HTMLElement>;

  @ViewChild('aboutCompany') aboutCompanyEl: ElementRef<HTMLElement>;
  @ViewChild('faq') faq: ElementRef<HTMLElement>;
  @ViewChild('tnc') tnc: ElementRef<HTMLElement>;
  @ViewChild('privacy') privacy: ElementRef<HTMLElement>;
  @ViewChild('disclaimer') disclaimer: ElementRef<HTMLElement>;

  // file format flag
  private readonly fileFormat = ['jpg', 'jpeg', 'png', 'bmp'];
  // an instance of cropper
  cropper: Cropper;
  // form data file
  profilePicture: Blob;
  // preview base64 data:image
  cropped: string;
  private crop = new Subject();
  // states
  dragTip: boolean;
  fileErrorMessage: string;
  selectedFile: File;

  // action states
  isWorking: boolean;
  isDeleting: boolean;
  isLoading: boolean = true;

  pictures: FileUrlsModel[] = [];

  favicon: string;
  faviconFormat: string;

  private wait = 0;

  constructor(
    private cdr: ChangeDetectorRef,
    private bService: BasicInfoService,
    private dialog: MatDialog,
    private snackBar: SnackToastService,
    private dialogUtil: ExtendedMatDialog,
    private store: Store
  ) {
  }

  ngOnInit() {

    this.bService.getBasicInfo().pipe(
      delay(1000),
      takeUntil(this.toDestroy$),
    ).subscribe(res => this.initProfile(res), e => this.onError(e));

    this.bService.getProfilePictures().pipe(
      takeUntil(this.toDestroy$)
    ).subscribe(res => [this.cdr.markForCheck(), this.pictures = [...res.contentBody]], e => this.onError(e));
  }

  private initProfile(_: ResponseModel) {
    this.isLoading = false;

    const p: ProfileModel = _.contentBody;

    // we might need to render either data or null
    this.profile = (p || {});

    // now we are gonna needed ViewChild to be render so we can use html element
    this.cdr.detectChanges();

    this.initQuillData(this.aboutCompanyEl.nativeElement, p.about);
    this.initQuillData(this.faq.nativeElement, p.faq);
    this.initQuillData(this.tnc.nativeElement, p.terms);
    this.initQuillData(this.privacy.nativeElement, p.privacy);
    this.initQuillData(this.disclaimer.nativeElement, p.disclaimer);

  }

  private initQuillData(el: HTMLElement, d: string) {
    if (!el || (d || '') === '') return;
    const ql = new Quill(el, {
      readOnly: true,
      modules: {
        toolbar: false
      }
    });
    ql.setContents(JSON.parse(d));
  }

  ngAfterViewInit() {

    this.crop.pipe(
      debounceTime(400),
      withLatestFrom(),
      // checks (undefined | null)
      filter(_ => this.cropper && this.selectedFile ? true : false),
      takeUntil(this.toDestroy$),
    ).subscribe(_ => {
      this.cdr.markForCheck();
      // set preview
      this.cropped = this.cropper.getCroppedCanvas().toDataURL('image/jpeg', 0.70);

      // set form data as a Blob
      this.cropper.getCroppedCanvas().toBlob(blob => this.profilePicture = blob, this.selectedFile.type, 0.65);
    });

  }

  prepHttpUrl(u: string) {
    const isHttp = (u.includes('https://') || u.includes('http://'));
    if (!isHttp)
      return u.replace(u, 'http://' + u);
    return u;
  }

  croppedSave() {
    this.isWorking = true;
    const fd = new FormData();

    fd.append('profilePicture', this.profilePicture, this.selectedFile.name);

    this.bService.addProfilePicture(fd).pipe(
      takeUntil(this.toDestroy$),
      delay(1500)
    ).subscribe(res => [this.cdr.markForCheck(), this.pictures.unshift(res.contentBody), this.imageRemoved(), this.onSuccess(res)], _ => this.onError(_));
  }

  onEdit(focusTo: string) {
    const data = { focusToElem: focusTo };
    const instance = this.dialog.open(BasicInfoFormComponent, {
      width: '850px',
      data: data ? data : null,
      autoFocus: false,
    });

    instance.afterClosed().pipe(
      takeUntil(this.toDestroy$),
      filter(d => d)
    ).subscribe((res: ResponseModel) => {

      this.cdr.markForCheck();
      this.snackBar.when('success', res);
      this.initProfile(res);
    });

    this.dialogUtil.animateBackdropClick(instance);
  }

  onExtraSetup(use4: string, text: string) {

    const data = { contentOf: use4, text: text, id: this.profile.id };

    const instance = this.dialog.open(ExtraSetupFormComponent, {
      width: '850px',
      data: data ? data : null,
      autoFocus: false,
      disableClose: true
    });

    instance.afterClosed().pipe(
      takeUntil(this.toDestroy$),
      filter(d => d)
    ).subscribe({
      next: (res: ResponseModel) => {

        this.cdr.markForCheck();
        this.snackBar.when('success', res);
        this.initProfile(res);
      }
    });

    this.dialogUtil.animateBackdropClick(instance);

  }

  onEditContactPerson(focusTo: string) {
    const data = { focusToElem: focusTo, content: this.profile };
    const instance = this.dialog.open(ContactPersonFormComponent, {
      width: '650px',
      data: data ? data : null,
      autoFocus: false,
    });

    instance.afterClosed().pipe(
      takeUntil(this.toDestroy$),
      filter(d => d)
    ).subscribe((res: ResponseModel) => {

      this.cdr.markForCheck();
      this.snackBar.when('success', res);
      this.initProfile(res);
    });

    this.dialogUtil.animateBackdropClick(instance);
  }

  ngOnDestroy() {
    this.toDestroy$.next();
    this.toDestroy$.complete();
  }

  imageSelected(fe: any) {

    const container = this.editorContainer.nativeElement;
    if (!container) {
      this.fileErrorMessage = 'Crop container not found.';
      return;
    }

    // cleanup before process
    this.imageRemoved();

    if (!fe) return;

    const file = <File>fe.target.files[0] || <File>fe.srcElement.files[0];
    if (!file) return;

    this.validateFileFormat(file);

    this.validateFileSize(file);

    this.selectedFile = file;

    const reader = new FileReader();

    // Read the contents of Image File.
    reader.readAsDataURL(file);

    // instantiate cropperjs
    reader.onload = (e: any, ) => {

      const image = document.createElement('img');
      image.style.width = '100%';

      // Set the Base64 string return from FileReader as source.
      image.src = e.target.result;
      // cleanup
      container.innerHTML = null;

      container.appendChild(image);

      // init cropper
      this.initCropperOnImageLoaded(image, container);

      timer(1000).pipe(takeUntil(this.toDestroy$)).subscribe(() => {
        container.scrollIntoView({ behavior: 'smooth' });

        // cleanup
        container.removeChild(image);
      });
    };
  }

  imageRemoved() {

    if (this.cropper) {
      this.cropper.clear();
      this.cropper.reset();
      this.cropper.destroy();
    }

    this.fileErrorMessage = null;
    this.cropper = null;
    this.dragTip = null;
    this.cropped = null;
    this.profilePicture = null;
    this.selectedFile = null;
    this.editorContainer.nativeElement.innerHTML = null;

  }

  onDeleted(uidFilename: string) {

    this.isDeleting = true;
    const el = this.pictures.find(_ => _.fileName === uidFilename);

    this.bService.deleteProfilePicture(el.deleteUrl).pipe(
      takeUntil(this.toDestroy$),
      delay(900)
    ).subscribe(res => {

      this.cdr.markForCheck();

      if (el) {

        this.onSuccess(res);
        this.pictures.splice(this.pictures.indexOf(el), 1);

        // once deleted from the server, we must remove from the local storage
        localStorage.removeItem('js-avatar');
        localStorage.removeItem('js-brand');

      }
    }, e => this.onError(e));
  }


  onSetProfilePicture(uidFilename: string, toMake: string) {
    if (this.wait > 0) return;
    this.wait = 1000;

    const isBrand = toMake === 'brand';
    const el = this.pictures.find(_ => _.fileName === uidFilename);
    this.bService.updateImgStatus(isBrand ? 'brand' : 'avatar', el.fileName)
      .pipe(takeUntil(this.toDestroy$), delay(this.wait))
      .subscribe({
        next: res => {
          this.store.dispatch(new IsUserLoggedInAction(UserType.Employer));

          this.onSuccess(res);
          this.wait = 0;
        },
        error: er => this.onError(er)
      });
  }

  // E.G. https://netbasal.com/angular-2-improve-performance-with-trackby-cc147b5104e5
  trackByProfilePictureKey = (index: number) => index; // item.id;

  faviconChange(e: any) {
    this.cdr.markForCheck();
    this.faviconFormat = null;
    this.favicon = null;
    const file = <File>(e.target.files[0] || e.srcElement.files[0]);

    if (!file) return;

    const ext = file.name.slice((file.name.lastIndexOf('.') - 1) + 2);
    const format = this.fileFormat.indexOf(ext.toLowerCase());
    if (format <= -1) {
      this.faviconFormat = 'Invalid file format. Supported file formats are .ico, ' + this.fileFormat.join(', ');
      return;
    }

    const reader = new FileReader();

    // Read the contents of Image File.
    reader.readAsDataURL(file);

    reader.onload = (e: any) => {
      this.cdr.markForCheck();
      this.favicon = e.target.result.split(',')[1];
      //  console.log(e.target.result.split(','))
    };
  }

  uploadFavicon(input: HTMLInputElement) {

    if (!this.favicon) return;

    this.bService.addFavicon(this.profile.id, this.favicon).pipe(
      takeUntil(this.toDestroy$)
    ).subscribe({
      next: res => {
        this.cdr.markForCheck();
        this.profile.favicon = res.contentBody;
        this.onSuccess(res);
        this.favicon = null;
        input.value = null;
      },
      error: e => this.onError(e)
    });

  }

  private validateFileFormat(file: File) {
    // a valid file extension must be provided
    const ext = file.name.slice((file.name.lastIndexOf('.') - 1) + 2);
    const format = this.fileFormat.indexOf(ext.toLowerCase());
    if (format <= -1) {
      this.fileErrorMessage = 'Invalid file format. Supported file formats are ' + this.fileFormat.join(', ');
      return;
    }
  }

  private validateFileSize(file: File) {
    // max file size is 20mb to process using cropperjs
    if (file.size > 20480000) {

      this.fileErrorMessage = 'File size limit exceed. Max file size is 20MB';
      return;
    }
  }

  private initCropperOnImageLoaded(image: HTMLImageElement, container: HTMLElement) {

    const options: Cropper.Options = {
      viewMode: 1,
      aspectRatio: 0,
      // crop: (event) => {
      //     const c = cropper.getCroppedCanvas().toDataURL('image/jpeg', 0.70);
      //     this.cropped = c;
      //     // cropper.getCroppedCanvas().toBlob(d => {
      //     //     console.log(d);

      //     // }, 'image/jpg', 0.90);
      //     // console.log(c);
      // },
      crop: e => this.crop.next(e),
      cropmove: () => this.dragTip = true,
      autoCropArea: 0,
      guides: false,
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      center: true,
      responsive: true,
      zoomable: true,
      toggleDragModeOnDblclick: false,
      background: true,
      minCropBoxHeight: 100,
      minCropBoxWidth: 200,
      scalable: true,
      rotatable: true

    };
    const cropper = new Cropper(image, options);
    cropper.setCropBoxData({ width: 400, height: 400 });
    cropper.setDragMode('move' as any);

    this.cropper = cropper;
  }

  private onSuccess(res: ResponseModel) {

    this.cdr.markForCheck();
    this.snackBar.when('success', res);

    this.resetFlags();

  }

  private resetFlags() {
    this.isWorking = false;
    this.isDeleting = false;
    this.isLoading = false;
  }

  private onError(ex: any) {

    this.cdr.markForCheck();

    this.snackBar.when('danger', ex);

    // enen when come this far, render elements
    this.profile = {};

    this.resetFlags();

  }

}
