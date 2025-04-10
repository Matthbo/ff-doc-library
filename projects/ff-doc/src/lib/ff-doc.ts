import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FrankDoc, RawFrankDoc } from './frankdoc.types';
import { signal, WritableSignal } from '@angular/core';

export type Filter = {
  name: string;
  labels: FilterLabels[];
};

export type FilterLabels = {
  name: string;
  elements: string[];
};

export class FFDoc {
  readonly frankDoc: WritableSignal<FrankDoc | null> = signal(null);
  readonly rawFrankDoc: WritableSignal<RawFrankDoc | null> = signal(null);
  readonly filters: WritableSignal<Filter[]> = signal([]);

  constructor(
    private readonly jsonUrl: string,
    private readonly http: HttpClient,
  ) {}

  initialize(): void {
    this.fetchJson().subscribe((rawFrankDoc) => {
      this.rawFrankDoc.set(rawFrankDoc);
    });
  }

  private fetchJson(): Observable<RawFrankDoc> {
    return this.http.get<RawFrankDoc>(this.jsonUrl);
  }
}
