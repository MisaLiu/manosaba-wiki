import type { ItemSource, LocationSource, TaskRewardSource } from '@manosaba/types';
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

const buildTaskRewardSource = (definition: ItemDefinitionEvidence): TaskRewardSource => {
  return {
    type: 'task_reward',
    name: definition.locationName ?? 'unknown',
    probability: definition.probability,
  };
};

const buildSourceKey = (source: ItemSource): string => {
  if (source.type === 'task_reward') return `reward|${source.name}`;
  return [(source as LocationSource).name, (source as LocationSource).count ?? '', (source as LocationSource).implementation ?? '', (source as LocationSource).lootTableId ?? ''].join('|');
};

export const buildLocationSourcesForCandidate = (
  candidate: LinkedItemCandidate,
  _supplies: unknown[] = [],
): ItemSource[] => {
  const aggregated = new Map<string, ItemSource>();

  for (const definition of candidate.definitions) {
    if (definition.definitionSourceType !== 'supply') {
      continue;
    }

    const isReward = definition.namespace === 'reward';
    const source: ItemSource = isReward
      ? buildTaskRewardSource(definition)
      : buildLocationSource(definition);

    const key = buildSourceKey(source);
    const existing = aggregated.get(key) as LocationSource | TaskRewardSource;

    if (existing) {
      aggregated.set(key, {
        ...existing,
        probability: ((existing.probability ?? 0) + (source.probability ?? 0)),
      } as LocationSource | TaskRewardSource);
      continue;
    }

    aggregated.set(key, source);
  }

  return Array.from(aggregated.values());
};
