import type { ItemDefinitionEvidence } from '../item/types';
import type { SupplyDefinitionEvidence } from './types';

export const adaptSupplyDefinitionToItemDefinition = (
  definition: SupplyDefinitionEvidence,
): ItemDefinitionEvidence => {
  return {
    kind: 'item_definition',
    definitionSourceType: 'supply',
    sourcePath: definition.sourcePath,
    sourceStem: definition.sourceStem,
    sourceDir: definition.sourceDir,
    namespace: definition.namespace,
    commandType: 'give',
    slot: definition.slot,
    layer: definition.layer,
    locationName: definition.locationName,
    probability: definition.probability,
    baseItemId: definition.baseItemId,
    count: definition.count,
    rawComponents: definition.rawComponents,
    itemModel: definition.itemModel,
    customNameRaw: definition.customName,
    loreRaw: definition.lore,
    customDataRaw: definition.customData,
    maxStackSize: definition.maxStackSize,
    maxDamage: definition.maxDamage,
    damage: definition.damage,
    warnings: definition.warnings,
  };
};

export const adaptSupplyDefinitionsToItemDefinitions = (
  definitions: SupplyDefinitionEvidence[],
): ItemDefinitionEvidence[] => {
  return definitions.map(adaptSupplyDefinitionToItemDefinition);
};
