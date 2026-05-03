<script setup lang="ts">
import { usePartyStore } from '@/stores/party';
import { useInventoryStore } from '@/stores/inventory';
import ItemSlot from '@/components/ui/ItemSlot.vue';
import StatBar from '@/components/ui/StatBar.vue';
import type { GearItem, GearSlot } from '@/types/types';
import { computed } from 'vue';

const party = usePartyStore();
const inv = useInventoryStore();

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
      <h2 class="neon">{{ sel.name }}</h2>
      <span class="dim">{{ sel.classId }} · Lv {{ sel.level }}</span>
    </div>

    <div class="grid">
      <div class="col">
        <h3>Equipment</h3>
        <div class="bodyDoll">
          <div class="dollSlot" style="grid-area: head">
            <ItemSlot :item="sel.equipment['head'] ?? null" size="md" @click="sel.equipment['head'] && unequipSlot('head')" />
            <span class="slotLabel">Head</span>
          </div>
          <div class="dollSlot" style="grid-area: charm">
            <ItemSlot :item="sel.equipment['charm'] ?? null" size="md" @click="sel.equipment['charm'] && unequipSlot('charm')" />
            <span class="slotLabel">Charm</span>
          </div>
          <div class="dollSlot" style="grid-area: neck">
            <ItemSlot :item="sel.equipment['neck'] ?? null" size="md" @click="sel.equipment['neck'] && unequipSlot('neck')" />
            <span class="slotLabel">Neck</span>
          </div>
          <div class="dollSlot" style="grid-area: back">
            <ItemSlot :item="sel.equipment['back'] ?? null" size="md" @click="sel.equipment['back'] && unequipSlot('back')" />
            <span class="slotLabel">Back</span>
          </div>
          <div class="dollSlot" style="grid-area: mainhand">
            <ItemSlot :item="sel.equipment['mainhand'] ?? null" size="md" @click="sel.equipment['mainhand'] && unequipSlot('mainhand')" />
            <span class="slotLabel">Main Hand</span>
          </div>
          <div class="dollSlot" style="grid-area: chest">
            <ItemSlot :item="sel.equipment['chest'] ?? null" size="md" @click="sel.equipment['chest'] && unequipSlot('chest')" />
            <span class="slotLabel">Chest</span>
          </div>
          <div class="dollSlot" style="grid-area: offhand">
            <ItemSlot :item="sel.equipment['offhand'] ?? null" size="md" @click="sel.equipment['offhand'] && unequipSlot('offhand')" />
            <span class="slotLabel">Off Hand</span>
          </div>
          <div class="dollSlot" style="grid-area: hands">
            <ItemSlot :item="sel.equipment['hands'] ?? null" size="md" @click="sel.equipment['hands'] && unequipSlot('hands')" />
            <span class="slotLabel">Hands</span>
          </div>
          <div class="dollSlot" style="grid-area: legs">
            <ItemSlot :item="sel.equipment['legs'] ?? null" size="md" @click="sel.equipment['legs'] && unequipSlot('legs')" />
            <span class="slotLabel">Legs</span>
          </div>
          <div class="dollSlot" style="grid-area: trinket">
            <ItemSlot :item="sel.equipment['trinket'] ?? null" size="md" @click="sel.equipment['trinket'] && unequipSlot('trinket')" />
            <span class="slotLabel">Trinket</span>
          </div>
          <div class="dollSlot" style="grid-area: ring1">
            <ItemSlot :item="sel.equipment['ring1'] ?? null" size="md" @click="sel.equipment['ring1'] && unequipSlot('ring1')" />
            <span class="slotLabel">Ring</span>
          </div>
          <div class="dollSlot" style="grid-area: feet">
            <ItemSlot :item="sel.equipment['feet'] ?? null" size="md" @click="sel.equipment['feet'] && unequipSlot('feet')" />
            <span class="slotLabel">Feet</span>
          </div>
          <div class="dollSlot" style="grid-area: ring2">
            <ItemSlot :item="sel.equipment['ring2'] ?? null" size="md" @click="sel.equipment['ring2'] && unequipSlot('ring2')" />
            <span class="slotLabel">Ring</span>
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

/* Body doll grid */
.bodyDoll {
  display: grid;
  grid-template-columns: repeat(3, 48px);
  grid-template-rows: repeat(5, auto);
  grid-template-areas:
    ".         head      ."
    "charm     neck      back"
    "mainhand  chest     offhand"
    "hands     legs      trinket"
    "ring1     feet      ring2";
  gap: 6px 4px;
  justify-content: start;
}

.dollSlot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.slotLabel {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 7px;
  color: var(--fg-dim);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-align: center;
  white-space: nowrap;
  line-height: 1;
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
