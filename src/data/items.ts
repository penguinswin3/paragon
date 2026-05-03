import type { GearItem, Item } from '@/types/types';

export const RARITY_COLOR: Record<string, string> = {
  common:    '#b8b8b8',
  uncommon:  '#3cff8e',
  rare:      '#3ca7ff',
  epic:      '#c060ff',
  legendary: '#ffb000',
};

export const ITEM_DB: Record<string, Item> = {
  rusty_blade: {
    id: 'rusty_blade', name: 'Rusty Blade', glyph: '/', rarity: 'common',
    type: 'gear', slot: 'mainhand', itemLevel: 1, stats: { atk: 3 }
  } as GearItem,
  oak_staff: {
    id: 'oak_staff', name: 'Oak Staff', glyph: '|', rarity: 'common',
    type: 'gear', slot: 'mainhand', itemLevel: 1, stats: { atk: 2, crit: 0.05 }
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
    type: 'gear', slot: 'mainhand', itemLevel: 3, stats: { atk: 5, spd: 3, crit: 0.1 }
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
  },
};
