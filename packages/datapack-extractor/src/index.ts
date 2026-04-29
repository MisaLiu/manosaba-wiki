import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { filterIngameItemDefinitions, filterIngameItemTriggers } from './filter/ingame';
import { generateItems } from './generator/index';
import { generateRecipes } from './generator/recipes';
import { linkItemEvidence } from './linker/index';
import { scanRecipes } from './scanner/recipe';
import { scanItemDefinitions as scanDatapackItemDefinitions } from './scanner/item';
import { adaptSupplyDefinitionsToItemDefinitions } from './scanner/supply/adapter';
import { scanItemDefinitions as scanSupplyDefinitions } from './scanner/supply';
import { scanItemTriggerEvidence } from './scanner/advancement';
import { analyzeVariants } from './variants/index';

const OUTPUT_PATH = path.resolve(process.cwd(), 'dist/items.json');
const RECIPES_OUTPUT_PATH = path.resolve(process.cwd(), 'dist/recipes.json');

export const buildArtifacts = async () => {
  const supplyDefinitions = await scanSupplyDefinitions();
  const datapackDefinitions = await scanDatapackItemDefinitions();
  const allDefinitions = [
    ...adaptSupplyDefinitionsToItemDefinitions(supplyDefinitions.logical),
    ...datapackDefinitions,
  ];
  const allTriggers = await scanItemTriggerEvidence();
  const recipes = await scanRecipes();

  const definitions = filterIngameItemDefinitions(allDefinitions);
  const triggers = filterIngameItemTriggers(allTriggers);

  const linkResult = linkItemEvidence(definitions, triggers);
  const variantResult = analyzeVariants(linkResult);
  const recipesOut = generateRecipes(recipes, linkResult.linkedItems);
  const items = generateItems(linkResult, variantResult, recipesOut);

  return {
    definitions,
    triggers,
    recipes,
    supplyDefinitions,
    linkResult,
    variantResult,
    items,
    recipesOut,
  };
};

export const writeArtifacts = async () => {
  const result = await buildArtifacts();

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, JSON.stringify(result.items.items, null, 2), 'utf8');
  await writeFile(RECIPES_OUTPUT_PATH, JSON.stringify(result.recipesOut, null, 2), 'utf8');

  return result;
};
