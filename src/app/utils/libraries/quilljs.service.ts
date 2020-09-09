import { ElementRef, Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import Quill, { QuillOptionsStatic } from 'quill';
import { fromEvent, of } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { RandomUnique } from '../generators/uuid';

interface OutputTypeProps {
    json: 'json';
    html: 'html';
}
/**
 * Hides boilerplate quilljs code form the component of basic use.
 *
  ```javascript
  // example of use
  const quill = service.initQuill(element)
                       .TextChangeValueSetter(formcontrol)
                       .getQuillInstance()

```
 */
@Injectable({ providedIn: 'root' })
export class QuilljsService {

    // unique ID for local use
    private elementId: string;

    // instances for local use
    private instances: [{ id?: string, instance?: Quill }];

    private options: any[][] = [];


    defaultToolbar() {
        this.options = [
            [{ 'font': [] }],
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }, 'blockquote', 'code-block'],
            ['bold', 'italic', 'underline', { 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'align': [] }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image', 'video', { 'script': 'sub' }, { 'script': 'super' }, 'formula'],
            ['clean']
        ];
        return this;
    }

    except(exclude: any[]) {
        return this.options.slice().map(x => x.slice().filter(include => !exclude.includes(include)));
    }

    /**
     * Initialize quilljs
     * @param el element to initialize quilljs (HTMLElement | ElementRef)
     */
    initQuill(el: HTMLElement | ElementRef, config?: QuillOptionsStatic) {
        // we need a new token on each call
        const rand = new RandomUnique().uid();
        const elem = el instanceof HTMLElement ? el : el.nativeElement;
        const options: QuillOptionsStatic = {
            modules: {
                toolbar: [
                    [{ 'font': [] }],
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }, 'blockquote', 'code-block'],
                    ['bold', 'italic', 'underline', { 'color': [] }, { 'background': [] }],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'align': [] }, { 'indent': '-1' }, { 'indent': '+1' }],
                    ['link', 'image', 'video', { 'script': 'sub' }, { 'script': 'super' }, 'formula'],
                    ['clean']
                ],

            },
            placeholder: 'Write here..',
            theme: 'snow',
        };

        const q = new Quill(elem, { ...options, ...config });

        // apply custom css rules for quill toolbar
        const toolbar = elem.previousSibling as HTMLElement;
        if (toolbar) {
            toolbar.style.border = 'none';
            toolbar.style.background = '#f9f9f9';
            toolbar.style.boxShadow = '0 0 1px 0 #ccc';
        }
        const instance = { id: rand, instance: q };
        if (this.instances)
            this.instances.push(instance);
        else {
            this.instances = [instance];
        }

        this.elementId = rand;
        return this;
    }

    /**
     * Sets values to form control when quilljs text-change event fires.
     * @param control Formcontrol
     */
    textChangeValueSetter<k extends keyof OutputTypeProps>(control: AbstractControl, output: k) {
        const index = this.instances.findIndex(_ => _.id === this.elementId);

        if (!(this.instances || this.instances.length > 0 || index > -1))
            throw Error(`Quill is not initialized yet. ${this.initQuill} must be called before this`);

        const quill = this.instances[index].instance;

        of(quill).pipe(
            switchMap(eventLike => fromEvent(eventLike, 'text-change')),
            debounceTime(1000),
        ).subscribe({
            next: e => {

                const [delta, old, source] = e as any;
                const isUser = source === 'user';

                const content = quill.getContents();
                let value: string;

                // https://github.com/quilljs/quill/issues/163#issuecomment-48540215
                if (quill.getLength() >= 2) {
                    switch (output) {
                        case 'html':
                            value = quill.root.innerHTML;
                            break;
                        case 'json':
                            value = JSON.stringify(content.ops);
                            break;
                        default:
                            value = JSON.stringify(content.ops);
                            break;
                    }

                    control.setValue(value);

                } else {
                    control.setValue(null);
                    quill.setText('');
                }

                // user change
                if (isUser) {
                    control.markAsDirty();
                    control.markAsTouched();
                }

                control.updateValueAndValidity();

            }
        });

        return this;
    }

    /**
     * Gets quill instance
     */
    getQuillInstance() {

        if (!(this.instances || this.instances.length > 0))
            throw Error(`Quill is not initialized yet. ${this.initQuill} must be called before this`);

        // instance by elementId
        if (this.elementId) {
            const index = this.instances.findIndex(_ => _.id === this.elementId);

            if (index > -1) {
                // by cleaning up the local array, we return deleted element
                this.elementId = '';
                const el = this.instances.splice(index, 1)[0].instance;
                return el;
            }
        }

        return this.instances.splice(0, 1)[0].instance;
    }
}
