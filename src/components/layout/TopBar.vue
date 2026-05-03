<script setup lang="ts">
import { useGameStore } from '@/stores/game';
import { computed } from 'vue';

const game = useGameStore();
const r = computed(() => game.resources);
</script>

<template>
  <header class="topbar">
    <div class="logo">P&nbsp;A&nbsp;R&nbsp;A&nbsp;G&nbsp;O&nbsp;N</div>
    <div class="resources">
      <span class="res"><span class="warn">{{ r.gold }}</span><span class="dim">g</span></span>
      <span class="res"><span>{{ r.silver }}</span><span class="dim">s</span></span>
      <span class="res"><span class="r-uncommon">{{ r.copper }}</span><span class="dim">c</span></span>
    </div>
    <button class="options" @click="game.optionsOpen = !game.optionsOpen" title="Options">
      ☰<span class="opt-label">options</span>
    </button>
  </header>
</template>

<style scoped>
.topbar {
  display: flex; align-items: center; gap: 16px;
  padding: 5px 16px;
  border: 1px solid var(--border-hi);
  background: var(--bg);
}
.logo {
  font-family: 'Cinzel Decorative', 'Cinzel', Georgia, serif;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.45em;
  color: var(--gold-bright);
  flex: 0 0 auto;
}
.resources {
  flex: 1; text-align: right;
  font-family: 'Cinzel', Georgia, serif;
  font-size: 14px;
  letter-spacing: 0.08em;
}
.res { margin-left: 14px; }
.options {
  display: inline-flex; flex-direction: column; align-items: center;
  font-size: 18px; line-height: 1;
  padding: 4px 10px;
  font-family: serif;
}
.opt-label {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 8px; opacity: 0.6; letter-spacing: 0.2em; margin-top: 2px;
  text-transform: uppercase;
}
</style>
