import { readFile } from 'node:fs/promises'
import path from 'node:path'

const FUNCTION_DIR = path.resolve(DATAPACK_ROOT, 'data/manosaba/function')
const ASSIGN_PATH = path.resolve(FUNCTION_DIR, 'weapon/main/assign/assign_main.mcfunction')

const ASSIGN_LINE_RE = /^function\s+manosaba:weapon\/main\/summon\/(\w+)\/\1_(random|all)$/

export interface AssignEntry {
  name: string
  mode: 'random' | 'all'
}

export const parseAssign = async (): Promise<AssignEntry[]> => {
  const content = await readFile(ASSIGN_PATH, { encoding: 'utf8' })
  const lines = content.split('\n')

  const weaponEntries = new Map<string, 'random' | 'all'>()

  for (const line of lines) {
    const trimmed = line.trim()
    const match = trimmed.match(ASSIGN_LINE_RE)
    if (!match) continue

    const [, name, suffix] = match

    if (suffix === 'random') {
      weaponEntries.set(name, 'random')
    } else if (!weaponEntries.has(name)) {
      weaponEntries.set(name, 'all')
    }
  }

  return Array.from(weaponEntries, ([name, mode]) => ({ name, mode }))
}
