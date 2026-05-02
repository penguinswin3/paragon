<script setup lang="ts">
import { useGameStore } from '@/stores/game';
import QuestView from '@/components/views/QuestView.vue';
import GearView from '@/components/views/GearView.vue';
import TalentsView from '@/components/views/TalentsView.vue';

const game = useGameStore();
</script>

<template>
  <div class="screen">
    <QuestView    v-if="game.view === 'quest'" />
    <GearView     v-else-if="game.view === 'gear'" />
    <TalentsView  v-else-if="game.view === 'talents'" />
    <div v-else class="placeholder">— select a panel —</div>
  </div>
</template>

<style scoped>
.screen {
  flex: 1;
  min-width: 0; min-height: 0;
  position: relative;
  padding: 12px;
  overflow: auto;
  background: #0c0906;
}
.placeholder {
  display: grid; place-items: center;
  height: 100%;
  color: var(--fg-dim);
  letter-spacing: 0.3em;
  font-family: 'Cinzel', Georgia, serif;
  font-size: 12px;
}
</style>
