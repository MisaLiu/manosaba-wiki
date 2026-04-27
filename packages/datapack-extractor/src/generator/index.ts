import type { LinkResult, LinkedItemCandidate } from '../linker/types';
import type { VariantAnalysisResult } from '../variants/types';
import { buildIdentity } from './identity';
import { buildPrimaryCanonicalKey, buildPrimaryDescription, buildPrimaryDescriptionRich, buildPrimaryName, buildPrimaryTextureKey, getPrimaryRawTypes, toSlug } from './helpers';
import { mapItemTypes } from './types-map';
import type { Item, GenerateItemsResult } from './types';
import { buildVariantGroup } from './variants';

const getVariantAnalysisMap = (result: VariantAnalysisResult) => {
  return new Map(result.analyses.map(analysis => [analysis.sourceCandidateId, analysis]));
};

const buildItem = (
  candidate: LinkedItemCandidate,
  analysisMap: Map<string, VariantAnalysisResult['analyses'][number]>
): Item => {
  const name = buildPrimaryName(candidate);
  const canonicalKey = buildPrimaryCanonicalKey(candidate);
  const analysis = analysisMap.get(candidate.id);
  const rawTypes = getPrimaryRawTypes(candidate);
  const types = mapItemTypes(rawTypes);
  const description = buildPrimaryDescription(candidate);

  return {
    id: candidate.id,
    canonicalKey,
    sourceCandidateId: candidate.id,
    name,
    slug: toSlug(name),
    types: types.length > 0 ? types : undefined,
    rawTypes: rawTypes.length > 0 ? rawTypes : undefined,
    textureKey: buildPrimaryTextureKey(candidate),
    description,
    descriptionRich: buildPrimaryDescriptionRich(candidate),
    identity: buildIdentity(candidate),
    variant: analysis ? buildVariantGroup(analysis, candidate) : undefined,
    warnings: candidate.warnings.length > 0 ? candidate.warnings : undefined,
  };
};

export const generateItems = (
  linkResult: LinkResult,
  variantResult: VariantAnalysisResult,
): GenerateItemsResult => {
  const analysisMap = getVariantAnalysisMap(variantResult);

  return {
    items: linkResult.linkedItems.map(candidate => buildItem(candidate, analysisMap)),
    warnings: [],
  };
};
