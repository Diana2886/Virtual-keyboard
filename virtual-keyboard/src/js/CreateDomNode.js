export default function createDomNode(node, className, children, parent, ...dataAttr) {
  let element = null;
  element = document.createElement(node);
  if (className) {
    element.classList.add(...className.split(' '));
  }
  if (children && Array.isArray(children)) {
    children.forEach(item => /* item && */ element.append(item));
  } else if (children && typeof children === 'object') {
    element.append(children);
  } else if (children && typeof children === 'string') {
    element.innerHTML = children;
  }
  if (parent) {
    parent.append(element);
  }
  if (dataAttr.length) {
    dataAttr.forEach(([ dataName, dataValue ]) => {
      if (dataValue === '') {
        element.setAttribute(dataName, '');
      } else if (dataName.match(/value|id|placeholder|cols|rows|autocorrect|spellcheck/)) {
        element.setAttribute(dataName, dataValue);
      } else {
        element.dataset[dataName] = dataValue;
      }
    });
  }
  return element;
}