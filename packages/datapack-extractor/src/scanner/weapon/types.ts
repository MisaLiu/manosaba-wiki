export interface WeaponPosition {
  x: number
  y: number
  z: number
  cost: number
  sourcePath: string
  room?: string
}

export interface WeaponItemData {
  baseItemId: string
  count: number
  components: Record<string, unknown>
}

export interface WeaponSpawnCount {
  mode: 'random' | 'all'
  below10?: [number, number]
  above10?: [number, number]
  fixed?: number
}

export interface WeaponScanData {
  name: string
  spawnCount: WeaponSpawnCount
  cost: number
  itemData: WeaponItemData
  positions: WeaponPosition[]
  sourcePath: string
}

export interface WeaponScanResult {
  definitions: import('../item/types').ItemDefinitionEvidence[]
  weaponData: Map<string, WeaponScanData>
}
