<script setup lang="ts">
import { useDungeonStore } from '@/stores/dungeon';
import CombatView from '@/components/views/CombatView.vue';
import { computed } from 'vue';

const dungeon = useDungeonStore();
const sel = computed(() => dungeon.selectedDungeon);
const stage = computed(() => dungeon.selectedStage);
const showCombat = computed(() => dungeon.run !== null);
</script>

<template>
  <div class="dungeon">
    <CombatView v-if="showCombat" />
    <template v-else>

    <!-- ASCII art -->
    <div class="art">
      <pre>{{ sel?.art ?? '— no dungeon —' }}</pre>
    </div>

    <!-- Dungeon selector -->
    <div class="select">
      <button v-for="d in dungeon.dungeons" :key="d.id"
              :class="{
                active: dungeon.selectedDungeonId === d.id,
                locked: !dungeon.unlockedDungeonIds.includes(d.id)
              }"
              :disabled="dungeon.isRunning || !dungeon.unlockedDungeonIds.includes(d.id)"
              @click="dungeon.selectDungeon(d.id)">
        {{ dungeon.unlockedDungeonIds.includes(d.id) ? d.name : '🔒 ' + d.name }}
      </button>
    </div>

    <!-- Stage selector (shown when a dungeon is selected) -->
    <div v-if="sel" class="stages">
      <button v-for="s in sel.stages" :key="s.id"
              :class="{
                active: dungeon.selectedStageId === s.id,
                locked: !dungeon.isStageUnlocked(sel.id, s.id)
              }"
              :disabled="dungeon.isRunning || !dungeon.isStageUnlocked(sel.id, s.id)"
              @click="dungeon.selectStage(s.id)">
        <span v-if="!dungeon.isStageUnlocked(sel.id, s.id)">🔒 </span>
        {{ s.name }}
        <span class="stage-diff">{{ '★'.repeat(s.difficulty) }}</span>
      </button>
    </div>

    <!-- Stage details -->
    <div class="details">
      <div v-if="stage">
        <div class="title">{{ stage.name }}</div>
        <div class="meta">
          <span class="dim">diff</span>
          <span class="warn">{{ '★'.repeat(stage.difficulty) }}</span>
          <span class="dim"> · rec lv </span>
          <span class="neon">{{ stage.recommendedLevel }}</span>
          <span class="dim"> · enc </span>
          <span>{{ stage.encounters.length }}</span>
        </div>
        <p class="desc dim">{{ stage.description }}</p>
        <p v-if="stage.unlockText" class="unlock-text">✦ {{ stage.unlockText }}</p>
      </div>
      <div v-else-if="sel" class="dim" style="font-size:11px">Select a stage above.</div>
    </div>

    <button class="start" :disabled="!stage || dungeon.isRunning" @click="dungeon.startDungeon()">
      ▶ START DUNGEON
    </button>

    </template>
  </div>
</template>

<style scoped>
.dungeon { display: flex; flex-direction: column; gap: 8px; height: 100%; min-height: 0; }
.art {
  border: 1px solid var(--border-hi);
  background: var(--bg);
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
.select button.active { color: var(--gold); border-color: var(--gold); background: var(--gold-tint-lo); }
.select button.locked { opacity: 0.5; }

.stages {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 0 0 8px;
  border-left: 2px solid var(--border);
}
.stages button {
  font-size: 10px;
  text-align: left;
  padding: 3px 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
}
.stages button.active { color: var(--amber); border-color: var(--amber); background: var(--gold-tint-lo); }
.stages button.locked { opacity: 0.45; }
.stage-diff { font-size: 9px; color: var(--warn); letter-spacing: -1px; flex-shrink: 0; }

.details {
  flex: 1;
  border: 1px solid var(--border);
  padding: 8px;
  background: var(--bg);
  font-size: 12px;
  overflow: auto;
}
.title { font-family: 'Cinzel', Georgia, serif; color: var(--gold); letter-spacing: 0.2em; font-size: 12px; margin-bottom: 4px; }
.meta { font-size: 11px; margin-top: 2px; font-family: 'Cinzel', Georgia, serif; letter-spacing: 0.05em; }
.desc { font-size: 12px; margin-top: 5px; color: var(--fg); font-style: italic; }
.unlock-text { font-size: 10px; color: var(--amber); margin-top: 6px; opacity: 0.8; }

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
.start:hover:not(:disabled) { background: var(--gold-tint-mid); }
</style>
