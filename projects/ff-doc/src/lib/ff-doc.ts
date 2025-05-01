import { FrankDoc, RawFrankDoc } from './frankdoc.types';
import { AbstractFFDoc, Filter } from './abstract-ff-doc';

export class FFDoc extends AbstractFFDoc {
  private _rawFrankDoc: RawFrankDoc | null = null;
  private _frankDoc: FrankDoc | null = null;
  private _filters: Filter[] = [];

  get frankDoc(): Readonly<FrankDoc | null> {
    return this._frankDoc;
  }

  get rawFrankDoc(): Readonly<RawFrankDoc | null> {
    return this._rawFrankDoc;
  }

  get filters(): readonly Filter[] {
    return this._filters;
  }

  initialize(jsonUrl: string): void {
    this.fetchJson(jsonUrl).then((rawFrankDoc) => {
      this._rawFrankDoc = rawFrankDoc;
      const frankDoc = this.processFrankDoc(rawFrankDoc);
      this._frankDoc = frankDoc;
      this._filters = this.assignFrankDocElementsToFilters(
        this.getFiltersFromLabels(frankDoc.labels),
        frankDoc.elements,
      );
    });
  }

  private async fetchJson(url: string): Promise<RawFrankDoc> {
    const response = await fetch(url);
    return await response.json();
  }
}
