import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { Character, GearItem, GearSlot } from '@/types';
import { STARTER_PARTY } from '@/data/content';
import { computeCharacterStats } from '@/utils/game';

export const usePartyStore = defineStore('party', () => {
  const members = ref<Character[]>(JSON.parse(JSON.stringify(STARTER_PARTY)));
  const selectedId = ref<string | null>(members.value[0]?.id ?? null);

  const selected = computed(() =>
    members.value.find(m => m.id === selectedId.value) ?? null
  );

  /** Reactive total-stats per member. */
  const stats = computed(() => {
    const out: Record<string, ReturnType<typeof computeCharacterStats>> = {};
    for (const m of members.value) out[m.id] = computeCharacterStats(m);
    return out;
  });

  function select(id: string) { selectedId.value = id; }

  function equip(charId: string, item: GearItem): GearItem | null {
    const c = members.value.find(m => m.id === charId);
    if (!c) return null;
    const prev = c.equipment[item.slot] ?? null;
    c.equipment = { ...c.equipment, [item.slot]: item };
    return prev;
  }

  function unequip(charId: string, slot: GearSlot): GearItem | null {
    const c = members.value.find(m => m.id === charId);
    if (!c) return null;
    const prev = c.equipment[slot] ?? null;
    const next = { ...c.equipment };
    delete next[slot];
    c.equipment = next;
    return prev;
  }

  function awardXp(perMember: number) {
    for (const c of members.value) {
      c.xp += perMember;
      while (c.xp >= c.xpToNext) {
        c.xp -= c.xpToNext;
        c.level += 1;
        c.xpToNext = Math.floor(c.xpToNext * 1.4);
      }
    }
  }

  return { members, selectedId, selected, stats, select, equip, unequip, awardXp };
});

