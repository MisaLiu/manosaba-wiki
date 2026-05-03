import type { Item, WeaponInfo, WeaponStat } from '@manosaba/types'
import type { WeaponScanData } from '../scanner/weapon/types'

const buildWeaponInfo = (weapon: WeaponScanData): WeaponInfo => {
  const components = weapon.itemData.components

  const rooms: Record<string, number> = {}
  for (const pos of weapon.positions) {
    if (pos.room) {
      rooms[pos.room] = (rooms[pos.room] || 0) + 1
    }
  }

  const stats: WeaponStat[] = []
  const modifiers = components['minecraft:attribute_modifiers'] as Array<Record<string, unknown>> | undefined
  if (Array.isArray(modifiers)) {
    for (const mod of modifiers) {
      stats.push({
        attribute: mod.type as string,
        amount: mod.amount as number,
        operation: mod.operation as string,
      })
    }
  }

  let damageType: 'sharp' | 'blunt' | undefined
  const customData = components['minecraft:custom_data'] as Record<string, unknown> | undefined
  if (customData) {
    if (customData.sharp === 1) damageType = 'sharp'
    else if (customData.blunt === 1 || customData.additional_damage === 1) damageType = 'blunt'
  }

  const cooldown = components['minecraft:use_cooldown'] as { cooldown_group?: string; seconds?: number } | undefined

  return {
    rooms,
    cost: weapon.cost,
    spawnCount: weapon.spawnCount,
    durability: (components['minecraft:max_damage'] as number) ?? 0,
    stats,
    baseItemId: weapon.itemData.baseItemId,
    damageType,
    consumable: components['minecraft:consumable'] !== undefined ? true : undefined,
    useCooldown: cooldown ? { group: cooldown.cooldown_group ?? '', seconds: cooldown.seconds ?? 0 } : undefined,
  }
}

export const augmentItemsWithWeaponInfo = (
  items: Item[],
  weapons: WeaponScanData[],
): Item[] => {
  const modelMap = new Map<string, WeaponScanData>()
  const baseItemMap = new Map<string, WeaponScanData[]>()

  for (const w of weapons) {
    const model = (w.itemData.components['minecraft:item_model'] as string) ?? ''
    if (model) {
      modelMap.set(model, w)
    }
    const baseId = w.itemData.baseItemId
    if (!baseItemMap.has(baseId)) baseItemMap.set(baseId, [])
    baseItemMap.get(baseId)!.push(w)
  }

  return items.map(item => {
    if (!item.id.startsWith('weapon:')) return item

    let weapon: WeaponScanData | undefined

    if (item.identity?.itemModel) {
      weapon = modelMap.get(item.identity.itemModel)
    }

    if (!weapon) {
      const candidates = baseItemMap.get(item.identity?.baseItemId ?? '') ?? []
      weapon = candidates.find(w => {
        const customName = w.itemData.components['minecraft:custom_name'] as { text?: string } | undefined
        return customName?.text === item.name
      })
    }

    if (!weapon) return item

    return { ...item, weapon: buildWeaponInfo(weapon) }
  })
}
