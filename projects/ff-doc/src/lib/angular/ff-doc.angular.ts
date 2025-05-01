import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FrankDoc, RawFrankDoc } from '../frankdoc.types';
import { computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { AbstractFFDoc, Filter } from '../abstract-ff-doc';

export class NgFFDoc extends AbstractFFDoc {
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

  private readonly http: HttpClient = inject(HttpClient);

  get frankDoc(): Signal<FrankDoc | null> {
    return this._frankDoc.asReadonly();
  }

  get rawFrankDoc(): Signal<RawFrankDoc | null> {
    return this._rawFrankDoc.asReadonly();
  }

  get filters(): Signal<Filter[]> {
    return this._filters.asReadonly();
  }

  initialize(jsonUrl: string): void {
    this.fetchJson(jsonUrl).subscribe((rawFrankDoc) => {
      this._rawFrankDoc.set(rawFrankDoc);
      const frankDoc = this.processFrankDoc(rawFrankDoc);
      this._frankDoc.set(frankDoc);

      const filters = this.getFiltersFromLabels(frankDoc.labels);
      this.assignFrankDocElementsToFilters(filters, frankDoc.elements);
    });
  }

  private fetchJson(url: string): Observable<RawFrankDoc> {
    return this.http.get<RawFrankDoc>(url);
  }
}
