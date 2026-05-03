import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { WeaponSpawnCount } from '../types'

const FUNCTION_DIR = path.resolve(DATAPACK_ROOT, 'data/manosaba/function')

const RANDOM_VALUE_RE = /random value (\d+)\.\.(\d+)/
const FIXED_SET_RE = /scoreboard players set weapon:data (\w+) (\d+)/
const DIRECT_TAG_RE = /^\s*tag @e\[.*?limit=(\d+),sort=random\]/

const resolveRandomPath = (name: string): string =>
  path.resolve(FUNCTION_DIR, `weapon/main/summon/${name}/${name}_random.mcfunction`)

const getCountFromLine = (
  line: string,
): { condition?: 'below10' | 'above10'; range: [number, number] } | null => {
  const randomMatch = line.match(RANDOM_VALUE_RE)
  if (randomMatch) {
    const condition = line.includes('unless score weapon:data alive') ? 'below10'
      : line.includes('if score weapon:data alive') ? 'above10'
      : undefined
    return { condition, range: [Number(randomMatch[1]), Number(randomMatch[2])] }
  }

  const fixedMatch = line.match(FIXED_SET_RE)
  if (fixedMatch) {
    const condition = line.includes('unless score weapon:data alive') ? 'below10'
      : line.includes('if score weapon:data alive') ? 'above10'
      : undefined
    const v = Number(fixedMatch[2])
    return { condition, range: [v, v] }
  }

  return null
}

export const parseRandom = async (name: string): Promise<WeaponSpawnCount> => {
  const filePath = resolveRandomPath(name)
  const content = await readFile(filePath, { encoding: 'utf8' })
  const lines = content.split('\n')

  let below10: [number, number] | undefined
  let above10: [number, number] | undefined
  let fixed: number | undefined

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const countResult = getCountFromLine(trimmed)
    if (countResult) {
      if (countResult.condition === 'below10') {
        below10 = countResult.range
      } else if (countResult.condition === 'above10') {
        above10 = countResult.range
      } else {
        fixed = countResult.range[0]
      }
      continue
    }

    const directTag = trimmed.match(DIRECT_TAG_RE)
    if (directTag) {
      fixed = Number(directTag[1])
    }
  }

  if (below10 || above10) {
    return { mode: 'random', below10, above10 }
  }

  if (fixed !== undefined) {
    return { mode: 'random', fixed }
  }

  throw new Error(`[_random] Could not determine spawn count in: ${filePath}`)
}
