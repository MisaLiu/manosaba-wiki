import { scanSupplyTypeFiles } from './files';
import { parseSupplyTypeFile } from './parse';
import { buildSupplyLocationSnapshot } from './probability';
import { readContainerAt } from '../index';
import type { SupplyLocationSnapshot } from '../types';

const SUPPLY_X = 1029;
const SUPPLY_Y = 41;

export const readSupplyLocations = async (worldPath: string): Promise<SupplyLocationSnapshot[]> => {
  const files = await scanSupplyTypeFiles();
  const configs = (await Promise.all(files.map(file => parseSupplyTypeFile(file))))
    .filter((config): config is NonNullable<typeof config> => Boolean(config));

  const snapshots = await Promise.all(configs.map(async (config) => {
    const container = await readContainerAt(worldPath, {
      x: SUPPLY_X,
      y: SUPPLY_Y,
      z: config.posZ,
    });

    if (!container) {
      return undefined;
    }

    return buildSupplyLocationSnapshot(config, container);
  }));

  return snapshots.filter((snapshot): snapshot is SupplyLocationSnapshot => Boolean(snapshot));
};
