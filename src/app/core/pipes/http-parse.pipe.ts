import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'httpParse' })
export class HttpParsePipe implements PipeTransform {
    transform(value: string): string {

        if (!value) return value;

        return value.search(/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g) > -1 ? value
            : `http://${value}`;
    }
}
