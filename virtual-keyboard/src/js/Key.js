import createDomNode from './CreateDomNode';

export default class Key {
  constructor({ key, shift, code }) {
    this.key = key;
    this.shift = shift;
    this.code = code;
    this.isFnKey = Boolean(key.match(/Tab|Caps|Shift|Ctrl|Alt|Enter|Back|Del|arr|Win/));

    if (shift && shift.match(/[^0-9a-zA-Zа-яА-ЯёЁ]/)) {
      this.keyShift = createDomNode('div', 'key-shift', this.shift);
    } else {
      this.keyShift = createDomNode('div', 'key-shift', '');
    }

    this.keyTitle = createDomNode('div', 'key-title', key);
    this.keyContainer = createDomNode(
      'div',
      'keyboard__key',
      [this.keyShift, this.keyTitle],
      null,
      ['code', this.code],
      this.isFnKey ? ['fn', 'true'] : ['fn', 'false'],
    );
  }
}
