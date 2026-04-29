import { readFile } from 'node:fs/promises';
import { inferSourceDir, inferSourceStem } from '../../utils/fs';
import { readContainerAt } from '../../utils/region';
import { extractKnownFields, buildProbabilityMap } from './fields';
import { scanSupplyDefinitionFiles } from './files';
import { getSupplyPosZ, getSupplyRanges } from './parse';
import { containerFilter, inferLocationName } from './utils';
import type { SupplyDefinitionEvidence, SupplyScanResult } from './types';
import type { ContainerItemStack } from '../../utils/region/types';

const SupplyPosX = 1029;
const SupplyStoragePosY = 45;
const SupplyReplacePosY = 44;

const componentParser = (component?: Record<string, unknown>) => {
  const result: Record<string, string> = {};
  if (!component) return undefined;

  for (const key of Object.keys(component)) {
    const value = component[key];
    result[key] = typeof value === 'string' ? value : JSON.stringify(value);
  }

  return result;
};

const buildDefinitionFromItem = (
  filePath: string,
  item: ContainerItemStack,
  layer: 'template' | 'replacement',
  locationName: string,
  ranges: SupplyDefinitionEvidence['slotRanges'],
  probability: number | undefined,
): SupplyDefinitionEvidence => ({
  kind: 'supply_definition',
  sourcePath: filePath,
  sourceStem: inferSourceStem(filePath),
  sourceDir: inferSourceDir(filePath),
  namespace: 'supply',
  slot: item.slot >= 0 ? `container.${item.slot}` : undefined,
  layer,
  sourceSlot: item.slot,
  sourceLayer: layer,
  locationName,
  slotRanges: ranges,
  probability,
  baseItemId: item.id,
  count: item.count,
  rawComponents: componentParser(item.components),
  ...extractKnownFields(item.components ?? {}),
  warnings: [],
});

export const extractItemDefinitionsFromSupply = async (
  filePath: string,
  isReplace: boolean = false,
): Promise<SupplyDefinitionEvidence[]> => {
  const content = await readFile(filePath, { encoding: 'utf8' });

  const supplyRanges = getSupplyRanges(content);
  const supplyPosZ = getSupplyPosZ(content) ?? NaN;
  const probabilityMap = buildProbabilityMap(supplyRanges);

  if (isNaN(supplyPosZ)) {
    throw new Error(`Cannot parse supply container Z coords in definition: ${filePath}`);
  }

  const containerItems = containerFilter(
    await readContainerAt(
      WORLD_ROOT,
      {
        x: SupplyPosX,
        y: !isReplace ? SupplyStoragePosY : SupplyReplacePosY,
        z: supplyPosZ,
      }
    )
  );

  const locationName = inferLocationName(filePath);
  const evidences: SupplyDefinitionEvidence[] = [];

  for (const item of containerItems) {
    const ranges = supplyRanges.filter(e => item.slot >= e.slotStart && item.slot <= e.slotEnd);

    evidences.push(buildDefinitionFromItem(
      filePath,
      item,
      !isReplace ? 'template' : 'replacement',
      locationName,
      ranges,
      probabilityMap.get(item.slot),
    ));
  }

  return evidences;
};

export const scanItemDefinitions = async (): Promise<SupplyScanResult> => {
  const fileList = await scanSupplyDefinitionFiles();
  const template: SupplyDefinitionEvidence[] = [];
  const replacement: SupplyDefinitionEvidence[] = [];

  for (const filePath of fileList) {
    const templateDefinitions = await extractItemDefinitionsFromSupply(filePath);
    const replacementDefinitions = await extractItemDefinitionsFromSupply(filePath, true);

    template.push(...templateDefinitions);
    replacement.push(...replacementDefinitions);
  }

  return {
    template,
    replacement,
  };
};
