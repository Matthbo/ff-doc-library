import { useState } from 'react';
import { Elements, Filters } from '../ff-doc-base';
import { FFDoc } from '../ff-doc';
import { FFDocJson } from '../frankdoc.types';

type FFDocHook = {
  ffDoc: FFDocJson | null;
  elements: Elements | null;
  filters: Filters;
};

export function useFFDoc(jsonUrl: string): FFDocHook {
  const [ffDocJson, setFFDocJson] = useState<FFDocJson | null>(null);
  const [elements, setElements] = useState<Elements | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const ffDoc = new FFDoc();

  ffDoc.initialize(jsonUrl).then(() => {
    setFFDocJson(ffDoc.ffDoc);
    setFilters(ffDoc.filters);
    setElements(ffDoc.elements);
  });

  return {
    ffDoc: ffDocJson,
    elements,
    filters,
  };
}
