
export enum ControlTypes {
    textbox = 'textbox',
    dropdown = 'dropdown',
    textarea = 'textarea',
    checkbox = 'checkbox',
    radio = 'radio',
    date = 'date',
    time = 'time'
}

export class ControlBase {
    value: any;
    key: string;
    label: string;
    description: string;
    required: boolean;
    order: number;
    type: ControlTypes;
    placeholder: string;
    options: ControlOptions[];

    constructor(config: ControlOptions = {}) {
        if (config.value)
            this.value = config.value;
        this.key = config.key || '';
        this.label = config.label || '';
        this.required = !!config.required;
        //  this.order = config.order === undefined ? 1 : config.order;
        this.type = config.type || ControlTypes.textbox;
        this.placeholder = config.placeholder || '';
        if ((config.options || []).length > 0)
            this.options = config.options;
        this.description = config.description;
    }
}

export interface ControlActionTypes {
    copied?: boolean;
    removed?: boolean;
    selected?: boolean;
    key?: string;
}
export interface ControlOptions {
    value?: any;
    key?: string;
    label?: string;
    description?: string;
    required?: boolean;
    order?: number;
    type?: ControlTypes;
    placeholder?: string;
    options?: ControlOptions[];
}

