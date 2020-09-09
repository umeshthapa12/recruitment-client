import { ControlBase, ControlOptions, ControlTypes } from '../control-base';

export class Textbox extends ControlBase {
  type: ControlTypes;
  constructor(options: ControlOptions = {}) {
    super(options);
    this.type = options.type || ControlTypes.textbox;
  }
}
