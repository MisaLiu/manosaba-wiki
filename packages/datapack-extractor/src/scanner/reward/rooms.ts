import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

const EXPLORE_DIR = path.resolve(DATAPACK_ROOT, 'data/tasks/function/private/explore')
const REWARD_DIR = path.resolve(DATAPACK_ROOT, 'data/tasks/function/task_frame/reward_give')

const TASK_ROOM_TO_ROOM_ID: Record<string, string> = {
  atrium: 'atrium',
  lobby1f: 'hallway_1st',
  showerroom: 'shower_room',
  burnroom: 'burn_room',
  noahstudio: 'noah_studio',
  library: 'libaray',
  punishmentroom: 'punishment_room',
  museum: 'museum',
  receptionroom: 'reception_room',
  playroom: 'play_room',
  lobby2f: 'hallway_2nd',
  liveroom1f: 'liveroom_1st',
  liveroom2f: 'liveroom_2nd',
  infirmary: 'infirmary',
  guestroom: 'guest_room',
}

export interface RewardContainerLocation {
  x: number
  templateY: number
  replaceY: number
  posZ: number
  taskRoomName: string
  roomId: string
}

const extractPosZ = (content: string): number | undefined => {
  const match = content.match(/posZ["\s:=]+(\d+)/)
  if (!match) return undefined
  return Number(match[1])
}

const listDetectFiles = (): string[] => {
  const results: string[] = []
  const entries = readdirSync(EXPLORE_DIR, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const dirPath = path.join(EXPLORE_DIR, entry.name)
    const files = readdirSync(dirPath)
    for (const file of files) {
      if (file.includes('_detect') && file.endsWith('.mcfunction')) {
        results.push(path.join(dirPath, file))
      }
    }
  }

  return results
}

const buildPosZMap = (): Map<number, string> => {
  const map = new Map<number, string>()
  const detectFiles = listDetectFiles()

  for (const file of detectFiles) {
    const dirName = path.basename(path.dirname(file))
    // Strip number prefix: "1_atrium" → "atrium"
    const taskRoomName = dirName.replace(/^\d+_/, '')
    const content = readFileSync(file, 'utf8')
    const posZ = extractPosZ(content)
    if (posZ !== undefined) {
      map.set(posZ, taskRoomName)
    }
  }

  return map
}

const extractBlockCoords = (filePath: string): { x: number; templateY: number; replaceY: number } | undefined => {
  const content = readFileSync(filePath, 'utf8')

  const templateMatch = content.match(/data modify entity.*?set from block (\d+) (\d+) \$\(posZ\)/)
  if (!templateMatch) return undefined

  const x = Number(templateMatch[1])
  const templateY = Number(templateMatch[2])

  const allSetFrom = [...content.matchAll(/set from block (\d+) (\d+) \$\(posZ\) Items\[/g)]
  const last = allSetFrom[allSetFrom.length - 1]
  const replaceY = last ? Number(last[2]) : templateY

  return { x, templateY, replaceY }
}

const buildContainerLocations = (): RewardContainerLocation[] => {
  const posZMap = buildPosZMap()
  const rewardFiles = readdirSync(REWARD_DIR)
    .filter(f => f.endsWith('.mcfunction'))
    .map(f => path.join(REWARD_DIR, f))

  const locations: RewardContainerLocation[] = []

  for (const file of rewardFiles) {
    const coords = extractBlockCoords(file)
    if (!coords) continue

    for (const [posZ, taskRoomName] of posZMap) {
      const roomId = TASK_ROOM_TO_ROOM_ID[taskRoomName] ?? taskRoomName
      locations.push({
        x: coords.x,
        templateY: coords.templateY,
        replaceY: coords.replaceY,
        posZ,
        taskRoomName,
        roomId,
      })
    }
  }

  return locations
}

export const rewardContainerLocations: RewardContainerLocation[] = buildContainerLocations()
