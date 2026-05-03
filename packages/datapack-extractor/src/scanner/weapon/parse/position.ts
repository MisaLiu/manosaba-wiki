import { readFile } from 'node:fs/promises'
import type { WeaponPosition } from '../types'

const COORD_RE = /\$summon\s+minecraft:item_display\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+\{/
const COST_RE = /data:\{"cost":(\d+)\}/

export const parsePositions = async (filePath: string): Promise<WeaponPosition[]> => {
  const content = await readFile(filePath, { encoding: 'utf8' })
  const lines = content.split('\n')
  const positions: WeaponPosition[] = []

  for (const line of lines) {
    const coordMatch = line.match(COORD_RE)
    if (!coordMatch) continue

    const costMatch = line.match(COST_RE)
    if (!costMatch) continue

    positions.push({
      x: Number(coordMatch[1]),
      y: Number(coordMatch[2]),
      z: Number(coordMatch[3]),
      cost: Number(costMatch[1]),
      sourcePath: filePath,
    })
  }

  return positions
}
