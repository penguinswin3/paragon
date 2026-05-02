<script setup lang="ts">
import { useDungeonStore } from '@/stores/dungeon';
import CombatView from '@/components/views/CombatView.vue';
import { computed } from 'vue';

const dungeon = useDungeonStore();
const sel = computed(() => dungeon.selected);
const showCombat = computed(() => dungeon.run !== null);
</script>

<template>
  <div class="dungeon">
    <CombatView v-if="showCombat" />
    <template v-else>
    <div class="art">
      <pre>{{ sel?.art ?? '— no dungeon —' }}</pre>
    </div>

    <div class="select">
      <button v-for="d in dungeon.dungeons" :key="d.id"
              :class="{ active: dungeon.selectedId === d.id }"
              :disabled="dungeon.isRunning"
              @click="dungeon.select(d.id)">
        {{ d.name }}
      </button>
    </div>

    <div class="details">
      <div v-if="sel">
        <div class="title">{{ sel.name }}</div>
        <div class="meta">
          <span class="dim">diff</span>
          <span class="warn">{{ '★'.repeat(sel.difficulty) }}</span>
          <span class="dim"> · rec lv </span>
          <span class="neon">{{ sel.recommendedLevel }}</span>
          <span class="dim"> · enc </span>
          <span>{{ sel.encounters.length }}</span>
        </div>
        <p class="desc dim">{{ sel.description }}</p>
      </div>
    </div>

    <button class="start" :disabled="!sel || dungeon.isRunning" @click="dungeon.startDungeon()">
      ▶ START DUNGEON
    </button>
    </template>
  </div>
</template>

<style scoped>
.dungeon { display: flex; flex-direction: column; gap: 8px; height: 100%; min-height: 0; }
.art {
  border: 1px solid var(--border-hi);
  background: #0a0704;
  padding: 6px;
  flex: 0 0 auto;
  display: flex; align-items: center; justify-content: center;
  min-height: 80px; max-height: 110px;
  overflow: hidden;
}
.art pre {
  margin: 0; font-size: 10px; line-height: 1.1;
  color: var(--amber);
  font-family: monospace;
}
.select { display: flex; flex-direction: column; gap: 2px; }
.select button { font-size: 10px; text-align: left; padding: 3px 8px; }
.select button.active { color: var(--gold); border-color: var(--gold); background: rgba(90,68,34,0.12); }

.details {
  flex: 1;
  border: 1px solid var(--border);
  padding: 8px;
  background: #0c0906;
  font-size: 12px;
  overflow: auto;
}
.title { font-family: 'Cinzel', Georgia, serif; color: var(--gold); letter-spacing: 0.2em; font-size: 12px; margin-bottom: 4px; }
.meta { font-size: 11px; margin-top: 2px; font-family: 'Cinzel', Georgia, serif; letter-spacing: 0.05em; }
.desc { font-size: 12px; margin-top: 5px; color: var(--fg); font-style: italic; }

.start {
  font-size: 12px;
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 600;
  letter-spacing: 0.35em;
  border: 1px solid var(--gold);
  color: var(--gold);
  padding: 7px 8px;
  text-transform: uppercase;
}
.start:hover:not(:disabled) { background: rgba(90,68,34,0.15); }
</style>
