export type ItemType =
  | 'weapon'
  | 'consumable'
  | 'tool'
  | 'quest'
  | 'clue'
  | 'magic'
  | 'utility'
  | 'magical_utility'
  | 'unknown';

export interface ItemIdentity {
  baseItemId?: string,
  itemModel?: string,
  customName?: string,
  customData?: string,
}

export interface RichTextMarks {
  color?: string,
  bold?: boolean,
  italic?: boolean,
  underlined?: boolean,
  strikethrough?: boolean,
  obfuscated?: boolean,
}

export interface RichTextSpan {
  text: string,
  marks?: RichTextMarks,
}

export interface RichTextBlock {
  type: 'paragraph',
  children: RichTextSpan[],
}

export interface RichTextDocument {
  type: 'doc',
  blocks: RichTextBlock[],
}

export interface LocationSource {
  type: 'location',
  name: string,
  probability?: number,
  implementation?: 'loot_table' | 'manual' | 'unknown',
  lootTableId?: string,
}

export interface CraftingSource {
  type: 'crafting',
  recipeId: string,
}

export type ItemSource = LocationSource | CraftingSource;

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
  warnings?: string[],
}

export interface GenerateItemsResult {
  items: Item[],
  warnings: string[],
}
