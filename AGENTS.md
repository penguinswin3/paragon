# AGENTS.md — Paragon Vue — Developer & AI-Agent Reference

Helpful reminders, architectural decisions, and game-design notes for anyone
(human or AI) working in this codebase.

---

## Project At a Glance

| Concern | Location |
|---|---|
| Vue entry | `src/main.ts` → `src/App.vue` |
| Layout components | `src/components/layout/` |
| Reusable UI primitives | `src/components/ui/` |
| Page views (quest/gear/talents) | `src/components/views/` |
| Pinia stores | `src/stores/` |
| Items & rarity colours | `src/data/items.ts` |
| Starter party / characters | `src/data/characters.ts` |
| Enemy templates & loot tables | `src/data/enemies.ts` |
| Dungeon definitions & encounters | `src/data/dungeons.ts` |
| Legacy barrel (re-exports all above) | `src/data/content.ts` |
| **All balance numbers** | **`src/data/game-config.ts`** |
| Domain types | `src/types/types.ts` |
| Pure utility functions | `src/utils/game.ts` |

---

## The Golden Rule: game-config.ts

**All magic numbers live in `src/data/game-config.ts`.** Never scatter raw numeric
literals across stores, utils, or content files. When adding a new mechanic, define
its tunable values in `game-config.ts` first, then import them.

Sections in that file:
- Save / Persistence (`SAVE_KEY`, `SAVE_VERSION`)
- Starting Resources (`STARTING_GOLD`, etc.)
- Character Base-Stat Defaults (`DEFAULT_BASE_STATS`)
- Level-Up Scaling (`LEVEL_HP_PER_LEVEL`, `XP_CURVE_MULTIPLIER`, …)
- Combat Timing (`COMBAT_TICK_MS`, cooldown constants, …)
- Damage Formula (`DEF_REDUCTION_FACTOR`, `CRIT_DAMAGE_MULTIPLIER`, …)
- Loot (`LOOT_DROP_CHANCE`)
- Combat Log (`COMBAT_LOG_MAX`)
- Playback Speed limits (`SPEED_MIN`, `SPEED_MAX`)

---

## Save System

- **Auto-save key:** `SAVE_KEY` in `localStorage` (written by `OptionsMenu.vue`).
- **Schema version:** `SAVE_VERSION` — bump this whenever the serialized shape changes;
  the load routine rejects saves whose version doesn't match.
- **Export / Import:** base-64 encoded JSON of a snapshot object; snapshots cover
  `game`, `party`, `inventory`, and `dungeon` store slices.
- The dungeon *combat run* is intentionally **not** persisted — only `selectedId`
  and `speed` are saved. A run in progress is lost on reload by design.
- Other systems that require unlockable or persistent values should be included in the save file including currency, quests, items, etc. These values should then be loaded and the game state should be updated respectively. 
---

## Combat System

The dungeon simulation is a **tick-based** engine running at `COMBAT_TICK_MS` (250 ms)
intervals via `window.setInterval`.


### Key Design Decisions

Never `ever` do any sort of online play or daily time gated content. the game should respect the players time wherever possible. 

---

## Character & Stats



---

## Items

Three item types (see `ItemType` in `types/index.ts`):

| Type | Stack behavior | Notes |
|---|---|---|
| `gear` | Never stacks; each drop gets a unique key | Equippable; has `slot` + `stats` |
| `consumable` | Stacks by `item.id` | Has `effect` string (not yet mechanically implemented) |
| `material` | Stacks by `item.id` | Crafting ingredient (crafting system TBD) |

### Gear Slots

`weapon | head | chest | hands | legs | trinket`

---

## Content Authoring

Static content is split into focused files under `src/data/`. Import from the
specific file, not from the `content.ts` barrel.

| File | What lives here |
|---|---|
| `items.ts` | `ITEM_DB` — all gear, consumables, and materials; `RARITY_COLOR` map |
| `enemies.ts` | `ENEMY_DB` — enemy templates with `stats`, `xpReward`, and inline `lootTable` |
| `dungeons.ts` | `DUNGEON_DB` — dungeon containers with ASCII art and ordered `stages[]`; each stage has its own `encounterWeights` and `encounters` |
| `characters.ts` | `STARTER_PARTY` — starting character roster with base stats and default equipment |
| `quests.ts` | `QUEST_DB` — all quest definitions (objectives, rewards, prerequisites) |

Do not update the Changelog or TODO list. This should only be updated manually. 

### Adding content

- **New item** → add to `ITEM_DB` in `items.ts`.
- **New enemy** → add to `ENEMY_DB` in `enemies.ts`. Needs `stats`, `xpReward`, and
  `lootTable`. Use the local `baseStats()` helper for stat defaults.
- **New dungeon** → add ASCII art constant + entry to `DUNGEON_DB` in `dungeons.ts`.
  Each dungeon has a `stages` array; each stage has its own `encounterWeights` and `encounters`.
  Stage 0 is always unlocked; subsequent stages unlock when the previous stage is completed.
  Dungeons themselves are locked until `unlockDungeon(id)` is called (typically by a quest reward).
- **New character** → add to `STARTER_PARTY` in `characters.ts`. Use the local
  `baseStats()` helper; only specify fields that differ from `DEFAULT_BASE_STATS`.
- **New quest** → add to `QUEST_DB` in `quests.ts`. See Quest System below.


---

## Architectural Reminders

- **Stores are the source of truth** — components read from stores, never hold
  duplicate game state in local `ref`s.
- **Data files are static** — `items.ts`, `enemies.ts`, `dungeons.ts`, and
  `characters.ts` are plain data with no reactive state. Stores own the live copies.
- **`content.ts` is a legacy barrel** — it re-exports everything from the split
  files. Prefer importing directly from the specific file in new code.
- **`utils/game.ts` is pure** — no imports from stores or Vue. It only imports types
  and config constants.
- The `dungeon.ts` store is the only place that runs `setInterval`. Always call
  `stopTimer()` before reassigning the timer reference.
- `OptionsMenu.vue` is mounted at the root in `App.vue` and overlays the whole UI;
  it is driven by `game.optionsOpen`.
- Assume more content will be added in the future, make systems as extensible and dynamic as possible to allow for quicker and easier future development 

---

## Pending / Planned Systems

- Quest store (`src/stores/quests.ts`) — runtime quest state (active, progress, completed)
- Quest view wired to live `QUEST_DB` data
- Crafting system (material items have no mechanical use yet)
- Consumable use in combat (`health_potion` effect string exists but no handler)
- Talent tree (view stub exists at `src/components/views/TalentsView.vue`)
- Class-specific abilities / passives
- Proper aggro / targeting rules

---

## Quest System

All quest definitions live in `src/data/quests.ts` (`QUEST_DB`). Types are in
`src/types/types.ts` under the Quest System section.

### Reward types (`QuestReward`)

| `kind` | Fields | Notes |
|---|---|---|
| `currency` | `gold?`, `silver?`, `copper?` | Any combination of denominations |
| `item` | `itemId`, `qty?` | References `ITEM_DB` |
| `xp` | `amount` | Distributed to all party members |
| `text` | `label` | Narrative string — lore unlock, story beat, etc. |
| `unlock` | `unlockId`, `unlockType` | Unlocks a quest / dungeon / feature by id |

All reward types accept `hidden?: boolean` — the UI shows "???" until turn-in.

### Prerequisite types (`QuestPrerequisite`)

| `kind` | Key fields | Notes |
|---|---|---|
| `quest` | `questId` | Another quest must be turned in first |
| `level` | `minLevel`, `scope?` | scope: `'any'` \| `'all'` \| `'leader'` |
| `item` | `itemId`, `qty?`, `consume?` | Item in party inventory (optionally consumed on accept) |
| `dungeon` | `dungeonId` | Dungeon cleared at least once |
| `class` | `classIds[]` | Party must include one of the listed class IDs |

### Objective types (`QuestObjective`)

| `kind` | Key fields | Notes |
|---|---|---|
| `kill` | `enemyId`, `count`, `dungeonId?` | `enemyId: '*'` = any enemy |
| `collect` | `itemId`, `count`, `consume?` | Items removed on turn-in when `consume: true` |
| `dungeon` | `dungeonId`, `requiredVictories?` | `dungeonId: '*'` = any dungeon |
| `level` | `minLevel`, `scope?` | Party-level gate as an objective |
| `manual` | `description`, `count?` | Progress set externally by store / scripted logic |

### Quest fields

- `repeatable: true` + optional `repeatLimit` — for daily / weekly quests
- `tags: string[]` — used by the UI for filtering (`'main'`, `'side'`, `'daily'`, `'secret'`, …)
- `sortOrder: number` — lower numbers appear first in the quest log
- `flavor?: string` — quest-giver quote or location note, shown as subtext

## Visual Style
Never use emojis for anything ever. 
This will be a dark fantasy style with brownish gold colors as the base. Try to keep a clean and simple style. Use ascii or unicode characters for borders and such selectively for styling. 
Most styling will use a 4 color system, with a whiteish tone, a blackish tone, and two middle color tones, one dark the other lighter. Pretty much all ui components will use this style. 