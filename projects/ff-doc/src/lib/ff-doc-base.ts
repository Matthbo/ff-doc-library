import { ElementClass, ElementInfo, FFDocJson } from './frankdoc.types';
import { getInheritedProperties } from './frankdoc.utilities';

export type Filters = Record<string, FilterLabels>;
export type FilterLabels = Record<string, string[]>;
export type Elements = Record<string, ElementDetails>;
export type ElementDetails = ElementClass & {
  labels: ElementInfo['labels'];
};

export abstract class FFDocBase {
  protected getFiltersFromLabels(labels: FFDocJson['labels']): Filters {
    const filters: Filters = {};
    for (const [filterGroup, filterLabels] of Object.entries(labels)) {
      filters[filterGroup] = {};
      for (const label of filterLabels) {
        filters[filterGroup][label] = [];
      }
    }
    return filters;
  }

  protected assignFrankDocElementsToFilters(filters: Filters, elements: FFDocJson['elementNames']): Filters {
    for (const [elementName, element] of Object.entries(elements)) {
      for (const elementFilterGroup in element.labels) {
        const elementFilterLabel = element.labels[elementFilterGroup];
        if (!filters[elementFilterGroup] || !filters[elementFilterGroup][elementFilterLabel]) continue;
        filters[elementFilterGroup][elementFilterLabel].push(elementName);
      }
    }
    return filters;
  }

  protected getElementsWithClassInfo(json: FFDocJson): Elements {
    const elements: Elements = {};
    for (const [elementName, elementValue] of Object.entries(json.elementNames)) {
      const elementClassData = json.elements[elementValue.className];
      const element: ElementDetails = {
        ...elementClassData,
        labels: elementValue.labels,
      };
      elements[elementName] = this.addInheritedPropertiesToElement(element, json);
    }
    return elements;
  }

  protected addInheritedPropertiesToElement(element: ElementDetails, json: FFDocJson): ElementDetails {
    const inheritedProperties = getInheritedProperties(element, json.elements, json.enums);
    // TODO: flatten inherited properties to element itself
  }
}
