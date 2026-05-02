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

export type ClassId = 'warrior' | 'rogue' | 'mage' | 'cleric';

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

export interface Encounter {
  id: string;
  enemies: EnemyTemplate[];
  // Optional flavor text shown when encounter begins
  intro?: string;
}

export interface Dungeon {
  id: string;
  name: string;
  art: string; // ASCII art block
  difficulty: number;
  description: string;
  encounters: Encounter[];
  recommendedLevel: number;
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
  status: DungeonRunStatus;
  encounterIndex: number;
  units: CombatUnit[];
  log: CombatLogEntry[];
  rewards: { xp: number; loot: Item[] };
}

