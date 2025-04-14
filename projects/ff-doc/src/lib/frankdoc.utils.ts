import { Element, FrankDoc } from './frankdoc.types';

/**
 * Get element by key (`${className}.${name}`)
 **/
export function getElementByKey(key: string, frankDoc: FrankDoc): Element {
  return frankDoc.elements[key];
}

export function getElementByName(name: string, frankDoc: FrankDoc): Element | null {
  return Object.values(frankDoc.elements).find((element) => element.name === name) ?? null;
}

export function getElementByClassName(className: string, frankDoc: FrankDoc): Element | null {
  return Object.values(frankDoc.elements).find((element) => element.className === className) ?? null;
}

export function getElementWithInheritedProperties(element: Element, frankDoc: FrankDoc): Element {
  // TODO
  return element;
}

export function getElementLabels(element: Element, frankDoc: FrankDoc): string[] {
  // TODO
}

export function getLabelsByGroup(group: string, frankDoc: FrankDoc): string[] {
  // TODO
}
