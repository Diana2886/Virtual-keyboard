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
    document.addEventListener('keydown', this.handleEvent);
    document.addEventListener('keyup', this.handleEvent);
  }

  handleEvent = (event) => {
    // if (event.stopPropagation) event.stopPropagation();
    const { code, type } = event;
    const keyObject = this.keyButtons.find(key => key.code === code);
    if (!keyObject) return;
    this.display.focus();
    if (type.match(/keydown|mousedown/)) {
      if (type.match(/key/)) event.preventDefault();
      keyObject.keyContainer.classList.add('active');

      if (code.match(/Control/)) this.ctrlKey = true;
      if (code.match(/Alt/)) this.altKey = true;
      if (code.match(/Control/) && this.altKey) this.changeLang();
      if (code.match(/Alt/) && this.ctrlKey) this.changeLang();

    } else if (type.match(/keyup|mouseup/)) {
      keyObject.keyContainer.classList.remove('active');
      if (code.match(/Control/)) this.ctrlKey = false;
      if (code.match(/Alt/)) this.altKey = false;
    }
  }

  changeLang = () => {
    const langs = Object.keys(lang);
    let langIndex = langs.indexOf(this.container.dataset.lang);
    this.keyBase = langIndex + 1 < langs.length ? lang[langs[langIndex += 1]]
      : lang[langs[langIndex -= langIndex]];
    this.container.dataset.lang = langs[langIndex];
    storage.set('lang', langs[langIndex]);
    
    this.keyButtons.forEach(item => {
      const keyObject = this.keyBase.find(key => key.code === item.code);
      if (!keyObject) return;
      item.shift = keyObject.shift;
      item.key = keyObject.key;
      if (keyObject.shift && keyObject.shift.match(/[^0-9a-zA-Zа-яА-ЯёЁ]/g)) {
        item.keyShift.innerHTML = keyObject.shift;
      } else {
        item.keyShift.innerHTML = '';
      }
      item.keyTitle.innerHTML = keyObject.key;
    });
  }
}