import type { ContainerSnapshot, SupplyLocationConfig, SupplyLocationItemProbability, SupplyLocationSnapshot } from '../types';

const buildSlotProbabilityMap = (config: SupplyLocationConfig): Map<number, number> => {
  const map = new Map<number, number>();

  for (const range of config.slotRanges) {
    const slotCount = range.end - range.start + 1;
    const perSlotProbability = range.probability / slotCount;

    for (let slot = range.start; slot <= range.end; slot++) {
      map.set(slot, perSlotProbability);
    }
  }

  return map;
};

export const buildSupplyLocationSnapshot = (
  config: SupplyLocationConfig,
  container: ContainerSnapshot,
): SupplyLocationSnapshot => {
  const probabilityMap = buildSlotProbabilityMap(config);

  const items: SupplyLocationItemProbability[] = container.items
    .map((stack) => ({
      slot: stack.slot,
      probability: probabilityMap.get(stack.slot) ?? 0,
      stack,
    }))
    .filter(item => item.probability > 0);

  return {
    location: config,
    container,
    items,
  };
};
