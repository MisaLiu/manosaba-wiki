import type { RichTextDocument } from './richtext';

export type ItemType =
  | 'weapon'
  // | 'consumable'
  | 'food'
  | 'medicine'
  | 'tool'
  // | 'quest'
  // | 'clue'
  // | 'magic'
  | 'utility'
  | 'magical_utility'
  | 'accessories'
  | 'unknown';

export interface ItemIdentity {
  baseItemId?: string,
  itemModel?: string,
  customName?: string,
  customData?: string,
}

export interface LocationSource {
  type: 'location',
  name: string,
  count?: number,
  probability?: number,
  implementation?: 'loot_table' | 'manual' | 'unknown',
  lootTableId?: string,
}

export interface CraftingSource {
  type: 'crafting',
  recipeId: string,
}

export interface TaskRewardSource {
  type: 'task_reward',
  name: string,
  role?: 'civil' | 'werewolf' | 'third_party',
  count?: number,
  probability?: number,
}

export type ItemSource = LocationSource | CraftingSource | TaskRewardSource;

export interface WeaponStat {
  attribute: string
  amount: number
  operation: string
}

export interface WeaponSpawnCount {
  mode: 'random' | 'all'
  below10?: [number, number]
  above10?: [number, number]
  fixed?: number
}

export interface WeaponInfo {
  rooms: Record<string, number>
  cost: number
  spawnCount: WeaponSpawnCount
  durability: number
  stats: WeaponStat[]
  baseItemId: string
  damageType?: 'sharp' | 'blunt'
  consumable?: boolean
  useCooldown?: { group: string; seconds: number }
}

export interface EffectReward {
  type: 'effect',
  id: string,
  level?: number,
  duration?: number,
  probability?: number,
}

export interface ItemGrantReward {
  type: 'item',
  id: string,
  count?: number,
  probability?: number,
}

export interface UnknownReward {
  type: 'unknown',
  detail: string,
}

export type ItemReward = EffectReward | ItemGrantReward | UnknownReward;

export interface RewardGroup {
  triggerId?: string,
  probability?: number,
  rewards: ItemReward[],
  warnings?: string[],
}

export interface ItemVariant {
  id?: string,
  name: string,
  slug?: string,
  textureKey?: string,
  description?: string,
  descriptionRich?: RichTextDocument,
  itemModel?: string,
  customData?: string,
  stateKey?: string,
  stateValue?: string | number | boolean,
  rewards?: RewardGroup[],
}

export interface ItemVariantGroup {
  type: 'state' | 'indexed' | 'unknown',
  axisKey?: string,
  axisLabel?: string,
  variants: ItemVariant[],
}

export interface Item {
  id: string,
  canonicalKey: string,
  sourceCandidateId: string,
  name: string,
  slug?: string,
  aliases?: string[],
  types?: ItemType[],
  rawTypes?: string[],
  textureKey?: string,
  description?: string,
  descriptionRich?: RichTextDocument,
  identity?: ItemIdentity,
  sources?: ItemSource[],
  rewardGroups?: RewardGroup[],
  variant?: ItemVariantGroup,
  weapon?: WeaponInfo,
  warnings?: string[],
}
