import { normalizeTextComponentLike, parseSnbtLike } from '../utils/snbt';

const toRawString = (value: unknown): string | undefined => {
  if (value === undefined || value === null) return undefined;
  return typeof value === 'string' ? value : JSON.stringify(value);
};

export const splitTopLevelLoreEntries = (input: string): string[] => {
  const content = input.slice(1, -1);
  const entries: string[] = [];
  let current = '';
  let squareDepth = 0;
  let braceDepth = 0;
  let inString = false;
  let escaped = false;

  for (const char of content) {
    current += char;

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === '[') squareDepth++;
    if (char === ']') squareDepth--;
    if (char === '{') braceDepth++;
    if (char === '}') braceDepth--;
    if (char === ',' && squareDepth === 0 && braceDepth === 0) {
      entries.push(current.slice(0, -1).trim());
      current = '';
    }
  }

  const trimmed = current.trim();
  if (trimmed) {
    entries.push(trimmed);
  }

  return entries;
};

const stringifyLoreEntry = (value: unknown): string | undefined => {
  const normalized = typeof value === 'string'
    ? normalizeTextComponentLike(value)
    : normalizeTextComponentLike(JSON.stringify(value));
  const trimmed = normalized?.trim();

  if (!trimmed || trimmed === '""' || trimmed === '{"text":""}') {
    return undefined;
  }

  return trimmed;
};

export const parseLoreLines = (loreRaw?: unknown): string[] => {
  const raw = toRawString(loreRaw);
  if (!raw) return [];

  const trimmed = raw.trim();
  if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) {
    return [];
  }

  const parsed = parseSnbtLike(trimmed);
  if (Array.isArray(parsed)) {
    return parsed
      .map(entry => stringifyLoreEntry(entry))
      .filter((entry): entry is string => Boolean(entry));
  }

  return splitTopLevelLoreEntries(trimmed)
    .map(entry => stringifyLoreEntry(entry))
    .filter((entry): entry is string => Boolean(entry));
};

export const getLoreDescription = (loreLines: string[]): string | undefined => {
  if (loreLines.length === 0) return undefined;
  if (loreLines.length === 1) return loreLines[0];

  return loreLines.slice(0, -1).join('\n') || undefined;
};

export const getLoreTypeCandidates = (loreLines: string[]): string[] => {
  if (loreLines.length === 0) return [];

  const lastLine = loreLines[loreLines.length - 1];
  if (!lastLine) return [];

  return lastLine
    .split('/')
    .map(part => part.trim().toLowerCase())
    .filter(Boolean);
};
