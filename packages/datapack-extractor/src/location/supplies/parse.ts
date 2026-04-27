import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { SlotRangeProbability, SupplyLocationConfig } from '../types';

const POS_Z_REG = /scoreboard players set @s posZ (-?\d+)/;
const RANGE_REG = /supply_level=(\d+)\.\.(\d+)\}.*random value (\d+)\.\.(\d+)/;

const parseRangeProbability = (line: string): SlotRangeProbability | undefined => {
  const match = line.match(RANGE_REG);
  if (!match) return undefined;

  const scoreStart = Number(match[1]);
  const scoreEnd = Number(match[2]);
  const slotStart = Number(match[3]);
  const slotEnd = Number(match[4]);

  return {
    start: slotStart,
    end: slotEnd,
    probability: (scoreEnd - scoreStart + 1) / 100,
  };
};

const inferLocationName = (filePath: string): string => {
  const parent = path.basename(path.dirname(filePath));
  return parent.replace(/^\d+_/, '');
};

export const parseSupplyTypeFile = async (filePath: string): Promise<SupplyLocationConfig | undefined> => {
  const content = await readFile(filePath, 'utf8');
  const lines = content.split('\n').map(line => line.trim()).filter(Boolean);

  const posZ = lines
    .map(line => line.match(POS_Z_REG))
    .find(Boolean)?.[1];

  if (!posZ) {
    return undefined;
  }

  const slotRanges = lines
    .map(parseRangeProbability)
    .filter((range): range is SlotRangeProbability => Boolean(range));

  return {
    name: inferLocationName(filePath),
    posZ: Number(posZ),
    sourcePath: filePath,
    slotRanges,
  };
};
