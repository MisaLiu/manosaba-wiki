import { normalizeBaseItemId, normalizeCustomData, normalizeCustomName } from './normalizer';
import type { ItemFingerprint } from './types';
import type { ItemDefinitionEvidence } from '../scanner/item/types';
import type { ItemTriggerEvidence } from '../scanner/advancement/types';
import { getDefinitionDisplayName } from '../scanner/item/name';

interface FingerprintBuildResult {
  fingerprint: ItemFingerprint;
  warnings: string[];
}

export const buildFingerprintKey = (fp: ItemFingerprint): string | undefined => {
  if (fp.itemModel) return `model:${fp.itemModel}`;
  if (fp.baseItemId && fp.customDataNormalized) {
    return `item+data:${fp.baseItemId}::${fp.customDataNormalized}`;
  }
  if (fp.customNameNormalized) return `name:${fp.customNameNormalized}`;
  if (fp.namespace && fp.sourceStem) return `source:${fp.namespace}:${fp.sourceStem}`;
  return (void 0);
};

export const buildDefinitionFingerprint = (
  definition: ItemDefinitionEvidence
): FingerprintBuildResult => {
  const warnings: string[] = [];

  const fingerprint = {
    baseItemId: normalizeBaseItemId(definition.baseItemId),
    itemModel: definition.itemModel?.trim(),
    customDataNormalized: normalizeCustomData(definition.customDataRaw),
    customNameNormalized: getDefinitionDisplayName(definition),
    namespace: definition.namespace,
    sourceStem: definition.sourceStem,
  };

  if (
    !fingerprint.baseItemId &&
    !fingerprint.itemModel &&
    !fingerprint.customDataNormalized &&
    !fingerprint.customNameNormalized
  ) {
    warnings.push('Definition evidence has no usable identity fields');
  }

  return { fingerprint, warnings };
};

export const buildTriggerFingerprint = (
  trigger: ItemTriggerEvidence
): FingerprintBuildResult => {
  const warnings: string[] = [];

  const fingerprint = {
    baseItemId: normalizeBaseItemId(trigger.matchedBaseItemId),
    itemModel: trigger.matchedItemModel?.trim(),
    customDataNormalized: normalizeCustomData(trigger.matchedCustomDataRaw),
    customNameNormalized: normalizeCustomName(trigger.matchedCustomNameRaw),
    namespace: trigger.namespace,
    sourceStem: trigger.sourceStem,
  };

  if (
    !fingerprint.baseItemId &&
    !fingerprint.itemModel &&
    !fingerprint.customDataNormalized &&
    !fingerprint.customNameNormalized
  ) {
    warnings.push('Trigger evidence has no usable identity fields');
  }

  return { fingerprint, warnings };
};

export const hasStrongIdentity = (fp: ItemFingerprint): boolean => {
  return Boolean(
    fp.itemModel ||
    (fp.baseItemId && fp.customDataNormalized)
  );
};
