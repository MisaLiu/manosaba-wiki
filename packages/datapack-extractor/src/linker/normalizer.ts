import { normalizeSnbtLike, normalizeTextComponentLike } from '../utils/snbt';

const toRawString = (value: unknown): string | undefined => {
  if (value === undefined || value === null) return undefined;
  return typeof value === 'string' ? value : JSON.stringify(value);
};

export const normalizeBaseItemId = (value?: string): string | undefined => {
  if (!value) return undefined;

  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return undefined;

  return trimmed.includes(':') ? trimmed : `minecraft:${trimmed}`;
};

export const normalizeCustomData = (value?: unknown): string | undefined => {
  const raw = toRawString(value);
  if (!raw) return undefined;

  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  const normalized = normalizeSnbtLike(trimmed);
  if (normalized) {
    return normalized;
  }

  return trimmed.replace(/\s+/g, '');
};

export const normalizeCustomName = (value?: unknown): string | undefined => {
  const raw = toRawString(value);
  if (!raw) return undefined;

  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  const looksLikeStructuredComponent =
    trimmed.startsWith('{') ||
    trimmed.startsWith('[') ||
    trimmed.startsWith('"');

  if (looksLikeStructuredComponent) {
    return normalizeTextComponentLike(trimmed);
  }

  const normalized = normalizeTextComponentLike(trimmed);
  return normalized ?? trimmed;
};
