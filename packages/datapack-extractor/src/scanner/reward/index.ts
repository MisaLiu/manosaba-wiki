import { inferSourceDir, inferSourceStem } from '../../utils/fs'
import { readContainerAt } from '../../utils/region'
import { extractKnownFields } from '../supply/fields'
import { containerFilter } from '../supply/utils'
import { rewardContainerLocations, type RewardContainerLocation } from './rooms'
import type { SupplyDefinitionEvidence } from '../supply/types'
import type { ContainerItemStack } from '../../utils/region/types'

const REWARD_SLOT_COUNT = 27
const REWARD_PROBABILITY = 1 / REWARD_SLOT_COUNT

const componentParser = (component?: Record<string, unknown>) => {
  if (!component) return undefined
  const result: Record<string, string> = {}
  for (const key of Object.keys(component)) {
    const value = component[key]
    result[key] = typeof value === 'string' ? value : JSON.stringify(value)
  }
  return result
}

const buildRewardSourcePath = (loc: RewardContainerLocation, layer: 'template' | 'replacement') =>
  `reward:${loc.roomId}:${layer}`

const buildDefinitionFromItem = (
  loc: RewardContainerLocation,
  item: ContainerItemStack,
  layer: 'template' | 'replacement',
): SupplyDefinitionEvidence => {
  const sourcePath = buildRewardSourcePath(loc, layer)

  return {
    kind: 'supply_definition',
    sourcePath,
    sourceStem: inferSourceStem(sourcePath),
    sourceDir: inferSourceDir(sourcePath),
    namespace: 'reward',
    slot: item.slot >= 0 ? `container.${item.slot}` : undefined,
    layer,
    sourceSlot: item.slot,
    sourceLayer: layer,
    locationName: loc.roomId,
    probability: REWARD_PROBABILITY,
    baseItemId: item.id,
    count: item.count,
    rawComponents: componentParser(item.components),
    ...extractKnownFields(item.components ?? {}),
    warnings: [],
  }
}

const scanLocationLayer = async (
  loc: RewardContainerLocation,
  layer: 'template' | 'replacement',
): Promise<SupplyDefinitionEvidence[]> => {
  const y = layer === 'template' ? loc.templateY : loc.replaceY

  const snapshot = await readContainerAt(WORLD_ROOT, { x: loc.x, y, z: loc.posZ })
  const items = containerFilter(snapshot)

  return items.map(item => buildDefinitionFromItem(loc, item, layer))
}

const scanSingleLocation = async (
  loc: RewardContainerLocation,
): Promise<{ template: SupplyDefinitionEvidence[]; replacement: SupplyDefinitionEvidence[] }> => {
  const template = await scanLocationLayer(loc, 'template')
  const replacement = await scanLocationLayer(loc, 'replacement')

  return { template, replacement }
}

export const scanRewardDefinitions = async () => {
  const template: SupplyDefinitionEvidence[] = []
  const replacement: SupplyDefinitionEvidence[] = []

  for (const loc of rewardContainerLocations) {
    const result = await scanSingleLocation(loc)
    template.push(...result.template)
    replacement.push(...result.replacement)
  }

  return { template, replacement }
}
