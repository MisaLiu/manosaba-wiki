import { readFile, mkdir, copyFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { Item } from '@manosaba/types'

export interface TextureOptions {
  resourcePackPath: string
  outputDir: string
  vanillaCacheDir: string
  vanillaVersion: string
  vanillaBaseUrl: string
}

export interface TextureEntry {
  url: string
  animated?: boolean
  frameWidth?: number
  frameCount?: number
  frameTime?: number
}

type TextureMap = Map<string, TextureEntry>

const resolveModelRef = (itemDef: unknown): string | undefined => {
  if (typeof itemDef !== 'object' || itemDef === null) return undefined

  const model = (itemDef as Record<string, unknown>).model as Record<string, unknown> | undefined
  if (!model) return undefined

  const type = model.type as string | undefined

  if (type === 'minecraft:model') {
    return model.model as string | undefined
  }

  if (type === 'minecraft:select') {
    const cases = model.cases as Array<Record<string, unknown>> | undefined
    const property = model.property as string | undefined

    if (property === 'minecraft:display_context' && cases) {
      for (const c of cases) {
        const when = c.when as string[] | undefined
        const caseModel = c.model as Record<string, unknown> | undefined
        if (when && when.includes('gui') && caseModel?.type === 'minecraft:model') {
          return caseModel.model as string | undefined
        }
      }
    }

    const fallback = model.fallback as Record<string, unknown> | undefined
    if (fallback?.type === 'minecraft:model') {
      return fallback.model as string | undefined
    }
  }

  return undefined
}

const resolveTextureRef = (modelData: Record<string, unknown>): string | undefined => {
  const textures = modelData.textures as Record<string, string> | undefined
  if (!textures) return undefined

  const layer0 = textures.layer0 ?? textures.default
  if (layer0) return layer0

  for (const key of Object.keys(textures)) {
    if (key !== 'particle') return textures[key]
  }

  return undefined
}

const resolveTexturePath = (texRef: string, modelNamespace: string): string => {
  if (texRef.includes(':')) {
    const [ns, ...rest] = texRef.split(':')
    const r = rest.join(':')
    const p = r.startsWith('item/') ? r : `item/${r}`
    return `assets/${ns}/textures/${p}.png`
  }

  return `assets/${modelNamespace}/textures/item/${texRef}.png`
}

const readItemDefinition = async (resourcePackPath: string, namespace: string, name: string): Promise<unknown | undefined> => {
  const itemPath = path.join(resourcePackPath, 'assets', namespace, 'items', `${name}.json`)
  try {
    const raw = await readFile(itemPath, 'utf8')
    return JSON.parse(raw)
  } catch {
    return undefined
  }
}

const readModelData = async (resourcePackPath: string, modelRef: string): Promise<Record<string, unknown> | undefined> => {
  const [ns, ...rest] = modelRef.split(':')
  const p = rest.join(':')
  const modelPath = path.join(resourcePackPath, 'assets', ns, 'models', `${p}.json`)
  try {
    const raw = await readFile(modelPath, 'utf8')
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return undefined
  }
}

const getCustomTexturePath = async (
  resourcePackPath: string,
  textureKey: string,
): Promise<string | undefined> => {
  const [namespace, name] = textureKey.split(':')
  if (!namespace || !name) return undefined

  const itemDef = await readItemDefinition(resourcePackPath, namespace, name)
  if (!itemDef) return undefined

  const modelRef = resolveModelRef(itemDef)
  if (!modelRef) return undefined

  const modelNs = modelRef.split(':')[0]
  const modelData = await readModelData(resourcePackPath, modelRef)
  if (!modelData) return undefined

  const texRef = resolveTextureRef(modelData)
  if (!texRef) return undefined

  const texPath = resolveTexturePath(texRef, modelNs)
  if (!texPath) return undefined

  const fullPath = path.join(resourcePackPath, texPath)
  try {
    await readFile(fullPath)
    return fullPath
  } catch {
    return undefined
  }
}

const readPngDimensions = (buffer: Buffer): { width: number; height: number } | undefined => {
  if (buffer.length < 24) return undefined
  // PNG signature: 8 bytes, IHDR chunk: length(4) + 'IHDR'(4) + width(4) + height(4)
  if (buffer.toString('utf8', 1, 4) !== 'PNG') return undefined
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  }
}

const readAnimationMeta = async (srcPath: string): Promise<{ frameCount: number; frameWidth: number; frameTime: number } | undefined> => {
  const mcmetaPath = `${srcPath}.mcmeta`
  try {
    const raw = await readFile(mcmetaPath, 'utf8')
    const meta = JSON.parse(raw)
    const anim = meta?.animation
    if (!anim) return undefined

    const buffer = await readFile(srcPath)
    const dims = readPngDimensions(buffer)
    if (!dims) return undefined

    const frameWidth = dims.width
    const frameCount = dims.height / frameWidth
    if (frameCount < 2 || !Number.isInteger(frameCount)) return undefined

    const frameTime = typeof anim.frametime === 'number' ? anim.frametime : 1

    return { frameCount, frameWidth, frameTime }
  } catch {
    return undefined
  }
}

const VANILLA_TEXTURE_FALLBACK: Record<string, { name: string; path?: string }> = {
  crossbow: { name: 'crossbow_standby' },
  stone: { name: 'stone', path: 'block' },
  glowstone: { name: 'glowstone_dust' },
  compass: { name: 'compass_00' },
}

const downloadVanillaTexture = async (options: TextureOptions, name: string, subpath?: string): Promise<Buffer | undefined> => {
  const texturePath = subpath ? `textures/${subpath}` : 'textures/item'
  const url = `${options.vanillaBaseUrl.replace('{version}', options.vanillaVersion)}/assets/minecraft/${texturePath}/${name}.png`
  try {
    const resp = await fetch(url)
    if (!resp.ok) return undefined
    const contentType = resp.headers.get('content-type') ?? ''
    if (!contentType.includes('image')) return undefined
    return Buffer.from(await resp.arrayBuffer())
  } catch {
    return undefined
  }
}

const resolveVanillaTexture = async (
  name: string,
  options: TextureOptions,
): Promise<string | undefined> => {
  const tryDownload = async (n: string, p?: string): Promise<string | undefined> => {
    const cacheName = p ? `${p}_${n}` : n
    const cachePath = path.join(options.vanillaCacheDir, `${cacheName}.png`)

    try {
      await readFile(cachePath)
      return cachePath
    } catch {
      const data = await downloadVanillaTexture(options, n, p)
      if (!data) return undefined

      await mkdir(path.dirname(cachePath), { recursive: true })
      await writeFile(cachePath, data)
      return cachePath
    }
  }

  let result = await tryDownload(name)
  if (result) return result

  const fallback = VANILLA_TEXTURE_FALLBACK[name]
  if (fallback) {
    result = await tryDownload(fallback.name, fallback.path)
    if (result) return result
  }

  return undefined
}

export const extractTextures = async (
  items: Item[],
  options: TextureOptions,
): Promise<TextureMap> => {
  const textureMap = new Map<string, TextureEntry>()
  const processed = new Set<string>()
  const uniqueKeys = new Set(items.map(i => i.textureKey).filter(Boolean) as string[])

  for (const textureKey of uniqueKeys) {
    if (processed.has(textureKey)) continue
    processed.add(textureKey)

    const [namespace, name] = textureKey.split(':')
    if (!namespace || !name) continue

    let srcPath: string | undefined

    srcPath = await getCustomTexturePath(options.resourcePackPath, textureKey)

    if (!srcPath && namespace === 'minecraft') {
      srcPath = await resolveVanillaTexture(name, options)
    }

    if (!srcPath) continue

    const destDir = path.join(options.outputDir, namespace)
    const destFile = path.join(destDir, `${name}.png`)

    await mkdir(destDir, { recursive: true })
    await copyFile(srcPath, destFile)

    const url = `textures/${namespace}/${name}.png`
    const anim = await readAnimationMeta(srcPath)

    textureMap.set(textureKey, anim
      ? { url, animated: true, frameWidth: anim.frameWidth, frameCount: anim.frameCount, frameTime: anim.frameTime }
      : { url },
    )
  }

  return textureMap
}
