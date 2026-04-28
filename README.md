# manosaba-wiki

Minecraft 服务器 **mano saba** 的物品百科全书，由 Preact 前端应用与 Datapack 数据提取器组成的 pnpm Monorepo 项目。

## 项目结构

```
manosaba-wiki/
├── packages/
│   ├── wiki/               # 前端百科网站 (@manosaba/wiki)
│   ├── datapack-extractor/ # 数据包提取工具 (@manosaba/datapack-extractor)
│   └── types/              # 共享类型定义 (@manosaba/types)
└── pnpm-workspace.yaml
```

### packages/wiki

基于 [Preact](https://preactjs.com/) 的前端单页应用，展示服务器内的物品百科信息。

- **框架**：Preact + TypeScript
- **构建工具**：Vite
- **路由**：wouter-preact
- **状态管理**：Zustand
- **样式**：UnoCSS (preset-wind4)

### packages/datapack-extractor

Node.js 命令行工具，从 Minecraft 服务器的数据包与世界存档中提取物品数据，生成供前端使用的 `dist/items.json`。

主要流程：

1. 扫描数据包中的物品定义（`scanner/item`）及进度触发器（`scanner/advancement`）
2. 从世界存档中读取补给地点信息（`location/supplies`）
3. 链接物品证据，分析变体，生成结构化物品数据
4. 将结果写入 `dist/items.json`

### packages/types

被 `wiki` 与 `datapack-extractor` 共享的 TypeScript 类型声明，包含物品、物品变体、来源、奖励等核心数据结构。

## 开始使用

### 环境要求

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) 10+

### 安装依赖

```bash
pnpm install
```

### 提取物品数据

> 执行前请确保 Minecraft 服务器的世界存档目录位于项目根目录的上两级，即 `../../world`。

```bash
cd packages/datapack-extractor
pnpm vite-node src/items.ts
```

生成的数据将写入 `packages/datapack-extractor/dist/items.json`。

### 运行前端开发服务器

```bash
cd packages/wiki
pnpm dev
```

### 构建前端

```bash
cd packages/wiki
pnpm build
```

构建产物输出至 `packages/wiki/dist/`。

## 物品类型

数据包提取器支持以下物品类型：

| 类型 | 说明 |
|---|---|
| `weapon` | 武器 |
| `consumable` | 消耗品 |
| `tool` | 工具 |
| `quest` | 任务物品 |
| `clue` | 线索物品 |
| `magic` | 魔法物品 |
| `utility` | 实用物品 |
| `magical_utility` | 魔法实用物品 |
| `unknown` | 未知 |

## 技术栈总览

| 包 | 技术 |
|---|---|
| wiki | Preact, Vite, Zustand, UnoCSS, TypeScript |
| datapack-extractor | Node.js, Vite, deepslate, prismarine-nbt, TypeScript |
| types | TypeScript |
