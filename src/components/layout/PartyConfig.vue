<script setup lang="ts">
import { usePartyStore } from '@/stores/party';
import StatBar from '@/components/ui/StatBar.vue';
import { computed } from 'vue';

const party = usePartyStore();

const slots = computed(() => party.members.filter(m => m.classId === 'warrior'));
</script>

<template>
  <div class="party">
    <div class="grid">
      <div v-for="c in slots" :key="c.id" class="card"
           :class="{ active: party.selectedId === c.id }"
           @click="party.select(c.id)">
          <div class="head">
            <span class="g neon">{{ c.glyph }}</span>
            <span class="n">{{ c.name }}</span>
            <span class="lvl">L{{ c.level }}</span>
          </div>
          <div class="cls dim">{{ c.classId }}</div>
          <StatBar :value="party.stats[c.id].hp" :max="party.stats[c.id].hp"
                   color="var(--neon-good)" :height="6" />
          <StatBar :value="c.xp" :max="c.xpToNext"
                   color="var(--neon-2)" :height="3" />
          <div class="mini">
            <span class="warn">⚔ {{ party.stats[c.id].atk }}</span>
            <span>⛨ {{ party.stats[c.id].def }}</span>
            <span class="mag">⚡ {{ party.stats[c.id].spd }}</span>
          </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.party { height: 100%; }
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 8px;
  height: 100%;
}
.card {
  border: 1px solid var(--border-hi);
  background: var(--bg-2);
  padding: 8px 10px;
  display: flex; flex-direction: column; gap: 5px;
  cursor: pointer;
  transition: border-color .12s;
}
.card.active { border-color: var(--gold); background: var(--panel); }
.card.empty { border-style: dashed; border-color: var(--border); display: grid; place-items: center; cursor: default; }
.card:hover:not(.empty):not(.active) { border-color: var(--border-glow); }
.head { display: flex; align-items: center; gap: 7px; }
.g { font-size: 20px; color: var(--gold); font-family: serif; }
.n { font-size: 13px; font-family: 'IM Fell English', Georgia, serif; font-style: italic; }
.lvl { margin-left: auto; font-family: 'Cinzel', Georgia, serif; color: var(--gold); font-size: 10px; letter-spacing: 0.1em; }
.cls { font-family: 'Cinzel', Georgia, serif; font-size: 9px; text-transform: uppercase; letter-spacing: 0.18em; color: var(--fg-dim); }
.mini { display: flex; gap: 8px; font-size: 11px; margin-top: 2px; font-family: 'Cinzel', Georgia, serif; }
.plus { font-size: 20px; color: var(--border-hi); }
</style>
