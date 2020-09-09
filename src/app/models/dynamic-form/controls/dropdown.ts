import { ControlBase, ControlOptions, ControlTypes } from '../control-base';

export class Dropdown extends ControlBase {
  type = ControlTypes.dropdown;
  options: ControlOptions[] = [];

  constructor(options: ControlOptions = {}) {
    super(options);
    this.options = options.options || [];
  }
}
