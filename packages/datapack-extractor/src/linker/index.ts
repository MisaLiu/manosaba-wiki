import { buildDefinitionFingerprint, buildTriggerFingerprint } from './fingerprint';
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

const matchDefinitionFingerprints = (
  left: ItemFingerprint,
  right: ItemFingerprint
): LinkMatch => {
  if (left.itemModel && right.itemModel && left.itemModel === right.itemModel) {
    return {
      matched: true,
      strength: 'strong',
      ruleName: 'itemModel',
      reason: `Merged definitions by itemModel '${left.itemModel}'`,
    };
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

const findBestCandidateForDefinition = (
  definitionFingerprint: ItemFingerprint,
  candidates: CandidateState[]
): DefinitionMatchCandidate | undefined => {
  let best: DefinitionMatchCandidate | undefined;

  for (let i = 0; i < candidates.length; i++) {
    const candidateState = candidates[i];

    for (const fingerprint of candidateState.definitionFingerprints) {
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
    const matched = findBestCandidateForDefinition(fingerprint, candidates);

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
  const candidates = createDefinitionCandidates(definitions);

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
    .flatMap(candidate => candidate.definitions);

  return {
    linkedItems,
    unlinkedDefinitions,
    unlinkedTriggers,
    nonItemTriggers,
    warnings,
  };
};
