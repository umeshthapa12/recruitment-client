import { Injectable } from '@angular/core';

const CSS = [
    'm-badge--success',
    'm-badge--info',
    'm-badge--warning',
    'm-badge--danger',
];

const STATUS: IStatus[] = [
    { css: CSS[0], status: 'active' },
    { css: CSS[2], status: 'inactive' },
    { css: CSS[3], status: 'suspend' },
    { css: CSS[1], status: 'pending' },
    { css: CSS[1], status: 'on-queue' },
    { css: CSS[1], status: 'on-process' },
    { css: CSS[3], status: 'rejected' },
    { css: CSS[0], status: 'approved' },
];

@Injectable({ providedIn: 'root' })
export class RowContentStatus {

    initContentStatusCssClass(s: string) {
        const input = (s || '').toLowerCase();
        const f = STATUS.find(_ => _.status.toLowerCase() === input);

        return f ? f.css : 'not-found';
    }
}

interface IStatus {
    css: string;
    status: string;
}
