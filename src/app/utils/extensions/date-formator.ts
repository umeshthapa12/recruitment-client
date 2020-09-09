import { Injectable } from '@angular/core';

import { NativeDateAdapter } from '@angular/material/core';

import moment from 'moment';

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
    format(date: Date, displayFormat: object): string {
        const formatString = 'MMM YYYY';
        return moment(date).format(formatString);
    }
}
