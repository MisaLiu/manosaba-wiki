import path from 'node:path';
import type { ContainerItemStack, ContainerSnapshot } from '../../utils/region/types';

export const containerFilter = (snapshot?: ContainerSnapshot) => {
  if (!snapshot) return [];

  const { items } = snapshot;
  if (!items) return [];
  return (
    items
      .filter(e => !!e.id)
  );
};

const getItemNameValue = (item?: ContainerItemStack): string | undefined => {
  const components = item?.components;
  if (!components || typeof components !== 'object') {
    return undefined;
  }

  const value = components['minecraft:item_name'] ?? components.item_name;
  return typeof value === 'string' ? value : undefined;
};

export const isUniquePlaceholder = (item?: ContainerItemStack): boolean => {
  return getItemNameValue(item) === 'unique';
};

export const isReplacementPlaceholder = (item?: ContainerItemStack): boolean => {
  return item?.id === 'minecraft:barrier' && getItemNameValue(item) === 'placeholder';
};

export const inferLocationName = (filePath: string): string => {
  const parent = path.basename(path.dirname(filePath));
  return parent.replace(/^\d+_/, '');
};
