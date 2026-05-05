import { buildDefinitionFingerprint } from '../linker/fingerprint';
import { normalizeBaseItemId, normalizeCustomData, normalizeCustomName } from '../linker/normalizer';
import { buildPrimaryDescriptionRich, buildPrimaryName, buildPrimaryTextureKey } from './helpers';
import type { LinkedItemCandidate } from '../linker/types';
import type { Recipe } from '@manosaba/types';
import type { RecipeEvidence } from '../scanner/recipe/types';

const normalizeIngredient = (ingredient?: { itemId?: string; tagId?: string }) => {
  if (!ingredient) {
    return undefined;
  }

  return {
    baseItemId: normalizeBaseItemId((ingredient as { baseItemId?: string }).baseItemId ?? ingredient.itemId) ?? (ingredient as { baseItemId?: string }).baseItemId ?? ingredient.itemId,
    tagId: ingredient.tagId,
  };
};

const normalizeRecipeKind = (recipeType: RecipeEvidence['recipeType']): Recipe['kind'] => {
  if (recipeType === 'minecraft:crafting_shaped' || recipeType === 'crafting_shaped') return 'crafting_shaped';
  if (recipeType === 'campfire_cooking') return 'campfire_cooking';
  return 'crafting_shapeless';
};

const buildIngredientItemId = (
  ingredient: { baseItemId?: string; itemId?: string; tagId?: string } | undefined,
  candidates: LinkedItemCandidate[],
): string | undefined => {
  if (!ingredient) return undefined;

  const baseItemId = normalizeBaseItemId(ingredient.baseItemId ?? ingredient.itemId);
  if (!baseItemId) {
    return undefined;
  }

  const matched = candidates.find(candidate =>
    candidate.definitions.some(definition => normalizeBaseItemId(definition.baseItemId) === baseItemId)
  );

  return matched?.id;
};

const matchesCandidate = (candidate: LinkedItemCandidate, recipe: RecipeEvidence): boolean => {
  const recipeBaseItemId = normalizeBaseItemId(recipe.resultBaseItemId);
  const recipeCustomName = normalizeCustomName(recipe.resultCustomNameRaw);
  const recipeCustomData = normalizeCustomData(recipe.resultCustomDataRaw);
  const recipeItemModel = recipe.resultItemModel?.trim();

  return candidate.definitions.some((definition) => {
    const { fingerprint } = buildDefinitionFingerprint(definition);

    if (fingerprint.itemModel && recipeItemModel && fingerprint.itemModel === recipeItemModel) {
      return true;
    }

    if (
      fingerprint.baseItemId &&
      recipeBaseItemId &&
      fingerprint.customDataNormalized &&
      recipeCustomData &&
      fingerprint.baseItemId === recipeBaseItemId &&
      fingerprint.customDataNormalized === recipeCustomData
    ) {
      return true;
    }

    if (fingerprint.customNameNormalized && recipeCustomName && fingerprint.customNameNormalized === recipeCustomName) {
      return true;
    }

    return false;
  });
};

const buildLinkedItemId = (
  recipe: RecipeEvidence,
  candidates: LinkedItemCandidate[],
): string | undefined => {
  return candidates.find((candidate) => matchesCandidate(candidate, recipe))?.id;
};

const buildCandidateInfoMap = (candidates: LinkedItemCandidate[]): Map<string, { name: string; textureKey?: string; descriptionRich?: unknown }> => {
  const map = new Map<string, { name: string; textureKey?: string; descriptionRich?: unknown }>()
  for (const c of candidates) {
    map.set(c.id, {
      name: buildPrimaryName(c),
      textureKey: buildPrimaryTextureKey(c),
      descriptionRich: buildPrimaryDescriptionRich(c),
    })
  }
  return map
}

const enrichIngredient = (
  ingredient: { baseItemId?: string; itemId?: string } | undefined,
  infoMap: Map<string, { name: string; textureKey?: string; descriptionRich?: unknown }>,
) => {
  if (!ingredient) return undefined
  const info = ingredient.itemId ? infoMap.get(ingredient.itemId) : undefined
  return {
    ...ingredient,
    name: info?.name,
    textureKey: info?.textureKey ?? ingredient.baseItemId,
    descriptionRich: info?.descriptionRich,
  }
}

const enrichResult = (
  result: Recipe['result'],
  linkedItemId: string | undefined,
  infoMap: Map<string, { name: string; textureKey?: string; descriptionRich?: unknown }>,
): Recipe['result'] => {
  const info = linkedItemId ? infoMap.get(linkedItemId) : undefined
  return {
    ...result,
    name: info?.name ?? result.customName,
    textureKey: info?.textureKey ?? result.itemModel ?? result.baseItemId,
    descriptionRich: info?.descriptionRich,
  }
}

export const generateRecipes = (
  recipes: RecipeEvidence[],
  candidates: LinkedItemCandidate[],
): Recipe[] => {
  const infoMap = buildCandidateInfoMap(candidates)

  return recipes.map((recipe) => ({
    id: recipe.id,
    kind: normalizeRecipeKind(recipe.recipeType),
    pattern: recipe.pattern,
    key: recipe.key
      ? Object.fromEntries(
        Object.entries(recipe.key)
          .map(([symbol, ingredient]) => [symbol, normalizeIngredient(ingredient)])
          .filter((entry): entry is [string, NonNullable<ReturnType<typeof normalizeIngredient>>] => Boolean(entry[1]))
      )
      : undefined,
    ingredients: recipe.ingredients
      ?.map(ingredient => normalizeIngredient(ingredient))
      .filter((entry): entry is NonNullable<ReturnType<typeof normalizeIngredient>> => Boolean(entry)),
    input: normalizeIngredient(recipe.input),
    material: normalizeIngredient(recipe.material),
    ingredient: normalizeIngredient(recipe.ingredient),
    result: enrichResult({
      baseItemId: normalizeBaseItemId(recipe.resultBaseItemId),
      itemModel: recipe.resultItemModel,
      customName: normalizeCustomName(recipe.resultCustomNameRaw),
      customData: normalizeCustomData(recipe.resultCustomDataRaw),
      count: recipe.resultCount,
    }, buildLinkedItemId(recipe, candidates), infoMap),
    linkedItemId: buildLinkedItemId(recipe, candidates),
    warnings: recipe.warnings.length > 0 ? recipe.warnings : undefined,
  })).map((recipe) => ({
    ...recipe,
    key: recipe.key
      ? Object.fromEntries(
        Object.entries(recipe.key)
          .map(([symbol, ingredient]) => [
            symbol,
            ingredient && typeof ingredient === 'object'
              ? enrichIngredient({
                  baseItemId: normalizeBaseItemId((ingredient as { baseItemId?: string; itemId?: string }).baseItemId ?? (ingredient as { itemId?: string }).itemId),
                  ...ingredient,
                  itemId: buildIngredientItemId(ingredient, candidates),
                }, infoMap)
              : ingredient,
          ])
          .filter((entry): entry is [string, NonNullable<(typeof recipe.key)[string]>] => Boolean(entry[1]))
      )
      : undefined,
    ingredients: recipe.ingredients
      ? recipe.ingredients.map(ingredient => enrichIngredient({
          baseItemId: normalizeBaseItemId((ingredient as { baseItemId?: string; itemId?: string }).baseItemId ?? (ingredient as { itemId?: string }).itemId),
          ...ingredient,
          itemId: buildIngredientItemId(ingredient, candidates),
        }, infoMap))
      : undefined,
    input: recipe.input
      ? enrichIngredient({
          baseItemId: normalizeBaseItemId((recipe.input as { baseItemId?: string; itemId?: string }).baseItemId ?? recipe.input.itemId),
          ...recipe.input,
          itemId: buildIngredientItemId(recipe.input, candidates),
        }, infoMap)
      : undefined,
    material: recipe.material
      ? enrichIngredient({
          baseItemId: normalizeBaseItemId((recipe.material as { baseItemId?: string; itemId?: string }).baseItemId ?? recipe.material.itemId),
          ...recipe.material,
          itemId: buildIngredientItemId(recipe.material, candidates),
        }, infoMap)
      : undefined,
    ingredient: recipe.ingredient
      ? enrichIngredient({
          baseItemId: normalizeBaseItemId((recipe.ingredient as { baseItemId?: string; itemId?: string }).baseItemId ?? recipe.ingredient.itemId),
          ...recipe.ingredient,
          itemId: buildIngredientItemId(recipe.ingredient, candidates),
        }, infoMap)
      : undefined,
  })).map((recipe) => {
    if (recipe.kind === 'crafting_shaped' || recipe.kind === 'campfire_cooking') return recipe

    const unifiedIngredients = recipe.ingredients
      ?? (recipe.input && recipe.material ? [recipe.input, recipe.material] : undefined)

    return {
      ...recipe,
      ingredients: unifiedIngredients,
      input: undefined,
      material: undefined,
    }
  });
};
