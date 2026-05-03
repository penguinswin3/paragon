<script setup lang="ts">
import { usePartyStore } from '@/stores/party';
import { useInventoryStore } from '@/stores/inventory';
import ItemSlot from '@/components/ui/ItemSlot.vue';
import StatBar from '@/components/ui/StatBar.vue';
import type { GearItem, GearSlot } from '@/types/types';
import { computed } from 'vue';

const party = usePartyStore();
const inv = useInventoryStore();

const slots: GearSlot[] = ['weapon', 'head', 'chest', 'hands', 'legs', 'trinket'];

const sel = computed(() => party.selected);
const stats = computed(() => sel.value ? party.stats[sel.value.id] : null);

const compatibleGear = computed(() =>
  inv.entries.filter(e => e.item.type === 'gear') as { key: string; item: GearItem; qty: number }[]
);

function equipFromInv(entryKey: string) {
  if (!sel.value) return;
  const entry = compatibleGear.value.find(e => e.key === entryKey);
  if (!entry) return;
  const prev = party.equip(sel.value.id, entry.item);
  inv.remove(entry.key, 1);
  if (prev) inv.add(prev, 1);
}

function unequipSlot(slot: GearSlot) {
  if (!sel.value) return;
  const removed = party.unequip(sel.value.id, slot);
  if (removed) inv.add(removed, 1);
}
</script>

<template>
  <div v-if="sel" class="gear">
    <div class="header">
      <h2 class="neon">⚒ {{ sel.name }}</h2>
      <span class="dim">{{ sel.classId }} · Lv {{ sel.level }}</span>
    </div>

    <div class="grid">
      <div class="col">
        <h3>Equipment</h3>
        <div class="slotGrid">
          <div v-for="s in slots" :key="s" class="slotRow">
            <span class="slotName dim">{{ s }}</span>
            <ItemSlot :item="sel.equipment[s] ?? null" size="md"
                      @click="sel.equipment[s] && unequipSlot(s)" />
          </div>
        </div>
      </div>

      <div class="col">
        <h3>Stats</h3>
        <div v-if="stats" class="stats">
          <div class="statRow"><span class="dim">HP </span><StatBar :value="stats.hp" :max="stats.hp" color="var(--neon-good)" :label="String(stats.hp)" /></div>
          <div class="statRow"><span class="dim">ATK</span><span class="warn">{{ stats.atk }}</span></div>
          <div class="statRow"><span class="dim">DEF</span><span>{{ stats.def }}</span></div>
          <div class="statRow"><span class="dim">SPD</span><span>{{ stats.spd }}</span></div>
          <div class="statRow"><span class="dim">CRT</span><span class="mag">{{ Math.round(stats.crit * 100) }}%</span></div>
        </div>
        <h3 style="margin-top: 12px;">XP</h3>
        <StatBar :value="sel.xp" :max="sel.xpToNext" color="var(--neon-2)"
                 :label="`${sel.xp} / ${sel.xpToNext}`" :height="12" />
      </div>
    </div>

    <h3 style="margin-top: 14px;">Available Gear</h3>
    <div v-if="compatibleGear.length === 0" class="dim">— vault has no gear —</div>
    <div class="invGrid">
      <ItemSlot v-for="e in compatibleGear" :key="e.key"
                :item="e.item" size="md"
                @click="equipFromInv(e.key)" />
    </div>
  </div>
  <div v-else class="dim">Select a hero from the top bar.</div>
</template>

<style scoped>
.gear { font-size: 13px; }
.header { display: flex; align-items: baseline; gap: 12px; margin-bottom: 14px; }
.header h2 {
  margin: 0;
  font-family: 'Cinzel', Georgia, serif;
  letter-spacing: 0.2em;
  color: var(--gold);
  font-size: 15px;
}
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
h3 {
  margin: 0 0 8px;
  font-family: 'Cinzel', Georgia, serif;
  font-size: 10px;
  color: var(--gold);
  letter-spacing: 0.25em;
  text-transform: uppercase;
  border-bottom: 1px solid var(--border);
  padding-bottom: 4px;
}
.slotGrid { display: flex; flex-direction: column; gap: 4px; }
.slotRow { display: flex; align-items: center; gap: 8px; }
.slotName {
  width: 58px;
  text-transform: uppercase;
  font-family: 'Cinzel', Georgia, serif;
  font-size: 9px;
  color: var(--fg-dim);
  letter-spacing: 0.1em;
}
.stats { display: flex; flex-direction: column; gap: 5px; }
.statRow { display: flex; gap: 8px; align-items: center; }
.statRow > .dim {
  width: 42px;
  font-family: 'Cinzel', Georgia, serif;
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.invGrid { display: flex; flex-wrap: wrap; gap: 4px; }
</style>
