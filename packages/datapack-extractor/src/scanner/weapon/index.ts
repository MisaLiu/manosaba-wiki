import path from 'node:path'
import { glob } from 'tinyglobby'
import { parseAssign } from './parse/assign'
import { parseAll } from './parse/all'
import { parseRandom } from './parse/random'
import { parsePositions } from './parse/position'
import { resolveRoom } from './room'
import type { WeaponPosition, WeaponScanData } from './types'

const FUNCTION_PREFIX = 'data/manosaba/function'

export const discoverPositionFiles = async (name: string): Promise<string[]> => {
  const dir = `${FUNCTION_PREFIX}/weapon/main/summon/${name}`

  const results = await glob(
    [
      `${dir}/${name}[0-9]*.mcfunction`,
      `${dir}/${name}.mcfunction`,
    ],
    {
      cwd: DATAPACK_ROOT,
      absolute: true,
    },
  )

  return results.filter((f) => {
    const basename = path.basename(f, '.mcfunction')
    return !basename.endsWith('_all') && !basename.endsWith('_random')
  })
}

const buildAllPath = (name: string): string =>
  path.resolve(DATAPACK_ROOT, `${FUNCTION_PREFIX}/weapon/main/summon/${name}/${name}_all.mcfunction`)

export const scanWeaponDefinitions = async (): Promise<WeaponScanData[]> => {
  const entries = await parseAssign()
  const weapons: WeaponScanData[] = []

  for (const entry of entries) {
    const { itemData, cost } = await parseAll(entry.name)

    const spawnCount = entry.mode === 'random'
      ? await parseRandom(entry.name)
      : { mode: 'all' as const }

    const positionFiles = await discoverPositionFiles(entry.name)

    const positions: WeaponPosition[] = []
    for (const posFile of positionFiles) {
      const filePositions = await parsePositions(posFile)
      positions.push(...filePositions)
    }

    for (const pos of positions) {
      pos.room = resolveRoom(pos.x, pos.y, pos.z)
    }

    weapons.push({
      name: entry.name,
      spawnCount,
      cost,
      itemData,
      positions,
      sourcePath: buildAllPath(entry.name),
    })
  }

  return weapons
}
