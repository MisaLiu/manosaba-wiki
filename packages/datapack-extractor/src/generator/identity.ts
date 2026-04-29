import { normalizeCustomData, normalizeCustomName } from '../linker/normalizer';
import type { LinkedItemCandidate } from '../linker/types';
import type { ItemIdentity } from '@manosaba/types';
import { getDefinitionDisplayName } from '../scanner/item/name';

export const buildIdentity = (candidate: LinkedItemCandidate): ItemIdentity | undefined => {
  const definition = candidate.definitions[0];
  if (!definition) return undefined;

  const identity: ItemIdentity = {
    baseItemId: definition.baseItemId,
    itemModel: definition.itemModel,
    customName: getDefinitionDisplayName(definition),
    customData: normalizeCustomData(definition.customDataRaw),
  };

  if (!identity.baseItemId && !identity.itemModel && !identity.customName && !identity.customData) {
    return undefined;
  }

  return identity;
};
