import { readFileSync } from 'node:fs'
import path from 'node:path'

export interface RoomBounds {
  x1: number
  x2: number
  y1: number
  y2: number
  z1: number
  z2: number
}

const BOUNDS_PATH = path.resolve(PROJECT_ROOT, 'packages/datapack-extractor/assets/room-bounds.json')
const TOLERANCE = 0.5

const boundData = JSON.parse(readFileSync(BOUNDS_PATH, 'utf8')) as Record<string, RoomBounds>

const bounds: Record<string, RoomBounds> = {}

for (const [room, box] of Object.entries(boundData)) {
  bounds[room] = {
    x1: Math.min(box.x1, box.x2),
    x2: Math.max(box.x1, box.x2),
    y1: Math.min(box.y1, box.y2),
    y2: Math.max(box.y1, box.y2),
    z1: Math.min(box.z1, box.z2),
    z2: Math.max(box.z1, box.z2),
  }
}

export const resolveRoom = (x: number, y: number, z: number): string | undefined => {
  for (const [room, box] of Object.entries(bounds)) {
    if (x >= box.x1 - TOLERANCE && x <= box.x2 + TOLERANCE
      && y >= box.y1 - TOLERANCE && y <= box.y2 + TOLERANCE
      && z >= box.z1 - TOLERANCE && z <= box.z2 + TOLERANCE) {
      return room
    }
  }
  return undefined
}

export const getRoomNames = (): string[] => Object.keys(bounds)
