import { inferNamespace, inferSourceStem, inferSourceDir } from '../../utils/fs'
import type { ItemDefinitionEvidence } from '../item/types'
import type { WeaponScanData } from './types'

const getValue = <T = unknown>(components: Record<string, unknown>, key: string): T | undefined => {
  return components[`minecraft:${key}`] as T ?? components[key] as T ?? undefined
}

const componentParser = (components?: Record<string, unknown>): Record<string, string> | undefined => {
  if (!components) return undefined
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(components)) {
    result[key] = typeof value === 'string' ? value : JSON.stringify(value)
  }
  return result
}

export const adaptWeaponToItemDefinition = (weapon: WeaponScanData): ItemDefinitionEvidence => {
  const components = weapon.itemData.components

  return {
    kind: 'item_definition',
    definitionSourceType: 'mcfunction',
    sourcePath: weapon.sourcePath,
    sourceStem: inferSourceStem(weapon.sourcePath),
    sourceDir: inferSourceDir(weapon.sourcePath),
    namespace: inferNamespace(weapon.sourcePath),
    commandType: 'give',
    baseItemId: weapon.itemData.baseItemId,
    count: weapon.itemData.count,
    rawComponents: componentParser(components),
    itemModel: getValue<string>(components, 'item_model'),
    itemNameRaw: getValue(components, 'item_name'),
    customNameRaw: getValue<object>(components, 'custom_name'),
    loreRaw: getValue<Array<unknown>>(components, 'lore'),
    customDataRaw: getValue<object>(components, 'custom_data'),
    maxStackSize: getValue<number>(components, 'max_stack_size'),
    maxDamage: getValue<number>(components, 'max_damage'),
    damage: getValue<number>(components, 'damage'),
    warnings: [],
  }
}

export const adaptWeaponsToItemDefinitions = (
  weapons: WeaponScanData[],
): ItemDefinitionEvidence[] => {
  return weapons.map(adaptWeaponToItemDefinition)
}
