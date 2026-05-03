<script setup lang="ts">
import { computed, ref } from 'vue';
import type { QuestObjective, QuestReward } from '@/types/types';
import { QUEST_DB } from '@/data/quests';
import { ITEM_DB } from '@/data/items';
import { usePartyStore } from '@/stores/party';
import { useQuestStore } from '@/stores/quests';

const party = usePartyStore();
const questStore = useQuestStore();

// ── Sorted quest lists ────────────────────────────────────────────────────────

const activeQuests = computed(() =>
  questStore.unlockedQuestIds
    .map(id => QUEST_DB[id])
    .filter(q => q && !questStore.completedQuestIds.includes(q.id))
    .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999))
);

const completedQuests = computed(() =>
  questStore.completedQuestIds
    .map(id => QUEST_DB[id])
    .filter(Boolean)
    .reverse() // most recently completed first
);

// ── Objective display ─────────────────────────────────────────────────────────

function objLabel(obj: QuestObjective): string {
  switch (obj.kind) {
    case 'kill':    return obj.label ?? `Slay ${obj.count}x ${obj.enemyId === '*' ? 'enemies' : obj.enemyId}`;
    case 'collect': return obj.label ?? `Collect ${obj.count}x ${obj.itemId}`;
    case 'dungeon': return obj.label ?? `Clear: ${obj.dungeonId.replaceAll('_', ' ')}`;
    case 'level':   return obj.label ?? `Reach level ${obj.minLevel}`;
    case 'manual':  return obj.description;
  }
}

function objCurrent(questId: string, obj: QuestObjective, idx: number): number {
  return questStore.getObjectiveCurrent(questId, obj, idx);
}

function objMax(obj: QuestObjective): number {
  return questStore.getObjectiveMax(obj);
}

function objDone(questId: string, obj: QuestObjective, idx: number): boolean {
  return questStore.isObjectiveComplete(questId, obj, idx);
}

// ── Reward display ────────────────────────────────────────────────────────────

function rewardLabel(reward: QuestReward, isCompleted: boolean): string {
  if (reward.hidden && !isCompleted) return '???';
  switch (reward.kind) {
    case 'xp':
      return `${reward.amount} XP`;
    case 'currency': {
      const parts: string[] = [];
      if (reward.gold)   parts.push(`${reward.gold}g`);
      if (reward.silver) parts.push(`${reward.silver}s`);
      if (reward.copper) parts.push(`${reward.copper}c`);
      return parts.join(' ') || '0c';
    }
    case 'item': {
      const item = ITEM_DB[reward.itemId];
      const qty  = reward.qty && reward.qty > 1 ? ` x${reward.qty}` : '';
      return item ? `${item.glyph} ${item.name}${qty}` : reward.itemId;
    }
    case 'unlock':
      return `Unlock: ${reward.unlockId.replaceAll('_', ' ')}`;
    case 'text':
      return reward.label;
  }
}

// ── Completed quest expand/collapse ─────────────────────────────────────────

const expandedCompleted = ref<Set<string>>(new Set());

function toggleCompleted(id: string) {
  const s = new Set(expandedCompleted.value);
  if (s.has(id)) s.delete(id);
  else s.add(id);
  expandedCompleted.value = s;
}

// ── Difficulty styling ────────────────────────────────────────────────────────

const diffClass: Record<string, string> = {
  trivial:   'diff-trivial',
  easy:      'diff-easy',
  normal:    'diff-normal',
  hard:      'diff-hard',
  legendary: 'diff-legendary',
};
</script>

<template>
  <div class="quest-log">

    <!-- ── Active / Available ───────────────────────────────────────────────── -->
    <div class="section-title">Quest Log</div>

    <div v-if="activeQuests.length === 0" class="empty dim">
      No active quests.
    </div>

    <ul v-else class="list">
      <li v-for="q in activeQuests" :key="q.id" class="card">

        <!-- Header -->
        <div class="card-head">
          <span class="card-glyph">◇</span>
          <span class="card-title">{{ q.title }}</span>
          <span class="diff-badge" :class="diffClass[q.difficulty]">{{ q.difficulty }}</span>
        </div>

        <!-- Flavor -->
        <p v-if="q.flavor" class="flavor dim">"{{ q.flavor }}"</p>

        <!-- Description -->
        <p class="desc">{{ q.description }}</p>

        <!-- Objectives -->
        <div class="sub-section">Objectives</div>
        <ul class="obj-list">
          <li v-for="(obj, i) in q.objectives" :key="i"
              class="obj-row"
              :class="{ done: objDone(q.id, obj, i) }">
            <span class="obj-glyph">{{ objDone(q.id, obj, i) ? '✔' : '◉' }}</span>
            <span class="obj-label">{{ objLabel(obj) }}</span>
            <span v-if="obj.kind !== 'manual'" class="obj-count">
              {{ objCurrent(q.id, obj, i) }} / {{ objMax(obj) }}
            </span>
          </li>
        </ul>

        <!-- Rewards -->
        <div class="sub-section">Rewards</div>
        <div class="rewards">
          <span v-for="(r, i) in q.rewards" :key="i" class="reward-tag">
            {{ rewardLabel(r, false) }}
          </span>
        </div>

        <!-- Turn-in -->
        <button
          v-if="questStore.canTurnIn(q.id)"
          class="claim-btn"
          @click="questStore.turnIn(q.id)">
          Claim Rewards
        </button>

      </li>
    </ul>

    <!-- ── Completed ────────────────────────────────────────────────────────── -->
    <template v-if="completedQuests.length > 0">
      <div class="section-title" style="margin-top: 18px;">Completed</div>
      <ul class="list">
      <li v-for="q in completedQuests" :key="q.id" class="card card-done">
          <div class="card-head clickable" @click="toggleCompleted(q.id)">
            <span class="card-glyph dim">✔</span>
            <span class="card-title dim">{{ q.title }}</span>
            <span class="done-label">completed</span>
            <span class="expand-toggle dim">{{ expandedCompleted.has(q.id) ? '▲' : '▼' }}</span>
          </div>
          <template v-if="expandedCompleted.has(q.id)">
            <p v-if="q.flavor" class="flavor dim">"{{ q.flavor }}"</p>
            <p class="desc">{{ q.description }}</p>
            <div class="sub-section">Objectives</div>
            <ul class="obj-list">
              <li v-for="(obj, i) in q.objectives" :key="i" class="obj-row done">
                <span class="obj-glyph">✔</span>
                <span class="obj-label">{{ objLabel(obj) }}</span>
              </li>
            </ul>
            <div class="sub-section">Rewards</div>
            <div class="rewards">
              <span v-for="(r, i) in q.rewards" :key="i" class="reward-tag">
                {{ rewardLabel(r, true) }}
              </span>
            </div>
          </template>
        </li>
      </ul>
    </template>


  </div>
</template>

<style scoped>
.quest-log { font-size: 13px; }

.section-title {
  font-family: 'Cinzel', Georgia, serif;
  letter-spacing: 0.25em;
  font-size: 10px;
  color: var(--gold);
  margin: 0 0 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  text-transform: uppercase;
}
.section-title::after { content: ''; flex: 1; border-bottom: 1px solid var(--border); }

.empty { font-size: 12px; font-style: italic; padding: 8px 0; }

.list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }

/* ── Quest card ── */
.card {
  padding: 10px 12px;
  border: 1px solid var(--border-hi);
  border-left: 3px solid var(--amber);
  background: var(--bg-2);
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.card-done {
  border-left-color: var(--border);
  opacity: 0.6;
}
.card-done.expanded { opacity: 0.85; }

.clickable { cursor: pointer; user-select: none; }
.clickable:hover .card-title { color: var(--fg); }

.expand-toggle {
  font-size: 9px;
  flex-shrink: 0;
  color: var(--fg-dim);
}

.card-head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.card-glyph { color: var(--amber); font-size: 13px; flex-shrink: 0; }
.card-title {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 18px;
  letter-spacing: 0.1em;
  color: var(--fg);
  flex: 1;
}
.done-label {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 8px;
  letter-spacing: 0.2em;
  color: var(--fg-dim);
  text-transform: uppercase;
}

/* ── Difficulty badge ── */
.diff-badge {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 8px;
  letter-spacing: 0.15em;
  padding: 1px 6px;
  border: 1px solid currentColor;
  text-transform: uppercase;
  flex-shrink: 0;
}
.diff-trivial   { color: var(--fg-dim); }
.diff-easy      { color: var(--good); }
.diff-normal    { color: var(--amber); }
.diff-hard      { color: var(--crimson); }
.diff-legendary { color: var(--gold-bright); }

.flavor {
  font-size: 16px;
  font-style: italic;
  margin: 0;
  padding-left: 4px;
  border-left: 2px solid var(--border);
}
.desc { font-size: 16px; margin: 0; }

/* ── Objectives ── */
.sub-section {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 8px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--fg-dim);
  margin-top: 2px;
}

.obj-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.obj-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--fg);
}
.obj-row.done { color: var(--fg-dim); text-decoration: line-through; }
.obj-glyph { flex-shrink: 0; color: var(--amber); font-size: 10px; }
.obj-row.done .obj-glyph { color: var(--good); }
.obj-label { flex: 1; }
.obj-count {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 10px;
  color: var(--fg-dim);
  flex-shrink: 0;
}

/* ── Rewards ── */
.rewards { display: flex; flex-wrap: wrap; gap: 5px; }
.reward-tag {
  font-size: 11px;
  font-family: 'Cinzel', Georgia, serif;
  letter-spacing: 0.06em;
  color: var(--gold-bright);
  background: var(--gold-tint-lo);
  border: 1px solid var(--border-hi);
  padding: 2px 7px;
}

/* ── Claim button ── */
.claim-btn {
  align-self: flex-start;
  margin-top: 4px;
  font-size: 10px;
  letter-spacing: 0.25em;
  border-color: var(--gold);
  color: var(--gold);
  padding: 5px 14px;
}
.claim-btn:hover { background: var(--gold-tint-mid); border-color: var(--gold-bright); }

/* ── Party roster ── */
.roster { list-style: none; padding: 0; margin: 0; }
.rosterRow {
  display: flex;
  gap: 10px;
  padding: 5px 0;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
}
.glyph { color: var(--gold); width: 20px; text-align: center; font-size: 16px; }
.rname { min-width: 80px; font-style: italic; }
.lvl { margin-left: auto; color: var(--gold); font-family: 'Cinzel', Georgia, serif; font-size: 11px; }
</style>
