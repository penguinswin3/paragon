import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { Item } from '@/types/types';
import { ITEM_DB } from '@/data/items';

interface InvEntry { item: Item; qty: number; key: string; }

export const useInventoryStore = defineStore('inventory', () => {
  // entries are keyed; stackables share item.id, gear gets unique key
  const entries = ref<InvEntry[]>([
    { key: 'k-leather', item: ITEM_DB.leather_cap, qty: 1 },
    { key: 'k-pot', item: ITEM_DB.health_potion, qty: 3 },
    { key: 'k-dust', item: ITEM_DB.bone_dust, qty: 12 }
  ]);

  const totalCount = computed(() => entries.value.length);

  function add(item: Item, qty = 1) {
    if (item.type === 'gear') {
      // gear is unique
      entries.value.push({ key: `k-${Math.random().toString(36).slice(2, 8)}`, item, qty: 1 });
    } else {
      const existing = entries.value.find(e => e.item.id === item.id);
      if (existing) existing.qty += qty;
      else entries.value.push({ key: `k-${item.id}`, item, qty });
    }
  }

  function remove(key: string, qty = 1) {
    const e = entries.value.find(x => x.key === key);
    if (!e) return;
    e.qty -= qty;
    if (e.qty <= 0) entries.value = entries.value.filter(x => x.key !== key);
  }

  return { entries, totalCount, add, remove };
});

