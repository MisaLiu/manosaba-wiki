import type { ItemFingerprint, LinkMatch, LinkRule } from './types';

const matchByItemModel: LinkRule = ({ definition, trigger }) => {
  if (!definition.itemModel || !trigger.itemModel) return { matched: false };
  if (definition.itemModel !== trigger.itemModel) return { matched: false };

  return {
    matched: true,
    strength: 'strong',
    ruleName: 'itemModel',
    reason: `Matched by itemModel '${definition.itemModel}'`,
  };
};

const matchByBaseItemAndCustomData: LinkRule = ({ definition, trigger }) => {
  if (!definition.baseItemId || !trigger.baseItemId) return { matched: false };
  if (!definition.customDataNormalized || !trigger.customDataNormalized) return { matched: false };
  if (definition.baseItemId !== trigger.baseItemId) return { matched: false };
  if (definition.customDataNormalized !== trigger.customDataNormalized) return { matched: false };

  return {
    matched: true,
    strength: 'strong',
    ruleName: 'baseItem+customData',
    reason: `Matched by baseItemId '${definition.baseItemId}' and customData`,
  };
};

const matchByCustomData: LinkRule = ({ definition, trigger }) => {
  if (!definition.customDataNormalized || !trigger.customDataNormalized) {
    return { matched: false };
  }

  if (definition.customDataNormalized !== trigger.customDataNormalized) {
    return { matched: false };
  }

  return {
    matched: true,
    strength: 'medium',
    ruleName: 'customData',
    reason: `Matched by customData '${definition.customDataNormalized}'`,
  };
};

const matchByCustomName: LinkRule = ({ definition, trigger }) => {
  if (!definition.customNameNormalized || !trigger.customNameNormalized) {
    return { matched: false };
  }

  if (definition.customNameNormalized !== trigger.customNameNormalized) {
    return { matched: false };
  }

  return {
    matched: true,
    strength: 'medium',
    ruleName: 'customName',
    reason: `Matched by customName '${definition.customNameNormalized}'`,
  };
};

const matchBySourceStem: LinkRule = ({ definition, trigger }) => {
  if (!definition.namespace || !trigger.namespace) return { matched: false };
  if (!definition.sourceStem || !trigger.sourceStem) return { matched: false };
  if (definition.namespace !== trigger.namespace) return { matched: false };
  if (definition.sourceStem !== trigger.sourceStem) return { matched: false };

  return {
    matched: true,
    strength: 'weak',
    ruleName: 'namespace+sourceStem',
    reason: `Matched by namespace '${definition.namespace}' and sourceStem '${definition.sourceStem}'`,
  };
};

const LINK_RULES: LinkRule[] = [
  matchByItemModel,
  matchByBaseItemAndCustomData,
  matchByCustomData,
  matchByCustomName,
  matchBySourceStem,
];

export const matchFingerprints = (
  definition: ItemFingerprint,
  trigger: ItemFingerprint
): LinkMatch => {
  for (const rule of LINK_RULES) {
    const result = rule({ definition, trigger });
    if (result.matched) return result;
  }

  return { matched: false };
};

export const collectLinkMatches = (
  definition: ItemFingerprint,
  trigger: ItemFingerprint
): LinkMatch[] => {
  return LINK_RULES
    .map(rule => rule({ definition, trigger }))
    .filter(result => result.matched);
};
