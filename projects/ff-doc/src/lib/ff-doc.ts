import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FrankDoc, RawFrankDoc, Element, Label } from './frankdoc.types';
import { computed, Signal, signal, WritableSignal } from '@angular/core';

export type Filter = {
  name: string;
  labels: FilterLabels[];
};

export type FilterLabels = {
  name: string;
  elements: string[];
};

export class FFDoc {
  public readonly elements: Signal<FrankDoc['elements']> = computed(() => this.frankDoc()?.elements ?? {});
  public readonly enums: Signal<FrankDoc['enums']> = computed(() => this.frankDoc()?.enums ?? []);
  public readonly properties: Signal<FrankDoc['properties']> = computed(() => this.frankDoc()?.properties ?? []);
  public readonly credentialProviders: Signal<FrankDoc['credentialProviders']> = computed(
    () => this.frankDoc()?.credentialProviders ?? [],
  );
  public readonly servletAuthenticators: Signal<FrankDoc['servletAuthenticators']> = computed(
    () => this.frankDoc()?.servletAuthenticators ?? [],
  );

  private readonly _rawFrankDoc: WritableSignal<RawFrankDoc | null> = signal(null);
  private readonly _frankDoc: WritableSignal<FrankDoc | null> = signal(null);
  private readonly _filters: WritableSignal<Filter[]> = signal([]);

  constructor(
    private readonly jsonUrl: string,
    private readonly http: HttpClient,
  ) {}

  get frankDoc(): Signal<FrankDoc | null> {
    return this._frankDoc.asReadonly();
  }

  get rawFrankDoc(): Signal<RawFrankDoc | null> {
    return this._rawFrankDoc.asReadonly();
  }

  get filters(): Signal<Filter[]> {
    return this._filters.asReadonly();
  }

  initialize(): void {
    this.fetchJson().subscribe((rawFrankDoc) => {
      this._rawFrankDoc.set(rawFrankDoc);
      const frankDoc = this.processFrankDoc(rawFrankDoc);
      this._frankDoc.set(frankDoc);

      const filters = this.getFiltersFromLabels(frankDoc.labels);
      this.assignFrankDocElementsToFilters(filters, frankDoc.elements);
    });
  }

  private fetchJson(): Observable<RawFrankDoc> {
    return this.http.get<RawFrankDoc>(this.jsonUrl);
  }

  private processFrankDoc(rawDoc: RawFrankDoc): FrankDoc {
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

  private getFiltersFromLabels(labels: Label[]): Filter[] {
    return labels.map((filter) => ({
      name: filter.label,
      labels: filter.values.map((labelName) => ({
        name: labelName,
        elements: [],
      })),
    }));
  }

  private assignFrankDocElementsToFilters(filters: Filter[], elements: Record<string, Element>): void {
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
  }
}
