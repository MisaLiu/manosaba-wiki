export interface BlockCoordinate {
  x: number,
  y: number,
  z: number,
}

export interface ContainerItemStack {
  slot: number,
  id?: string,
  count?: number,
  components?: unknown,
}

export interface ContainerSnapshot {
  coordinate: BlockCoordinate,
  id?: string,
  customName?: unknown,
  items: ContainerItemStack[],
}

export interface SlotRangeProbability {
  start: number,
  end: number,
  probability: number,
}

export interface SupplyLocationConfig {
  name: string,
  posZ: number,
  sourcePath: string,
  slotRanges: SlotRangeProbability[],
}

export interface SupplyLocationItemProbability {
  slot: number,
  probability: number,
  stack: ContainerItemStack,
}

export interface SupplyLocationSnapshot {
  location: SupplyLocationConfig,
  container: ContainerSnapshot,
  items: SupplyLocationItemProbability[],
}
