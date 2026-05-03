<script setup lang="ts">
import { useGameStore, type GameView } from '@/stores/game';
import { useQuestStore } from '@/stores/quests';

const game = useGameStore();
const questStore = useQuestStore();

const items: { id: GameView; label: string; glyph: string }[] = [
  { id: 'quest',   label: 'quest',   glyph: '✦' },
  { id: 'gear',    label: 'gear',    glyph: '⚒' },
  { id: 'talents', label: 'talents', glyph: '✺' },
];

function pick(id: GameView) {
  game.setView(id);
  if (id === 'quest') questStore.clearNewFlag();
}
</script>

<template>
  <nav class="sidemenu">
    <button v-for="it in items" :key="it.id"
            class="item"
            :class="{
              active: game.view === it.id,
              'has-new': it.id === 'quest' && questStore.hasNewQuests,
            }"
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
  position: relative;
  overflow: hidden;
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

/* ── New-quest coin shine ── */
@keyframes coin-shine {
  0%   { transform: translateX(-120%) skewX(-18deg); opacity: 0; }
  15%  { opacity: 1; }
  85%  { opacity: 1; }
  100% { transform: translateX(220%) skewX(-18deg); opacity: 0; }
}

.item.has-new {
  border-color: var(--gold-bright);
  color: var(--gold-bright);
}
.item.has-new .glyph { color: var(--gold-bright); }

.item.has-new::after {
  content: '';
  position: absolute;
  top: -10%;
  left: 0;
  width: 35%;
  height: 120%;
  background: linear-gradient(
    to right,
    transparent,
    rgba(255, 215, 80, 0.45),
    transparent
  );
  animation: coin-shine 2.2s ease-in-out infinite;
  pointer-events: none;
}
</style>
