<script setup lang="ts">
import { usePartyStore } from '@/stores/party';

const party = usePartyStore();

const quests = [
  { id: 'q1', title: 'A Modest Beginning', text: 'Clear the Whispering Crypt.', reward: '50g + gear' },
  { id: 'q2', title: 'Pest Control', text: 'Drive the goblins from their warren.', reward: '30g + materials' },
  { id: 'q3', title: 'Iron Ambition', text: 'Investigate the ruined Iron Keep.', reward: '120g + epic loot' }
];
</script>

<template>
  <div class="quest">
    <h2 class="title neon">▶ ACTIVE QUESTS</h2>
    <ul class="list">
      <li v-for="q in quests" :key="q.id" class="row">
        <div class="head">
          <span class="mag">◇</span>
          <span class="name">{{ q.title }}</span>
        </div>
        <p class="text dim">{{ q.text }}</p>
        <p class="reward">reward · <span class="warn">{{ q.reward }}</span></p>
      </li>
    </ul>
    <h2 class="title neon" style="margin-top: 16px;">▶ PARTY ROSTER</h2>
    <ul class="roster">
      <li v-for="m in party.members" :key="m.id" class="rosterRow">
        <span class="glyph">{{ m.glyph }}</span>
        <span class="rname">{{ m.name }}</span>
        <span class="dim">· {{ m.classId }}</span>
        <span class="lvl">Lv {{ m.level }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.quest { font-size: 14px; }
.title {
  font-family: 'Cinzel', Georgia, serif;
  letter-spacing: 0.25em; font-size: 11px; margin: 0 0 10px;
  color: var(--gold);
  display: flex; align-items: center; gap: 8px;
}
.title::after {
  content: ''; flex: 1;
  border-bottom: 1px solid var(--border);
}
.list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
.row {
  padding: 8px 10px;
  border: 1px solid var(--border);
  background: rgba(0,0,0,0.3);
  border-left: 3px solid var(--amber);
}
.head { display: flex; gap: 8px; margin-bottom: 4px; }
.name { color: var(--fg); font-style: italic; }
.text { margin: 2px 0; font-size: 12px; }
.reward { margin: 4px 0 0; font-size: 11px; font-family: 'Cinzel', Georgia, serif; letter-spacing: 0.08em; }
.roster { list-style: none; padding: 0; margin: 0; }
.rosterRow {
  display: flex; gap: 10px; padding: 5px 0;
  border-bottom: 1px solid var(--border);
}
.glyph { color: var(--gold); width: 20px; text-align: center; font-size: 16px; }
.rname { min-width: 80px; font-style: italic; }
.lvl { margin-left: auto; color: var(--gold); font-family: 'Cinzel', Georgia, serif; font-size: 11px; }
</style>
