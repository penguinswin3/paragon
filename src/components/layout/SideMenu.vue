<script setup lang="ts">
import { useGameStore, type GameView } from '@/stores/game';

const game = useGameStore();

const items: { id: GameView; label: string; glyph: string }[] = [
  { id: 'quest',   label: 'quest',   glyph: '✦' },
  { id: 'gear',    label: 'gear',    glyph: '⚒' },
  { id: 'talents', label: 'talents', glyph: '✺' },
];

function pick(id: GameView) {
  game.setView(id);
}
</script>

<template>
  <nav class="sidemenu">
    <button v-for="it in items" :key="it.id"
            class="item"
            :class="{ active: game.view === it.id }"
            :title="it.label"
            @click="pick(it.id)">
      <span class="glyph">{{ it.glyph }}</span>
      <span class="lbl">{{ it.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.sidemenu {
  display: flex; flex-direction: column; gap: 4px;
  padding: 6px;
  border-right: 1px solid var(--border);
  width: 66px;
  background: #090705;
}
.item {
  display: flex; flex-direction: column; align-items: center;
  padding: 6px 0;
  font-family: 'Cinzel', Georgia, serif;
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--fg-dim);
}
.item .glyph { font-size: 17px; color: var(--fg-dim); margin-bottom: 3px; font-family: serif; }
.item:hover:not(:disabled) { border-color: var(--border-glow); color: var(--fg); }
.item:hover .glyph { color: var(--fg); }
.item.active {
  border-color: var(--gold);
  color: var(--gold);
  background: rgba(90,68,34,0.12);
}
.item.active .glyph { color: var(--gold); }
.arrow { margin-top: auto; text-align: center; color: var(--fg-dim); font-size: 18px; }
</style>
