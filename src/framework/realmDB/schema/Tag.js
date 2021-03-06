// @flow

import { Map } from 'immutable';
import BaseObject from './BaseObject';

const schema = Map({
  name: 'Tag',
  properties: Map({
    name: 'MultiLanguagesString[]',
    description: 'MultiLanguagesString[]',
    level: 'int?',
    forDisplay: 'bool?',
    parentTagId: 'string?',
  }).merge(BaseObject.getBaseSchema()),
}).toJS();

export default class Tag extends BaseObject {
  static getSchema = () => schema;

  static spawn = info => {
    const object = new Tag();

    object.updateInfo(info);

    return object;
  };

  constructor(object) {
    super(object);

    if (!object) {
      return;
    }

    this.addMultiLanguagesStringValueFromObject(object, 'name');
    this.addMultiLanguagesStringValueFromObject(object, 'description');
    this.set('level', object.level);
    this.set('forDisplay', object.forDisplay);
    this.set('parentTagId', object.parentTagId);
  }

  updateInfo = info => {
    this.updateInfoBase(info);

    this.addMultiLanguagesStringValueFromImmutableInfo(info, 'name');
    this.addMultiLanguagesStringValueFromImmutableInfo(info, 'description');
    this.set('level', info.get('level'));
    this.set('forDisplay', info.get('forDisplay'));
    this.set('parentTagId', info.get('parentTagId'));
  };

  getInfo = () => this.object.update('name', this.reduceMultiLanguagesStringList).update('description', this.reduceMultiLanguagesStringList);
}
