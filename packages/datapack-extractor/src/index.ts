import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { filterIngameItemDefinitions, filterIngameItemTriggers } from './filter/ingame';
import { generateItems } from './generator/index';
import { generateRecipes } from './generator/recipes';
import { augmentItemsWithWeaponInfo } from './generator/weapon';
import { extractTextures } from './generator/texture';
import { linkItemEvidence } from './linker/index';
import { adaptRecipeResultsToItemDefinitions } from './scanner/recipe/adapter';
import { scanRecipes } from './scanner/recipe';
import { scanItemDefinitions as scanDatapackItemDefinitions } from './scanner/item';
import { adaptSupplyDefinitionsToItemDefinitions } from './scanner/supply/adapter';
import { scanItemDefinitions as scanSupplyDefinitions } from './scanner/supply';
import { scanItemTriggerEvidence } from './scanner/advancement';
import { analyzeVariants } from './variants/index';
import { scanWeaponDefinitions } from './scanner/weapon';
import { adaptWeaponsToItemDefinitions } from './scanner/weapon/adapter';
import { scanRewardDefinitions } from './scanner/reward';

const OUTPUT_PATH = path.resolve(process.cwd(), 'dist/items.json');
const RECIPES_OUTPUT_PATH = path.resolve(process.cwd(), 'dist/recipes.json');

export const buildArtifacts = async () => {
  const supplyDefinitions = await scanSupplyDefinitions();
  const rewardDefinitions = await scanRewardDefinitions();
  const datapackDefinitions = await scanDatapackItemDefinitions();
  const weaponDefinitions = await scanWeaponDefinitions();
  const recipes = await scanRecipes();
  const allDefinitions = [
    ...adaptSupplyDefinitionsToItemDefinitions(supplyDefinitions.template),
    ...adaptSupplyDefinitionsToItemDefinitions(supplyDefinitions.replacement),
    ...adaptSupplyDefinitionsToItemDefinitions(rewardDefinitions.template),
    ...adaptSupplyDefinitionsToItemDefinitions(rewardDefinitions.replacement),
    ...adaptRecipeResultsToItemDefinitions(recipes),
    ...datapackDefinitions,
    ...adaptWeaponsToItemDefinitions(weaponDefinitions),
  ];
  const allTriggers = await scanItemTriggerEvidence();

  const definitions = filterIngameItemDefinitions(allDefinitions);
  const triggers = filterIngameItemTriggers(allTriggers);

  const linkResult = linkItemEvidence(definitions, triggers);
  const variantResult = analyzeVariants(linkResult);
  const recipesOut = generateRecipes(recipes, linkResult.linkedItems);
  const generated = generateItems(linkResult, variantResult, recipesOut);
  const augmentedItems = augmentItemsWithWeaponInfo(generated.items, weaponDefinitions);

  const textureMap = await extractTextures(augmentedItems, {
    resourcePackPath: path.resolve(PROJECT_ROOT, 'resourcepack'),
    outputDir: path.resolve(process.cwd(), 'dist/textures'),
    vanillaCacheDir: path.resolve(PROJECT_ROOT, 'packages/datapack-extractor/assets/vanilla-textures'),
    vanillaVersion: '1.21.10',
    vanillaBaseUrl: 'https://assets.mcasset.cloud/{version}',
  });

  return {
    definitions,
    triggers,
    recipes,
    supplyDefinitions,
    rewardDefinitions,
    weaponDefinitions,
    linkResult,
    variantResult,
    items: {
      ...generated,
      items: augmentedItems,
    },
    textureMap,
    recipesOut,
  };
};

export const writeArtifacts = async () => {
  const result = await buildArtifacts();

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, JSON.stringify(result.items.items, null, 2), 'utf8');
  await writeFile(RECIPES_OUTPUT_PATH, JSON.stringify(result.recipesOut, null, 2), 'utf8');

  const TEXTURE_MAP_PATH = path.resolve(process.cwd(), 'dist/textures/map.json');
  const mapObj: Record<string, import('./generator/texture').TextureEntry> = {}
  for (const [key, entry] of result.textureMap) {
    mapObj[key] = entry
  }
  await writeFile(TEXTURE_MAP_PATH, JSON.stringify(mapObj, null, 2), 'utf8');

  return result;
};

writeArtifacts().then((result) => {
  console.log('Wrote items.json');
  console.log('Wrote recipes.json');
  console.log(`Wrote ${result.textureMap.size} textures`);
  console.log({
    definitionCount: result.definitions.length,
    triggerCount: result.triggers.length,
    recipeCount: result.recipes.length,
    supplyTemplateCount: result.supplyDefinitions.template.length,
    supplyReplacementCount: result.supplyDefinitions.replacement.length,
    rewardTemplateCount: result.rewardDefinitions.template.length,
    rewardReplacementCount: result.rewardDefinitions.replacement.length,
    weaponCount: result.weaponDefinitions.length,
    linkedItemCount: result.linkResult.linkedItems.length,
    variantAnalysisCount: result.variantResult.analyses.length,
    itemCount: result.items.items.length,
  });
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
