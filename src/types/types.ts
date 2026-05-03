// Core domain types for the Paragon game

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type GearSlot = 'weapon' | 'head' | 'chest' | 'hands' | 'legs' | 'trinket';

export type ItemType = 'gear' | 'consumable' | 'material';

export interface BaseItem {
  id: string;
  name: string;
  glyph: string; // unicode/ascii icon
  rarity: Rarity;
  type: ItemType;
  description?: string;
  stack?: number;
}

export interface GearItem extends BaseItem {
  type: 'gear';
  slot: GearSlot;
  stats: Partial<CharacterStats>;
  itemLevel: number;
}

export interface ConsumableItem extends BaseItem {
  type: 'consumable';
  effect: string;
}

export interface MaterialItem extends BaseItem {
  type: 'material';
}

export type Item = GearItem | ConsumableItem | MaterialItem;

export interface CharacterStats {
  hp: number;
  atk: number;
  def: number;
  spd: number;
  crit: number; // 0..1
}

export type ClassId = 'fighter' | 'rogue' | 'mage' | 'cleric' | 'ranger' | 'paladin';

export interface Character {
  id: string;
  name: string;
  classId: ClassId;
  glyph: string;
  level: number;
  xp: number;
  xpToNext: number;
  baseStats: CharacterStats;
  equipment: Partial<Record<GearSlot, GearItem>>;
}

export interface Resources {
  gold: number;
  silver: number;
  copper: number;
}

// Dungeon system
export interface EnemyTemplate {
  id: string;
  name: string;
  glyph: string;
  stats: CharacterStats;
  xpReward: number;
  lootTable: LootEntry[];
}

export interface LootEntry {
  itemId: string;
  weight: number;
  min?: number;
  max?: number;
}

// ── Encounter system ──────────────────────────────────────────────────────────

export type EncounterCategory = 'combat' | 'social' | 'exploration' | 'special';

/**
 * Relative weighting for each encounter category in a dungeon.
 * Values are relative — they don't need to sum to 100.
 * Used by procedural encounter generation and displayed as dungeon flavor.
 */
export interface EncounterWeights {
  combat:      number;
  social:      number;
  exploration: number;
  special:     number;
}

interface BaseEncounter {
  id: string;
  category: EncounterCategory;
  /** Narrative line shown at the start of the encounter. */
  intro?: string;
  /** Narrative line shown when the encounter resolves. */
  outro?: string;
}

export interface CombatEncounter extends BaseEncounter {
  category: 'combat';
  enemies: EnemyTemplate[];
}

export interface SocialEncounter extends BaseEncounter {
  category: 'social';
  npcName: string;
  prompt: string;
  choices?: SocialChoice[];
}

export interface SocialChoice {
  id: string;
  label: string;
  /** Narrative outcome text. */
  outcome: string;
  rewards?: QuestReward[];
}

export interface ExplorationEncounter extends BaseEncounter {
  category: 'exploration';
  description: string;
  outcomes?: ExplorationOutcome[];
}

export interface ExplorationOutcome {
  id: string;
  label: string;
  /** 0–1 probability weight relative to other outcomes in the array. */
  probability: number;
  description: string;
  rewards?: QuestReward[];
}

export interface SpecialEncounter extends BaseEncounter {
  category: 'special';
  description: string;
  /** References a handler key registered in the dungeon store for scripted behaviour. */
  scriptId?: string;
}

export type Encounter =
  | CombatEncounter
  | SocialEncounter
  | ExplorationEncounter
  | SpecialEncounter;

/**
 * A single stage within a dungeon. Stages are completed in order;
 * each is locked until the previous one is finished.
 */
export interface DungeonStage {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  recommendedLevel: number;
  /**
   * Relative weighting of encounter categories for this stage.
   * Values are relative — they don't need to sum to 100.
   */
  encounterWeights: EncounterWeights;
  encounters: Encounter[];
  /** Shown in the UI the first time this stage becomes available. */
  unlockText?: string;
}

/**
 * Top-level dungeon definition. A dungeon is a named location containing
 * one or more ordered stages. The dungeon itself is unlocked via the quest
 * system; stages are gated by completing the preceding stage.
 */
export interface Dungeon {
  id: string;
  name: string;
  /** ASCII art representing the dungeon location. */
  art: string;
  /** Top-level flavour description shown in the dungeon browser. */
  description: string;
  stages: DungeonStage[];
}

// Runtime combat state
export interface CombatUnit {
  uid: string;
  name: string;
  glyph: string;
  side: 'party' | 'enemy';
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  spd: number;
  crit: number;
  cooldown: number; // ms until next action
  alive: boolean;
  sourceId: string; // character id or enemy template id
}

export interface CombatLogEntry {
  t: number;
  text: string;
  kind: 'info' | 'damage' | 'crit' | 'death' | 'loot' | 'system';
}

export type DungeonRunStatus = 'idle' | 'running' | 'victory' | 'defeat';

export interface DungeonRun {
  dungeonId: string;
  stageId: string;
  status: DungeonRunStatus;
  encounterIndex: number;
  units: CombatUnit[];
  log: CombatLogEntry[];
  rewards: { xp: number; loot: Item[] };
}

// ─────────────────────────────────────────────────────────────────────────────
// Quest system
// ─────────────────────────────────────────────────────────────────────────────

export type QuestDifficulty = 'trivial' | 'easy' | 'normal' | 'hard' | 'legendary';

// ── Rewards ───────────────────────────────────────────────────────────────────

export interface CurrencyReward {
  kind: 'currency';
  gold?: number;
  silver?: number;
  copper?: number;
  /** Show "???" in the UI until the quest is turned in. */
  hidden?: boolean;
}

export interface ItemReward {
  kind: 'item';
  itemId: string;
  qty?: number;
  /** Show "???" in the UI until the quest is turned in. */
  hidden?: boolean;
}

export interface XpReward {
  kind: 'xp';
  amount: number;
  hidden?: boolean;
}

/** Free-text reward — e.g. "A new ally joins" or a lore reveal. */
export interface TextReward {
  kind: 'text';
  label: string;
  hidden?: boolean;
}

/** Unlocks a quest, dungeon, or named game feature. */
export interface UnlockReward {
  kind: 'unlock';
  unlockId: string;
  unlockType: 'quest' | 'dungeon' | 'feature';
  hidden?: boolean;
}

export type QuestReward =
  | CurrencyReward
  | ItemReward
  | XpReward
  | TextReward
  | UnlockReward;

// ── Prerequisites ─────────────────────────────────────────────────────────────

/** Another quest must already be turned in. */
export interface QuestCompletedPrereq {
  kind: 'quest';
  questId: string;
}

/** One or more party members must have reached a level threshold. */
export interface LevelPrereq {
  kind: 'level';
  minLevel: number;
  /** 'any' = at least one member, 'all' = entire party, 'leader' = first slot */
  scope?: 'any' | 'all' | 'leader';
}

/** A specific item must be in the party inventory (optionally consumed on accept). */
export interface ItemPrereq {
  kind: 'item';
  itemId: string;
  qty?: number;
  /** If true the item(s) are consumed when the quest is accepted. */
  consume?: boolean;
}

/** A dungeon must have been cleared at least once. */
export interface DungeonClearedPrereq {
  kind: 'dungeon';
  dungeonId: string;
}

/** The party roster must contain at least one character of one of the listed classes. */
export interface ClassPrereq {
  kind: 'class';
  classIds: ClassId[];
}

export type QuestPrerequisite =
  | QuestCompletedPrereq
  | LevelPrereq
  | ItemPrereq
  | DungeonClearedPrereq
  | ClassPrereq;

// ── Objectives ────────────────────────────────────────────────────────────────

/** Kill a number of a specific enemy type (or any enemy when enemyId is '*'). */
export interface KillObjective {
  kind: 'kill';
  /** Enemy template id from ENEMY_DB, or '*' for any enemy. */
  enemyId: string;
  count: number;
  /** When set, only kills inside this dungeon count toward the objective. */
  dungeonId?: string;
  label?: string;
}

/** Collect (and optionally consume) items. */
export interface CollectObjective {
  kind: 'collect';
  itemId: string;
  count: number;
  /** If true, the required items are removed from inventory on turn-in. */
  consume?: boolean;
  label?: string;
}

/** Complete a dungeon run with victory status. */
export interface DungeonObjective {
  kind: 'dungeon';
  dungeonId: string;
  requiredVictories?: number;
  label?: string;
}

/** A party member (or all) must reach a level. */
export interface LevelObjective {
  kind: 'level';
  minLevel: number;
  scope?: 'any' | 'all' | 'leader';
  label?: string;
}

/** Progress tracked externally by game logic or scripted events. */
export interface ManualObjective {
  kind: 'manual';
  description: string;
  count?: number;
}

export type QuestObjective =
  | KillObjective
  | CollectObjective
  | DungeonObjective
  | LevelObjective
  | ManualObjective;

// ── Quest definition ──────────────────────────────────────────────────────────

export interface Quest {
  id: string;
  title: string;
  description: string;
  /** Extra flavor text — quest giver, location, lore snippet, etc. */
  flavor?: string;
  difficulty: QuestDifficulty;
  objectives: QuestObjective[];
  rewards: QuestReward[];
  prerequisites?: QuestPrerequisite[];
  /** Quest can be accepted again after completion. */
  repeatable?: boolean;
  /** Cap on how many times a repeatable quest can be done (omit = unlimited). */
  repeatLimit?: number;
  /** Sorting hint for the quest log display (lower = higher priority). */
  sortOrder?: number;
  /** Free-form tags for filtering / grouping in the UI. */
  tags?: string[];
}

