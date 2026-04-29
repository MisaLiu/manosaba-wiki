import path from 'node:path';
import type { ContainerSnapshot } from '../../utils/region/types';

export const containerFilter = (snapshot?: ContainerSnapshot) => {
  if (!snapshot) return [];

  const { items } = snapshot;
  if (!items) return [];
  return (
    items
      .filter(e => !!e.components)
      .filter(e => e.id !== 'minecraft:barrier')
  );
};

export const inferLocationName = (filePath: string): string => {
  const parent = path.basename(path.dirname(filePath));
  return parent.replace(/^\d+_/, '');
};
