// @flow

import { Map } from 'immutable';

const schema = {
  name: 'Rules',
  properties: {
    mustChooseSize: 'bool?',
    mustChooseDietaryOption: 'bool?',
    minNumberOfSideDishes: 'int?',
    maxNumberOfSideDishes: 'int?',
  },
};

export default class Rules {
  static getSchema = () => schema;

  constructor(mustChooseSize, mustChooseDietaryOption, minNumberOfSideDishes, maxNumberOfSideDishes) {
    this.object = Map({ mustChooseSize, mustChooseDietaryOption, minNumberOfSideDishes, maxNumberOfSideDishes });
  }

  getInfo = () => this.object;
}
