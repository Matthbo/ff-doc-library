import { FrankDoc, RawFrankDoc, Element, Label } from './frankdoc.types';

export type Filter = {
  name: string;
  labels: FilterLabels[];
};

export type FilterLabels = {
  name: string;
  elements: string[];
};

export abstract class AbstractFFDoc {
  protected getFiltersFromLabels(labels: Label[]): Filter[] {
    return labels.map((filter) => ({
      name: filter.label,
      labels: filter.values.map((labelName) => ({
        name: labelName,
        elements: [],
      })),
    }));
  }

  protected assignFrankDocElementsToFilters(filters: Filter[], elements: Record<string, Element>): Filter[] {
    for (const element of Object.values(elements)) {
      if (!element.labels) continue;

      for (const elementFilterName in element.labels) {
        const elementFilter = element.labels[elementFilterName];
        const filter = filters.find((filter) => filter.name === elementFilterName);

        if (!filter) continue;
        for (const elementLabel of elementFilter) {
          const label = filter.labels.find((label) => label.name === elementLabel);
          if (!label) continue;
          label.elements.push(element.name);
        }
      }
    }
    return filters;
  }

  // Needs to be updated to new json design
  protected processFrankDoc(rawDoc: RawFrankDoc): FrankDoc {
    const frankdoc: FrankDoc = {
      ...rawDoc,
      elements: {},
    };

    for (const rawElement of Object.values(rawDoc.elements)) {
      for (const elementName of Object.values(rawElement.elementNames)) {
        const index = `${rawElement.fullName}.${elementName.name}`;
        frankdoc.elements[index] = {
          ...rawElement,
          name: elementName.name,
          labels: elementName.labels,
          className: rawElement.fullName,
        };
      }
    }
    return frankdoc;
  }
}
