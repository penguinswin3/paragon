import type { CharacterStats, EnemyTemplate } from '@/types/types';
import { DEFAULT_BASE_STATS } from '@/data/game-config';

/** Merge partial stats with defaults. Used only for enemy definitions. */
const baseStats = (s: Partial<CharacterStats>): CharacterStats => ({ ...DEFAULT_BASE_STATS, ...s });

export const ENEMY_DB: Record<string, EnemyTemplate> = {
  goblin: {
    id: 'goblin', name: 'Goblin', glyph: 'g',
    stats: baseStats({ hp: 25, atk: 4, def: 1, spd: 6 }),
    xpReward: 15,
    lootTable: [
      { itemId: 'bone_dust',  weight: 5, min: 1, max: 2 },
      { itemId: 'rusty_blade', weight: 1 },
    ],
  },
  skeleton: {
    id: 'skeleton', name: 'Skeleton', glyph: 's',
    stats: baseStats({ hp: 35, atk: 5, def: 2, spd: 4 }),
    xpReward: 20,
    lootTable: [
      { itemId: 'bone_dust',   weight: 8, min: 1, max: 3 },
      { itemId: 'leather_cap', weight: 2 },
    ],
  },
  wraith: {
    id: 'wraith', name: 'Wraith', glyph: 'W',
    stats: baseStats({ hp: 60, atk: 8, def: 3, spd: 7, crit: 0.1 }),
    xpReward: 50,
    lootTable: [
      { itemId: 'mana_shard',    weight: 5, min: 1, max: 2 },
      { itemId: 'shadow_dagger', weight: 1 },
      { itemId: 'ember_amulet',  weight: 1 },
    ],
  },
  ogre: {
    id: 'ogre', name: 'Ogre', glyph: 'O',
    stats: baseStats({ hp: 120, atk: 12, def: 5, spd: 3 }),
    xpReward: 80,
    lootTable: [
      { itemId: 'iron_plate',    weight: 3 },
      { itemId: 'health_potion', weight: 5, min: 1, max: 2 },
    ],
  },
};
