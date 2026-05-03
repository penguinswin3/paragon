<script setup lang="ts">
import { useInventoryStore } from '@/stores/inventory';
import ItemSlot from '@/components/ui/ItemSlot.vue';
import { computed, ref } from 'vue';
import type { Item, ItemType } from '@/types/types';

const inv = useInventoryStore();
const filter = ref<'all' | ItemType>('all');

const filtered = computed(() => {
  if (filter.value === 'all') return inv.entries;
  return inv.entries.filter(e => e.item.type === filter.value);
});

const tabs: { id: 'all' | ItemType; label: string }[] = [
  { id: 'all', label: 'all' },
  { id: 'gear', label: 'gear' },
  { id: 'consumable', label: 'consum' },
  { id: 'material', label: 'mat' }
];

const hovered = ref<Item | null>(null);
</script>

<template>
  <div class="vault">
    <div class="tabs">
      <button v-for="t in tabs" :key="t.id"
              :class="{ active: filter === t.id }"
              @click="filter = t.id">{{ t.label }}</button>
      <div class="count dim">{{ inv.totalCount }} items</div>
    </div>

    <div class="grid" @mouseleave="hovered = null">
      <ItemSlot v-for="e in filtered" :key="e.key"
                :item="e.item" :qty="e.qty" size="md"
                @click="hovered = e.item"
                @mouseenter="hovered = e.item" />
    </div>

    <div class="tip" v-if="hovered">
      <span :class="`r-${hovered.rarity}`">{{ hovered.glyph }} {{ hovered.name }}</span>
      <span class="dim"> · {{ hovered.rarity }} · {{ hovered.type }}</span>
      <div v-if="hovered.type === 'gear'" class="dim" style="font-size: 11px;">
        slot: {{ (hovered as any).slot }} · iLvl {{ (hovered as any).itemLevel }} ·
        <span v-for="(v, k) in (hovered as any).stats" :key="k" class="warn">+{{ v }} {{ k }} </span>
      </div>
      <div v-else-if="hovered.description" class="dim" style="font-size: 11px;">
        {{ hovered.description }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.vault { display: flex; flex-direction: column; height: 100%; min-height: 0; }
.tabs {
  display: flex; gap: 4px; align-items: center;
  border-bottom: 1px solid var(--border);
  padding-bottom: 5px; margin-bottom: 7px;
}
.tabs button { font-size: 9px; padding: 2px 8px; }
.tabs button.active {
  color: var(--gold);
  border-color: var(--gold);
  background: rgba(200,160,40,0.08);
}
.count {
  margin-left: auto;
  font-family: 'Cinzel', Georgia, serif;
  font-size: 10px; color: var(--fg-dim);
  letter-spacing: 0.1em;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 3px;
  flex: 1;
  overflow-y: auto;
  align-content: start;
}
.tip {
  border-top: 1px solid var(--border);
  padding-top: 5px;
  font-size: 12px;
  min-height: 30px;
  font-style: italic;
}
.tip > span { font-style: normal; }
</style>

