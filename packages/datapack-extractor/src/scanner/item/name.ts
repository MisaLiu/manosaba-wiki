import { normalizeCustomName } from '../../linker/normalizer';
import type { ItemDefinitionEvidence } from './types';

export const getDefinitionDisplayName = (definition: ItemDefinitionEvidence): string | undefined => {
  return normalizeCustomName(definition.customNameRaw) ?? normalizeCustomName(definition.itemNameRaw);
};
