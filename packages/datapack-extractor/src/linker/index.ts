import { buildDefinitionFingerprint, buildTriggerFingerprint } from './fingerprint';
import { parseLoreLines } from '../generator/lore';
import { matchFingerprints } from './rules';
import type {
  ItemFingerprint,
  LinkedItemCandidate,
  LinkMatch,
  LinkResult,
} from './types';
import type { ItemDefinitionEvidence } from '../scanner/item/types';
import type { ItemTriggerEvidence } from '../scanner/advancement/types';

interface CandidateState {
  candidate: LinkedItemCandidate;
  definitionFingerprints: ItemFingerprint[];
}

interface TriggerMatchCandidate {
  candidateIndex: number;
  match: LinkMatch;
}

interface DefinitionMatchCandidate {
  candidateIndex: number;
  match: LinkMatch;
}

const hasAnyIdentity = (fingerprint: ItemFingerprint): boolean => {
  return Boolean(
    fingerprint.itemModel ||
    fingerprint.baseItemId ||
    fingerprint.customDataNormalized ||
    fingerprint.customNameNormalized
  );
};

const hasTemplateMarker = (value?: string): boolean => {
  return typeof value === 'string' && value.includes('$(');
};

const hasStableIdentityPrefix = (value?: string): boolean => {
  return typeof value === 'string' && /[A-Za-z0-9_:-]\$\(/.test(value);
};

const hasStableCustomDataKey = (value?: string): boolean => {
  return typeof value === 'string' && /\{\s*[A-Za-z0-9_:-]+\s*:\s*\$\(/.test(value);
};

const extractSingleStateAxis = (
  customData?: string,
): { key: string; value: string } | undefined => {
  if (!customData) return undefined;

  try {
    const parsed = JSON.parse(customData) as Record<string, unknown>;
    const entries = Object.entries(parsed);
    if (entries.length !== 1) {
      return undefined;
    }

    const [key, value] = entries[0];
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return { key, value: String(value) };
    }
  } catch {
    return undefined;
  }

  return undefined;
};

const areNamesCompatible = (
  left?: string,
  right?: string,
): boolean => {
  if (!left || !right) {
    return true;
  }

  if (left === right || left.includes(right) || right.includes(left)) {
    return true;
  }

  let prefixLength = 0;
  while (
    prefixLength < left.length &&
    prefixLength < right.length &&
    left[prefixLength] === right[prefixLength]
  ) {
    prefixLength++;
  }

  return prefixLength >= 4;
};

const matchSingleAxisStateVariant = (
  left: ItemFingerprint,
  right: ItemFingerprint,
): LinkMatch | undefined => {
  if (!left.itemModel || !right.itemModel || left.itemModel !== right.itemModel) {
    return undefined;
  }

  if (!left.baseItemId || !right.baseItemId || left.baseItemId !== right.baseItemId) {
    return undefined;
  }

  if (!areNamesCompatible(left.customNameNormalized, right.customNameNormalized)) {
    return undefined;
  }

  const leftAxis = extractSingleStateAxis(left.customDataNormalized);
  const rightAxis = extractSingleStateAxis(right.customDataNormalized);

  if (!leftAxis || !rightAxis || leftAxis.key !== rightAxis.key) {
    return undefined;
  }

  if (leftAxis.value === rightAxis.value) {
    return undefined;
  }

  return {
    matched: true,
    strength: 'medium',
    ruleName: 'itemModel+stateAxis',
    reason: `Merged definitions by itemModel '${left.itemModel}' and state axis '${leftAxis.key}'`,
  };
};

const isParametricDefinition = (definition: ItemDefinitionEvidence): boolean => {
  if (!isTemplateDefinition(definition)) {
    return false;
  }

  return Boolean(
    hasStableIdentityPrefix(definition.itemModel) ||
    hasStableCustomDataKey(definition.customDataRaw) ||
    (definition.customNameRaw && !hasTemplateMarker(definition.customNameRaw))
  );
};

const isTemplateDefinition = (definition: ItemDefinitionEvidence): boolean => {
  return Boolean(
    hasTemplateMarker(definition.itemModel) ||
    hasTemplateMarker(definition.customNameRaw) ||
    hasTemplateMarker(definition.customDataRaw)
  );
};

const matchDefinitionFingerprints = (
  left: ItemFingerprint,
  right: ItemFingerprint
): LinkMatch => {
  const stateVariantMatch = matchSingleAxisStateVariant(left, right);
  if (stateVariantMatch) {
    return stateVariantMatch;
  }

  if (left.itemModel && right.itemModel && left.itemModel !== right.itemModel) {
    return {
      matched: false,
      reason: `Refused merge because itemModel differs: '${left.itemModel}' vs '${right.itemModel}'`,
    };
  }

  if (left.itemModel && right.itemModel && left.itemModel === right.itemModel) {
    if (
      left.customDataNormalized &&
      right.customDataNormalized &&
      left.customDataNormalized === right.customDataNormalized
    ) {
      return {
        matched: true,
        strength: 'strong',
        ruleName: 'itemModel+customData',
        reason: `Merged definitions by itemModel '${left.itemModel}' and customData`,
      };
    }

    if (
      left.customNameNormalized &&
      right.customNameNormalized &&
      left.customNameNormalized === right.customNameNormalized
    ) {
      return {
        matched: true,
        strength: 'strong',
        ruleName: 'itemModel+customName',
        reason: `Merged definitions by itemModel '${left.itemModel}' and customName '${left.customNameNormalized}'`,
      };
    }

    if (
      !left.customDataNormalized &&
      !right.customDataNormalized &&
      !left.customNameNormalized &&
      !right.customNameNormalized
    ) {
      return {
        matched: true,
        strength: 'medium',
        ruleName: 'itemModel',
        reason: `Merged definitions by itemModel '${left.itemModel}'`,
      };
    }
  }

  if (
    left.baseItemId &&
    right.baseItemId &&
    left.customDataNormalized &&
    right.customDataNormalized &&
    left.baseItemId === right.baseItemId &&
    left.customDataNormalized === right.customDataNormalized
  ) {
    return {
      matched: true,
      strength: 'strong',
      ruleName: 'baseItem+customData',
      reason: `Merged definitions by baseItemId '${left.baseItemId}' and customData`,
    };
  }

  if (
    left.customNameNormalized &&
    right.customNameNormalized &&
    left.customNameNormalized === right.customNameNormalized
  ) {
    return {
      matched: true,
      strength: 'medium',
      ruleName: 'customName',
      reason: `Merged definitions by customName '${left.customNameNormalized}'`,
    };
  }

  return { matched: false };
};

const buildLoreSignature = (definition: ItemDefinitionEvidence): string | undefined => {
  const lines = parseLoreLines(definition.loreRaw);
  if (lines.length === 0) {
    return undefined;
  }

  return lines.join('\n');
};

const matchSupplyDefinitions = (
  left: ItemDefinitionEvidence,
  right: ItemDefinitionEvidence,
): LinkMatch | undefined => {
  if (left.definitionSourceType !== 'supply' || right.definitionSourceType !== 'supply') {
    return undefined;
  }

  if (left.baseItemId !== right.baseItemId || left.count !== right.count) {
    return undefined;
  }

  if (left.itemModel || right.itemModel || left.customDataRaw || right.customDataRaw || left.customNameRaw || right.customNameRaw) {
    return undefined;
  }

  const leftLore = buildLoreSignature(left);
  const rightLore = buildLoreSignature(right);
  if (!leftLore || !rightLore || leftLore !== rightLore) {
    return undefined;
  }

  return {
    matched: true,
    strength: 'medium',
    ruleName: 'supplyBaseItem+lore+count',
    reason: `Merged supply definitions by baseItemId '${left.baseItemId}', lore and count`,
  };
};

const findBestCandidateForDefinition = (
  definition: ItemDefinitionEvidence,
  definitionFingerprint: ItemFingerprint,
  candidates: CandidateState[]
): DefinitionMatchCandidate | undefined => {
  let best: DefinitionMatchCandidate | undefined;

  for (let i = 0; i < candidates.length; i++) {
    const candidateState = candidates[i];

    for (let j = 0; j < candidateState.definitionFingerprints.length; j++) {
      const fingerprint = candidateState.definitionFingerprints[j];
      const supplyMatch = matchSupplyDefinitions(candidateState.candidate.definitions[j], definition);
      if (supplyMatch?.matched) {
        const rank = strengthRank(supplyMatch.strength);
        if (!best || rank > strengthRank(best.match.strength)) {
          best = {
            candidateIndex: i,
            match: supplyMatch,
          };
        }
        continue;
      }

      const match = matchDefinitionFingerprints(fingerprint, definitionFingerprint);
      if (!match.matched) continue;

      const rank = strengthRank(match.strength);
      if (!best || rank > strengthRank(best.match.strength)) {
        best = {
          candidateIndex: i,
          match,
        };
      }
    }
  }

  return best;
};

const createDefinitionCandidates = (
  definitions: ItemDefinitionEvidence[]
): CandidateState[] => {
  const candidates: CandidateState[] = [];

  for (const definition of definitions) {
    const { fingerprint, warnings } = buildDefinitionFingerprint(definition);
    const matched = findBestCandidateForDefinition(definition, fingerprint, candidates);

    if (!matched) {
      candidates.push({
        candidate: {
          id: `candidate:${candidates.length}`,
          definitions: [definition],
          triggers: [],
          fingerprints: [fingerprint],
          warnings: [...warnings],
        },
        definitionFingerprints: [fingerprint],
      });
      continue;
    }

    const target = candidates[matched.candidateIndex];
    target.candidate.definitions.push(definition);
    target.candidate.fingerprints.push(fingerprint);
    target.definitionFingerprints.push(fingerprint);
    target.candidate.warnings.push(...warnings);
    if (matched.match.reason) {
      target.candidate.warnings.push(matched.match.reason);
    }
  }

  return candidates;
};

const createSupplyCandidates = (
  definitions: ItemDefinitionEvidence[]
): CandidateState[] => {
  const supplyDefinitions = definitions.filter(definition => definition.definitionSourceType === 'supply');
  return createDefinitionCandidates(supplyDefinitions);
};

const attachDefinitionsToCandidates = (
  candidates: CandidateState[],
  definitions: ItemDefinitionEvidence[]
): ItemDefinitionEvidence[] => {
  const unlinked: ItemDefinitionEvidence[] = [];

  for (const definition of definitions) {
    const { fingerprint, warnings } = buildDefinitionFingerprint(definition);
    const matched = findBestCandidateForDefinition(definition, fingerprint, candidates);

    if (!matched) {
      unlinked.push(definition);
      continue;
    }

    const target = candidates[matched.candidateIndex];
    target.candidate.definitions.push(definition);
    target.candidate.fingerprints.push(fingerprint);
    target.definitionFingerprints.push(fingerprint);
    target.candidate.warnings.push(...warnings);
    if (matched.match.reason) {
      target.candidate.warnings.push(matched.match.reason);
    }
  }

  return unlinked;
};

const strengthRank = (strength?: LinkMatch['strength']): number => {
  switch (strength) {
    case 'strong':
      return 3;
    case 'medium':
      return 2;
    case 'weak':
      return 1;
    default:
      return 0;
  }
};

const findBestCandidateForTrigger = (
  triggerFingerprint: ItemFingerprint,
  candidates: CandidateState[]
): TriggerMatchCandidate | undefined => {
  let best: TriggerMatchCandidate | undefined;

  for (let i = 0; i < candidates.length; i++) {
    const candidateState = candidates[i];

    for (const definitionFingerprint of candidateState.definitionFingerprints) {
      const match = matchFingerprints(definitionFingerprint, triggerFingerprint);
      if (!match.matched) continue;

      if (!best || strengthRank(match.strength) > strengthRank(best.match.strength)) {
        best = {
          candidateIndex: i,
          match,
        };
      }
    }
  }

  return best;
};

export const linkItemEvidence = (
  definitions: ItemDefinitionEvidence[],
  triggers: ItemTriggerEvidence[]
): LinkResult => {
  const parametricDefinitions = definitions.filter(isParametricDefinition);
  const templateDefinitions = definitions.filter(definition => isTemplateDefinition(definition) && !isParametricDefinition(definition));
  const supplyDefinitions = definitions.filter(definition => definition.definitionSourceType === 'supply');
  const datapackDefinitions = definitions.filter(definition => definition.definitionSourceType !== 'supply');
  const supplyCandidates = createSupplyCandidates(supplyDefinitions);
  const unlinkedDatapackDefinitions = attachDefinitionsToCandidates(
    supplyCandidates,
    datapackDefinitions.filter(definition => !isTemplateDefinition(definition))
  );
  const candidates = supplyCandidates;

  const unlinkedTriggers: ItemTriggerEvidence[] = [];
  const nonItemTriggers: ItemTriggerEvidence[] = [];
  const warnings: string[] = [];

  for (const trigger of triggers) {
    const { fingerprint: triggerFingerprint, warnings: triggerWarnings } =
      buildTriggerFingerprint(trigger);

    if (!hasAnyIdentity(triggerFingerprint)) {
      nonItemTriggers.push(trigger);
      continue;
    }

    const best = findBestCandidateForTrigger(triggerFingerprint, candidates);

    if (!best) {
      unlinkedTriggers.push(trigger);
      continue;
    }

    const target = candidates[best.candidateIndex];
    target.candidate.triggers.push(trigger);
    target.candidate.fingerprints.push(triggerFingerprint);

    if (triggerWarnings.length > 0) {
      target.candidate.warnings.push(...triggerWarnings);
    }

    if (best.match.ruleName) {
      target.candidate.warnings.push(
        `Linked trigger '${trigger.advancementId}' by rule '${best.match.ruleName}'`
      );
    }

    if (best.match.reason) {
      target.candidate.warnings.push(best.match.reason);
    }
  }

  const linkedItems = candidates.map(({ candidate }) => candidate);

  const unlinkedDefinitions = linkedItems
    .filter(candidate => candidate.triggers.length === 0)
    .flatMap(candidate => candidate.definitions)
    .concat(unlinkedDatapackDefinitions);

  return {
    linkedItems,
    unlinkedDefinitions,
    templateDefinitions,
    parametricDefinitions,
    unlinkedTriggers,
    nonItemTriggers,
    warnings,
  };
};
