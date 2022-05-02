import * as storage from './Storage';
import createDomNode from './CreateDomNode';
import lang from './lang/lang';
import Key from './Key';

const wrapper = createDomNode('div', 'wrapper', [createDomNode('h1', 'title', 'RSS Virtual Keyboard')]);

export default class Keyboard {
  constructor(keyboardRows) {
    this.keyboardRows = keyboardRows;
    this.keyPressed = {};
    this.isCaps = false;
  }

  init(langCode) {
    this.keyBase = lang[langCode];
    this.display = createDomNode('textarea', 'display', null, wrapper,
      ['placeholder', 'Hello!\nThe keyboard was created in the Windows OS\nUse the left Ctrl + Alt to switch the language'],
      ['rows', 10],
      ['cols', 50]);
    this.container = createDomNode('div', 'keyboard', null, wrapper, ['lang', langCode]);
    document.body.prepend(wrapper);
    return this;
  }

  generateLayout() {
    this.keyButtons = [];
    this.keyboardRows.forEach((row, i) => {
      const rowItem = createDomNode('div', 'keyboard__row', null, this.container, ['row', i + 1])
      row.forEach(code => {
        const keyObject = this.keyBase.find(key => key.code === code);
        if (keyObject) {
          const keyButton = new Key(keyObject);
          this.keyButtons.push(keyButton);
          rowItem.append(keyButton.keyContainer);
        }
      })
    });
  }
}