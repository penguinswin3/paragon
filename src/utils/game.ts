import type { Character, CharacterStats, GearItem } from '@/types/types';
import {
  LEVEL_HP_PER_LEVEL, LEVEL_ATK_PER_LEVEL, LEVEL_DEF_PER_LEVEL
} from '@/data/game-config';

export function rollDice(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function uid(prefix = 'u'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

/** Compute total stats including equipped gear. */
export function computeCharacterStats(c: Character): CharacterStats {
  const total: CharacterStats = { ...c.baseStats };
  for (const item of Object.values(c.equipment) as GearItem[]) {
    if (!item) continue;
    for (const k of Object.keys(item.stats) as (keyof CharacterStats)[]) {
      total[k] = (total[k] ?? 0) + (item.stats[k] ?? 0);
    }
  }
  // small per-level scaling
  const lvlBonus = c.level - 1;
  total.hp  += lvlBonus * LEVEL_HP_PER_LEVEL;
  total.atk += lvlBonus * LEVEL_ATK_PER_LEVEL;
  total.def += Math.floor(lvlBonus * LEVEL_DEF_PER_LEVEL);
  return total;
}

/** Weighted random pick by `weight` field. */
export function weightedPick<T extends { weight: number }>(entries: T[]): T | undefined {
  if (entries.length === 0) return undefined;
  const total = entries.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * total;
  for (const e of entries) {
    r -= e.weight;
    if (r <= 0) return e;
  }
  return entries[entries.length - 1];
}

