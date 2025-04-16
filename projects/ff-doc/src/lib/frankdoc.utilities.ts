import { Element, FrankDoc, Attribute, ElementProperty, Enum, Label } from './frankdoc.types';

function filterUsedEnums(attributes: Attribute[], enums: Enum[]): FrankDoc['enums'] {
  const filteredEnums = new Set<FrankDoc['enums'][0]>();
  for (const attribute of attributes) {
    if (attribute.enum) {
      const enumType = enums.find((enumItem) => enumItem.name === attribute.enum);
      if (enumType) filteredEnums.add(enumType);
    }
  }
  return [...filteredEnums];
}

export type InheritedParentElementProperties<T> = {
  parentElementName: string;
  properties: T[];
};

export type InheritedProperties = {
  attributesRequired: InheritedParentElementProperties<Attribute>[];
  attributesOptional: InheritedParentElementProperties<Attribute>[];
  forwards: ElementProperty[];
  enums: Enum[];
};

/**
 * Gets an element by key (`${className}.${name}`)
 **/
export function getElement(className: string, name: string, elements: FrankDoc['elements']): Element {
  return elements[`${className}.${name}`];
}

export function getElementByName(name: string, elements: FrankDoc['elements']): Element | null {
  return Object.values(elements).find((element) => element.name === name) ?? null;
}

export function getElementByClassName(className: string, elements: FrankDoc['elements']): Element | null {
  return Object.values(elements).find((element) => element.className === className) ?? null;
}

export function getElementByLabel(
  labelGroup: string,
  label: string,
  name: string,
  elements: FrankDoc['elements'],
): Element | null {
  return (
    Object.values(elements).find((element) => element.name === name && element.labels?.[labelGroup]?.includes(label)) ??
    null
  );
}

export function getInheritedProperties(
  element: Element,
  elements: FrankDoc['elements'],
  enums: Enum[],
): InheritedProperties {
  const initialInheritedProperties: InheritedProperties = {
    attributesRequired: [],
    attributesOptional: [],
    forwards: [],
    enums: [],
  };

  if (!element.parent) return initialInheritedProperties;
  const parentElement = getElementByClassName(element.parent, elements);
  if (!parentElement) return initialInheritedProperties;
  const inheritedProperties = getInheritedProperties(parentElement, elements, enums);

  if (parentElement.attributes) {
    const attributesRequired = parentElement.attributes.filter((attribute) => attribute.mandatory === true);
    const attributesOptional = parentElement.attributes.filter((attribute) => !attribute.mandatory);
    if (attributesRequired.length > 0) {
      inheritedProperties.attributesRequired.unshift({
        parentElementName: parentElement.name,
        properties: attributesRequired,
      });
    }
    if (attributesOptional.length > 0) {
      inheritedProperties.attributesOptional.unshift({
        parentElementName: parentElement.name,
        properties: attributesOptional,
      });
    }
    inheritedProperties.enums.unshift(...filterUsedEnums(parentElement.attributes, enums));
  }

  if (parentElement.forwards) {
    inheritedProperties.forwards.push(...parentElement.forwards);
  }

  return inheritedProperties;
}

export function getElementWithInheritedProperties(
  className: string,
  name: string,
  elements: FrankDoc['elements'],
  enums: Enum[],
): { element: Element; inheritedProperties: InheritedProperties } {
  const element = getElement(className, name, elements);
  return {
    element: element,
    inheritedProperties: getInheritedProperties(element, elements, enums),
  };
}

export function getLabelsByGroup(groupName: string, labels: Label[]): string[] {
  return labels.find((label) => label.label === groupName)?.values ?? [];
}
