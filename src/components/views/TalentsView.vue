<script setup lang="ts">
import { usePartyStore } from '@/stores/party';
import { computed } from 'vue';

const party = usePartyStore();
const sel = computed(() => party.selected);

const tree = [
  { id: 't1', name: 'Iron Skin',    glyph: '◆', desc: '+10 HP', tier: 1 },
  { id: 't2', name: 'Keen Edge',    glyph: '◇', desc: '+1 ATK', tier: 1 },
  { id: 't3', name: 'Swift Step',   glyph: '✧', desc: '+1 SPD', tier: 1 },
  { id: 't4', name: 'Ruinous Blow', glyph: '✦', desc: '+5% CRT', tier: 2 },
  { id: 't5', name: 'Bulwark',      glyph: '✺', desc: '+2 DEF',  tier: 2 },
  { id: 't6', name: 'Apex',         glyph: '★', desc: '+3 ATK / +15 HP', tier: 3 }
];
</script>

<template>
  <div class="talents">
    <h2 class="neon">✺ TALENTS</h2>
    <p class="dim" v-if="!sel">Select a hero.</p>
    <template v-else>
      <p class="dim">{{ sel.name }} · talent points: <span class="warn">{{ sel.level - 1 }}</span></p>
      <div class="tree">
        <div v-for="t in tree" :key="t.id" class="node" :data-tier="t.tier">
          <span class="g">{{ t.glyph }}</span>
          <div>
            <div class="n">{{ t.name }}</div>
            <div class="d dim">{{ t.desc }}</div>
          </div>
          <button :disabled="sel.level - 1 <= 0">+</button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.talents h2 {
  font-family: 'Cinzel', Georgia, serif;
  letter-spacing: 0.25em; margin: 0 0 10px;
  color: var(--gold); font-size: 15px;
}
.tree { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 12px; }
.node {
  display: flex; align-items: center; gap: 8px;
  border: 1px solid var(--border); padding: 7px 8px;
  background: var(--bg-2);
}
.node[data-tier='2'] { border-color: var(--crimson-dim); }
.node[data-tier='3'] { border-color: var(--border-glow); }
.g { font-size: 20px; color: var(--gold); }
.n { font-size: 11px; font-family: 'Cinzel', Georgia, serif; color: var(--fg); }
.d { font-size: 10px; color: var(--fg-dim); font-style: italic; }
.node button { margin-left: auto; font-size: 14px; padding: 2px 7px; }
</style>
