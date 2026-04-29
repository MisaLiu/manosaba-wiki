import type { ItemSource, LocationSource } from '@manosaba/types';
import type { LinkedItemCandidate } from '../linker/types';
import type { ItemDefinitionEvidence } from '../scanner/item/types';

const buildLocationSource = (definition: ItemDefinitionEvidence): LocationSource => {
  return {
    type: 'location',
    name: definition.locationName ?? 'unknown',
    count: definition.count,
    probability: definition.probability,
    implementation: 'manual',
  };
};

const buildLocationSourceKey = (source: LocationSource): string => {
  return [
    source.name,
    source.count ?? '',
    source.implementation ?? '',
    source.lootTableId ?? '',
  ].join('|');
};

export const buildLocationSourcesForCandidate = (
  candidate: LinkedItemCandidate,
  _supplies: unknown[] = [],
): ItemSource[] => {
  const aggregated = new Map<string, LocationSource>();

  for (const definition of candidate.definitions) {
    if (definition.definitionSourceType !== 'supply') {
      continue;
    }

    const source = buildLocationSource(definition);
    const key = buildLocationSourceKey(source);
    const existing = aggregated.get(key);

    if (existing) {
      aggregated.set(key, {
        ...existing,
        probability: (existing.probability ?? 0) + (source.probability ?? 0),
      });
      continue;
    }

    aggregated.set(key, source);
  }

  return Array.from(aggregated.values());
};
