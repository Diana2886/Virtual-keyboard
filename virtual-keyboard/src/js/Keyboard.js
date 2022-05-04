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
    this.display = createDomNode(
      'textarea',
      'display',
      null,
      wrapper,
      ['placeholder', 'Hello!\nThe keyboard was created in the Windows OS\nUse the left Ctrl + Alt to switch the language'],
      ['rows', 10],
      ['cols', 50],
    );
    this.container = createDomNode('div', 'keyboard', null, wrapper, ['lang', langCode]);
    document.body.prepend(wrapper);
    return this;
  }

  generateLayout() {
    this.keyButtons = [];
    this.keyboardRows.forEach((row, i) => {
      const rowItem = createDomNode('div', 'keyboard__row', null, this.container, ['row', i + 1]);
      row.forEach((code) => {
        const keyObject = this.keyBase.find((key) => key.code === code);
        if (keyObject) {
          const keyButton = new Key(keyObject);
          this.keyButtons.push(keyButton);
          rowItem.append(keyButton.keyContainer);
        }
      });
    });
    document.addEventListener('keydown', this.handleEvent);
    document.addEventListener('keyup', this.handleEvent);
    this.container.addEventListener('mousedown', this.preHandleEvent);
    this.container.addEventListener('mouseup', this.preHandleEvent);
  }

  preHandleEvent = (event) => {
    event.stopPropagation();
    const keyDiv = event.target.closest('.keyboard__key');
    if (!keyDiv) return;
    const { dataset: { code } } = keyDiv;
    keyDiv.addEventListener('mouseleave', this.resetButtonState);
    this.handleEvent({ code, type: event.type });
  };

  resetButtonState = ({ target: { dataset: { code } } }) => {
    const keyObject = this.keyButtons.find((key) => key.code === code);
    if (!this.isCaps) keyObject.keyContainer.classList.remove('active');
    keyObject.keyContainer.removeEventListener('mouseleave', this.resetButtonState);
  };

  handleEvent = (event) => {
    if (event.stopPropagation) event.stopPropagation();
    const { code, type } = event;
    const keyObject = this.keyButtons.find((key) => key.code === code);
    if (!keyObject) return;
    this.display.focus();
    if (type.match(/keydown|mousedown/)) {
      if (type.match(/key/)) event.preventDefault();
      keyObject.keyContainer.classList.add('active');
      if (code.match(/Shift/)) this.shiftKey = true;
      if (this.shiftKey) this.switchUpperCase(true);
      // Caps
      if (code.match(/Caps/) && !this.isCaps) {
        this.isCaps = true;
        this.switchUpperCase(true);
      } else if (code.match(/Caps/) && this.isCaps) {
        this.isCaps = false;
        this.switchUpperCase(false);
        keyObject.keyContainer.classList.remove('active');
      }
      // Change language
      if (code.match(/Control/)) this.ctrlKey = true;
      if (code.match(/Alt/)) this.altKey = true;
      if (code.match(/Control/) && this.altKey) this.changeLang();
      if (code.match(/Alt/) && this.ctrlKey) this.changeLang();

      if (!this.isCaps) {
        this.printToDisplay(keyObject, this.shiftKey ? keyObject.shift : keyObject.key);
      } else if (this.isCaps) {
        if (this.shiftKey) {
          this.printToDisplay(keyObject, keyObject.keyShift.innerHTML
            ? keyObject.shift : keyObject.key);
        } else {
          this.printToDisplay(keyObject, !keyObject.keyShift.innerHTML
            ? keyObject.shift : keyObject.key);
        }
      }
    } else if (type.match(/keyup|mouseup/)) {
      if (code.match(/Shift/)) {
        this.shiftKey = false;
        this.switchUpperCase(false);
      }
      if (code.match(/Control/)) this.ctrlKey = false;
      if (code.match(/Alt/)) this.altKey = false;
      if (!code.match(/Caps/)) keyObject.keyContainer.classList.remove('active');
    }
  };

  changeLang = () => {
    const langs = Object.keys(lang);
    let langIndex = langs.indexOf(this.container.dataset.lang);
    this.keyBase = langIndex + 1 < langs.length ? lang[langs[langIndex += 1]]
      : lang[langs[langIndex -= langIndex]];
    this.container.dataset.lang = langs[langIndex];
    storage.set('lang', langs[langIndex]);

    this.keyButtons.forEach((item) => {
      const button = item;
      const keyObject = this.keyBase.find((key) => key.code === item.code);
      if (!keyObject) return;
      button.shift = keyObject.shift;
      button.key = keyObject.key;
      if (keyObject.shift && keyObject.shift.match(/[^0-9a-zA-Zа-яА-ЯёЁ]/g)) {
        button.keyShift.innerHTML = keyObject.shift;
      } else {
        button.keyShift.innerHTML = '';
      }
      button.keyTitle.innerHTML = keyObject.key;
    });
    if (this.isCaps) this.switchUpperCase(true);
  };

  switchUpperCase(isTrue) {
    if (isTrue) {
      this.keyButtons.forEach((item) => {
        const button = item;
        if (button.keyShift) {
          if (this.shiftKey) {
            button.keyShift.classList.add('key-shift_active');
            button.keyTitle.classList.add('key-shift_inactive');
          }
        }
        if (!button.isFnKey && this.isCaps && !this.shiftKey && !button.keyShift.innerHTML) {
          button.keyTitle.innerHTML = button.shift;
        } else if (!button.isFnKey && this.isCaps && this.shiftKey) {
          button.keyTitle.innerHTML = button.key;
        } else if (!button.isFnKey && !button.keyShift.innerHTML) {
          button.keyTitle.innerHTML = button.shift;
        }
      });
    } else {
      this.keyButtons.forEach((item) => {
        const button = item;
        if (button.keyShift.innerHTML && !button.isFnKey) {
          button.keyShift.classList.remove('key-shift_active');
          button.keyTitle.classList.remove('key-shift_inactive');
          if (!this.isCaps) {
            button.keyTitle.innerHTML = button.key;
          }
        } else if (!button.isFnKey) {
          if (this.isCaps) {
            button.keyTitle.innerHTML = button.shift;
          } else {
            button.keyTitle.innerHTML = button.key;
          }
        }
      });
    }
  }

  printToDisplay(keyObject, symbol) {
    let cursorPosition = this.display.selectionStart;
    const left = this.display.value.slice(0, cursorPosition);
    const right = this.display.value.slice(cursorPosition);

    const fnButtonsHandler = {
      Tab: () => {
        this.display.value = `${left}\t${right}`;
        cursorPosition += 1;
      },
      ArrowLeft: () => {
        cursorPosition = cursorPosition - 1 >= 0 ? cursorPosition - 1 : 0;
      },
      ArrowRight: () => {
        cursorPosition += 1;
      },
      ArrowUp: () => {
        const positionFromLeft = this.display.value.slice(0, cursorPosition).match(/(\n).*$/g) || [];
        const lineBefore = this.display.value.slice(0, cursorPosition).match(/.*(\n).*$/g) || [];
        if (lineBefore[0]) {
          const pos = lineBefore[0].length - positionFromLeft[0].length;
          cursorPosition -= (pos >= positionFromLeft[0].length
            ? lineBefore[0].length - positionFromLeft[0].length + 1 : positionFromLeft[0].length);
        }
      },
      ArrowDown: () => {
        const positionFromRight = this.display.value.slice(cursorPosition).match(/^.*(\n)/) || [];
        const lineBefore = this.display.value.slice(0, cursorPosition).match(/.*$/) || [];
        const nextLine = this.display.value.slice(cursorPosition).match(/(\n).*/) || [];
        if (positionFromRight[0]) {
          cursorPosition += (lineBefore[0].length <= nextLine[0].length - 1
            ? positionFromRight[0].length + lineBefore[0].length
            : positionFromRight[0].length + nextLine[0].length - 1);
        }
      },
      Enter: () => {
        this.display.value = `${left}\n${right}`;
        cursorPosition += 1;
      },
      Delete: () => {
        this.display.value = `${left}${right.slice(1)}`;
      },
      Backspace: () => {
        this.display.value = `${left.slice(0, -1)}${right}`;
        cursorPosition -= 1;
      },
      Space: () => {
        this.display.value = `${left} ${right}`;
        cursorPosition += 1;
      },
    };

    if (fnButtonsHandler[keyObject.code]) {
      fnButtonsHandler[keyObject.code]();
    } else if (!keyObject.isFnKey) {
      cursorPosition += 1;
      this.display.value = `${left}${symbol || ''}${right}`;
    }
    this.display.setSelectionRange(cursorPosition, cursorPosition);
  }
}
