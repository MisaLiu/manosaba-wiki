import type { ItemSource, LocationSource, TaskRewardSource } from '@manosaba/types';
import type { LinkedItemCandidate } from '../linker/types';
import type { ItemDefinitionEvidence } from '../scanner/item/types';

const REWARD_SLOTS = 27

const X_TO_ROLE: Record<number, TaskRewardSource['role']> = {
  1027: 'civil',
  1025: 'werewolf',
  1023: 'third_party',
}

const buildLocationSource = (definition: ItemDefinitionEvidence): LocationSource => {
  return {
    type: 'location',
    name: definition.locationName ?? 'unknown',
    count: definition.count,
    probability: definition.probability,
    implementation: 'manual',
  };
};

const buildSourceKey = (source: LocationSource): string => {
  return [
    source.name,
    source.count ?? '',
    source.implementation ?? '',
    source.lootTableId ?? '',
  ].join('|');
};

export const buildLocationSourcesForCandidate = (
  candidate: LinkedItemCandidate,
  _supplies: unknown[] = [],
): ItemSource[] => {
  const aggregated = new Map<string, LocationSource>();
  const rewardSlotCounts = new Map<string, number>();

  for (const definition of candidate.definitions) {
    if (definition.definitionSourceType !== 'supply') {
      continue;
    }

    if (definition.namespace === 'reward') {
      const rawName = definition.locationName ?? ''
      const colonIdx = rawName.indexOf(':')
      const x = colonIdx >= 0 ? Number(rawName.slice(0, colonIdx)) : 0
      const room = colonIdx >= 0 ? rawName.slice(colonIdx + 1) : rawName
      const itemCount = definition.count ?? 1

      const key = `${room}:${x}:${itemCount}`
      rewardSlotCounts.set(key, (rewardSlotCounts.get(key) ?? 0) + 1)
      continue
    }

    const source = buildLocationSource(definition);
    const key = buildSourceKey(source);
    const existing = aggregated.get(key);

    if (existing) {
      aggregated.set(key, {
        ...existing,
        probability: (existing.probability ?? 0) + (source.probability ?? 0),
      });
      continue;
    }

    aggregated.set(key, source);
  }

  const sources: ItemSource[] = Array.from(aggregated.values());

  const roomRoleCounts = new Map<string, Map<string, { slots: number; count: number }>>()

  for (const [key, slots] of rewardSlotCounts) {
    const [room, xStr, countStr] = key.split(':')
    const x = Number(xStr)
    const count = Number(countStr)
    const role = X_TO_ROLE[x]
    if (!role) continue

    const roomRoleKey = `${room}:${role}:${count}`
    let roleMap = roomRoleCounts.get(room)
    if (!roleMap) {
      roleMap = new Map()
      roomRoleCounts.set(room, roleMap)
    }
    const existing = roleMap.get(roomRoleKey)
    roleMap.set(roomRoleKey, {
      slots: (existing?.slots ?? 0) + slots,
      count: Math.max(existing?.count ?? 0, count),
    })
  }

  for (const [room, roleMap] of roomRoleCounts) {
    const roleEntries: { role: NonNullable<TaskRewardSource['role']>; count: number; prob: number }[] = []

    for (const [key, data] of roleMap) {
      const parts = key.split(':')
      const role = parts[1] as NonNullable<TaskRewardSource['role']>
      const count = Number(parts[2])
      roleEntries.push({ role, count, prob: data.slots / REWARD_SLOTS })
    }

    if (roleEntries.length === 0) continue

    const countGroups = new Map<number, typeof roleEntries>()
    for (const re of roleEntries) {
      if (!countGroups.has(re.count)) countGroups.set(re.count, [])
      countGroups.get(re.count)!.push(re)
    }

    for (const [count, group] of countGroups) {
      const allSame = group.length >= 2
        && group.every((r, _, arr) => r.prob === arr[0].prob)

      if (allSame) {
        sources.push({
          type: 'task_reward',
          name: room,
          count,
          probability: group[0].prob,
        })
      } else {
        for (const re of group) {
          if (re.prob > 0) {
            sources.push({
              type: 'task_reward',
              name: room,
              role: re.role,
              count,
              probability: re.prob,
            })
          }
        }
      }
    }
  }

  return sources;
};
