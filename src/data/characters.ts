import type { Character, CharacterStats, GearItem } from '@/types/types';
import { DEFAULT_BASE_STATS, XP_BASE } from '@/data/game-config';
import { ITEM_DB } from '@/data/items';

/** Merge partial stats with defaults. Used only for character definitions. */
const baseStats = (s: Partial<CharacterStats>): CharacterStats => ({ ...DEFAULT_BASE_STATS, ...s });

export const STARTER_PARTY: Character[] = [
  {
    id: 'c-warrior', name: 'Jullian', classId: 'fighter', glyph: 'ᛟ',
    level: 1, xp: 0, xpToNext: XP_BASE,
    baseStats: baseStats({ hp: 70, atk: 7, def: 5, spd: 4 }),
    equipment: { mainhand: ITEM_DB.rusty_blade as GearItem },
  }
];
