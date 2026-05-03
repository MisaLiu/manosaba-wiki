import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { parseSnbtLike } from '../../../utils/snbt'
import type { WeaponItemData } from '../types'

const FUNCTION_DIR = path.resolve(DATAPACK_ROOT, 'data/manosaba/function')

const SNBT_LINE_RE = /data modify storage weapon:data save\.(\w+) set value (.+)/
const COST_TAG_RE = /tag @e\[.*?\] add weaponCost(\d)/

const resolveAllPath = (name: string): string =>
  path.resolve(FUNCTION_DIR, `weapon/main/summon/${name}/${name}_all.mcfunction`)

const extractSnbt = (content: string): string | undefined => {
  const match = content.match(SNBT_LINE_RE)
  if (!match) return undefined
  return match[2]
}

const extractCost = (content: string): number | undefined => {
  const match = content.match(COST_TAG_RE)
  if (!match) return undefined
  return Number(match[1])
}

const splitCompoundEntries = (content: string): [string, string][] => {
  const entries: [string, string][] = []
  let pos = 0

  while (pos < content.length) {
    while (pos < content.length && content[pos] === ' ') pos++
    if (pos >= content.length) break

    let inString = false
    let quoteChar = ''
    let colonPos = -1

    for (let i = pos; i < content.length; i++) {
      const ch = content[i]

      if (inString) {
        if (ch === '\\') { i++; continue }
        if (ch === quoteChar) { inString = false }
        continue
      }

      if (ch === '"' || ch === "'") {
        inString = true
        quoteChar = ch
        continue
      }

      if (ch === ':') {
        colonPos = i
        break
      }
    }

    if (colonPos === -1) break

    const key = content.slice(pos, colonPos).trim().replace(/^["']|["']$/g, '')

    let valueStart = colonPos + 1
    let valueEnd = content.length
    let braceDepth = 0
    let squareDepth = 0
    inString = false
    quoteChar = ''

    for (let i = valueStart; i < content.length; i++) {
      const ch = content[i]

      if (inString) {
        if (ch === '\\') { i++; continue }
        if (ch === quoteChar) { inString = false }
        continue
      }

      if (ch === '"' || ch === "'") {
        inString = true
        quoteChar = ch
        continue
      }

      if (ch === '{') braceDepth++
      if (ch === '}') braceDepth--
      if (ch === '[') squareDepth++
      if (ch === ']') squareDepth--

      if (ch === ',' && braceDepth === 0 && squareDepth === 0) {
        valueEnd = i
        break
      }
    }

    const value = content.slice(valueStart, valueEnd).trim()
    entries.push([key, value])
    pos = valueEnd + 1
  }

  return entries
}

const parseSnbtCompound = (input: string): Record<string, unknown> => {
  const trimmed = input.trim()

  const content = trimmed.slice(1, -1).trim()
  if (!content) return {}

  const entries = splitCompoundEntries(content)
  const result: Record<string, unknown> = {}

  for (const [key, value] of entries) {
    const trimmedVal = value.trim()

    if (trimmedVal.startsWith('{')) {
      result[key] = parseSnbtCompound(trimmedVal)
    } else {
      result[key] = parseSnbtLike(trimmedVal) ?? trimmedVal
    }
  }

  return result
}

export interface ParsedAllResult {
  itemData: WeaponItemData
  cost: number
}

export const parseAll = async (name: string): Promise<ParsedAllResult> => {
  const filePath = resolveAllPath(name)
  const content = await readFile(filePath, { encoding: 'utf8' })

  const snbt = extractSnbt(content)
  if (!snbt) {
    throw new Error(`[_all] Could not find SNBT line in: ${filePath}`)
  }

  let parsed: Record<string, unknown>
  try {
    parsed = parseSnbtCompound(snbt)
  } catch (e) {
    throw new Error(`[_all] Failed to parse SNBT in ${filePath}: ${(e as Error).message}`)
  }

  const id = parsed.id as string | undefined
  const count = parsed.count as number | undefined
  const components = parsed.components as Record<string, unknown> | undefined

  if (!id) throw new Error(`[_all] Missing 'id' in SNBT: ${filePath}`)
  if (!components) throw new Error(`[_all] Missing 'components' in SNBT: ${filePath}`)

  const cost = extractCost(content)
  if (!cost) {
    throw new Error(`[_all] Could not find cost tag in: ${filePath}`)
  }

  return {
    itemData: {
      baseItemId: id,
      count: typeof count === 'number' ? count : 1,
      components,
    },
    cost,
  }
}
