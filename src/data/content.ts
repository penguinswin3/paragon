import type { Character, CharacterStats, Dungeon, EnemyTemplate, GearItem, Item } from '@/types';

export const RARITY_COLOR: Record<string, string> = {
  common: '#b8b8b8',
  uncommon: '#3cff8e',
  rare: '#3ca7ff',
  epic: '#c060ff',
  legendary: '#ffb000'
};

export const ITEM_DB: Record<string, Item> = {
  rusty_blade: {
    id: 'rusty_blade', name: 'Rusty Blade', glyph: '/', rarity: 'common',
    type: 'gear', slot: 'weapon', itemLevel: 1, stats: { atk: 3 }
  } as GearItem,
  oak_staff: {
    id: 'oak_staff', name: 'Oak Staff', glyph: '|', rarity: 'common',
    type: 'gear', slot: 'weapon', itemLevel: 1, stats: { atk: 2, crit: 0.05 }
  } as GearItem,
  leather_cap: {
    id: 'leather_cap', name: 'Leather Cap', glyph: '^', rarity: 'common',
    type: 'gear', slot: 'head', itemLevel: 1, stats: { def: 1, hp: 4 }
  } as GearItem,
  iron_plate: {
    id: 'iron_plate', name: 'Iron Plate', glyph: '#', rarity: 'uncommon',
    type: 'gear', slot: 'chest', itemLevel: 2, stats: { def: 4, hp: 10 }
  } as GearItem,
  shadow_dagger: {
    id: 'shadow_dagger', name: 'Shadow Dagger', glyph: '†', rarity: 'rare',
    type: 'gear', slot: 'weapon', itemLevel: 3, stats: { atk: 5, spd: 3, crit: 0.1 }
  } as GearItem,
  ember_amulet: {
    id: 'ember_amulet', name: 'Ember Amulet', glyph: '◊', rarity: 'epic',
    type: 'gear', slot: 'trinket', itemLevel: 4, stats: { atk: 4, crit: 0.08, hp: 8 }
  } as GearItem,
  health_potion: {
    id: 'health_potion', name: 'Health Potion', glyph: '!', rarity: 'common',
    type: 'consumable', effect: 'Restore 30 HP'
  },
  bone_dust: {
    id: 'bone_dust', name: 'Bone Dust', glyph: '·', rarity: 'common',
    type: 'material'
  },
  mana_shard: {
    id: 'mana_shard', name: 'Mana Shard', glyph: '*', rarity: 'uncommon',
    type: 'material'
  }
};

const baseStats = (s: Partial<CharacterStats>): CharacterStats => ({
  hp: 50, atk: 5, def: 2, spd: 5, crit: 0.05, ...s
});

export const STARTER_PARTY: Character[] = [
  {
    id: 'c-warrior', name: 'Garrick', classId: 'warrior', glyph: 'ᛟ',
    level: 1, xp: 0, xpToNext: 100,
    baseStats: baseStats({ hp: 70, atk: 7, def: 5, spd: 4 }),
    equipment: { weapon: ITEM_DB.rusty_blade as GearItem }
  },
  {
    id: 'c-rogue', name: 'Vex', classId: 'rogue', glyph: 'ϟ',
    level: 1, xp: 0, xpToNext: 100,
    baseStats: baseStats({ hp: 45, atk: 8, def: 2, spd: 9, crit: 0.15 }),
    equipment: {}
  },
  {
    id: 'c-mage', name: 'Lyra', classId: 'mage', glyph: 'ψ',
    level: 1, xp: 0, xpToNext: 100,
    baseStats: baseStats({ hp: 40, atk: 9, def: 1, spd: 6 }),
    equipment: { weapon: ITEM_DB.oak_staff as GearItem }
  },
  {
    id: 'c-cleric', name: 'Hale', classId: 'cleric', glyph: '✚',
    level: 1, xp: 0, xpToNext: 100,
    baseStats: baseStats({ hp: 55, atk: 5, def: 4, spd: 5 }),
    equipment: {}
  }
];

export const ENEMY_DB: Record<string, EnemyTemplate> = {
  goblin: {
    id: 'goblin', name: 'Goblin', glyph: 'g',
    stats: baseStats({ hp: 25, atk: 4, def: 1, spd: 6 }),
    xpReward: 15,
    lootTable: [
      { itemId: 'bone_dust', weight: 5, min: 1, max: 2 },
      { itemId: 'rusty_blade', weight: 1 }
    ]
  },
  skeleton: {
    id: 'skeleton', name: 'Skeleton', glyph: 's',
    stats: baseStats({ hp: 35, atk: 5, def: 2, spd: 4 }),
    xpReward: 20,
    lootTable: [
      { itemId: 'bone_dust', weight: 8, min: 1, max: 3 },
      { itemId: 'leather_cap', weight: 2 }
    ]
  },
  wraith: {
    id: 'wraith', name: 'Wraith', glyph: 'W',
    stats: baseStats({ hp: 60, atk: 8, def: 3, spd: 7, crit: 0.1 }),
    xpReward: 50,
    lootTable: [
      { itemId: 'mana_shard', weight: 5, min: 1, max: 2 },
      { itemId: 'shadow_dagger', weight: 1 },
      { itemId: 'ember_amulet', weight: 1 }
    ]
  },
  ogre: {
    id: 'ogre', name: 'Ogre', glyph: 'O',
    stats: baseStats({ hp: 120, atk: 12, def: 5, spd: 3 }),
    xpReward: 80,
    lootTable: [
      { itemId: 'iron_plate', weight: 3 },
      { itemId: 'health_potion', weight: 5, min: 1, max: 2 }
    ]
  }
};

const CRYPT_ART = String.raw`
   _________
  /   ___   \
 |   |___|   |
 |   _____   |
 |__|     |__|
   |_|_|_|_|
`;

const FOREST_ART = String.raw`
     /\  /\  /\
    /  \/  \/  \
   /__/\__/\__/\
      ||  ||
      ||  ||
`;

const KEEP_ART = String.raw`
   |‾|_|‾|_|‾|
   |  o   o  |
   |   ___   |
   |__|   |__|
`;

export const DUNGEON_DB: Record<string, Dungeon> = {
  whispering_crypt: {
    id: 'whispering_crypt',
    name: 'Whispering Crypt',
    art: CRYPT_ART,
    difficulty: 1,
    recommendedLevel: 1,
    description: 'A modest catacomb. Restless dead shamble in the dark.',
    encounters: [
      { id: 'e1', enemies: [ENEMY_DB.skeleton], intro: 'Bones rattle ahead.' },
      { id: 'e2', enemies: [ENEMY_DB.skeleton, ENEMY_DB.skeleton] },
      { id: 'e3', enemies: [ENEMY_DB.wraith], intro: 'A chill seeps in...' }
    ]
  },
  goblin_warren: {
    id: 'goblin_warren',
    name: 'Goblin Warren',
    art: FOREST_ART,
    difficulty: 1,
    recommendedLevel: 1,
    description: 'Tunnels teeming with shrieking goblins.',
    encounters: [
      { id: 'e1', enemies: [ENEMY_DB.goblin, ENEMY_DB.goblin] },
      { id: 'e2', enemies: [ENEMY_DB.goblin, ENEMY_DB.goblin, ENEMY_DB.goblin] }
    ]
  },
  iron_keep: {
    id: 'iron_keep',
    name: 'Iron Keep',
    art: KEEP_ART,
    difficulty: 3,
    recommendedLevel: 4,
    description: 'A ruined fortress guarded by hulking brutes.',
    encounters: [
      { id: 'e1', enemies: [ENEMY_DB.skeleton, ENEMY_DB.skeleton] },
      { id: 'e2', enemies: [ENEMY_DB.wraith, ENEMY_DB.skeleton] },
      { id: 'e3', enemies: [ENEMY_DB.ogre], intro: 'The ground trembles.' }
    ]
  }
};

