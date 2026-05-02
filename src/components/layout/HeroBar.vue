<script setup lang="ts">
import { usePartyStore } from '@/stores/party';
import { computed } from 'vue';

const party = usePartyStore();

const slots = computed(() => party.members.filter(m => m.classId === 'warrior'));
</script>

<template>
  <div class="herobar">
    <button v-for="c in slots" :key="c.id" class="hero"
            :class="{ active: party.selectedId === c.id }"
            :title="`${c.name} — Lv ${c.level}`"
            @click="party.select(c.id)">
      <span class="glyph">{{ c.glyph }}</span>
    </button>
  </div>
</template>

<style scoped>
.herobar {
  display: flex; gap: 5px;
  padding: 6px;
  border-bottom: 1px solid var(--border);
  background: #0a0806;
}
.hero {
  width: 46px; height: 46px;
  border: 1px solid var(--border-hi);
  background: #0e0b08;
  font-size: 24px; line-height: 1;
  color: var(--fg-dim);
  font-family: serif;
}
.hero:hover:not(.empty) { border-color: var(--border-glow); color: var(--fg); }
.hero.active {
  border-color: var(--gold);
  color: var(--gold);
  background: #140f08;
}
.hero.empty { color: var(--border-hi); border-style: dashed; }
.arrow { display:flex; align-items:center; color: var(--fg-dim); font-size: 20px; padding: 0 6px; }
</style>
