import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { QuestObjective, QuestPrerequisite } from '@/types/types';
import { QUEST_DB } from '@/data/quests';
import { ITEM_DB } from '@/data/items';
import { usePartyStore } from './party';
import { useInventoryStore } from './inventory';
import { useGameStore } from './game';
import { useDungeonStore } from './dungeon';

// ─────────────────────────────────────────────────────────────────────────────
// Quest runtime store
//
// Tracks which quests are visible, their objective progress, and whether any
// newly unlocked quests are waiting for the player's attention.
//
// Cross-store dependencies:
//  • party    — level / class prerequisite checks
//  • inventory — item prerequisite + collect objective live counts
//  • dungeon  — dungeon-cleared prerequisite (called lazily inside fns to
//               avoid circular module imports)
//  • game     — currency rewards on turn-in
// ─────────────────────────────────────────────────────────────────────────────

export const useQuestStore = defineStore('quest', () => {
  const partyStore = usePartyStore();
  const invStore   = useInventoryStore();

  /** Quest IDs the player can currently see in the log. */
  const unlockedQuestIds = ref<string[]>([]);

  /** Quest IDs that have been turned in (rewards claimed). */
  const completedQuestIds = ref<string[]>([]);

  /**
   * questId → array of stored progress counts, index-aligned with
   * quest.objectives. Only used for objective kinds whose progress must be
   * tracked over time (kill, dungeon, manual). Collect/level are always
   * computed live from party / inventory.
   */
  const objectiveProgress = ref<Record<string, number[]>>({});

  /** True when any quest was unlocked since the player last viewed the quest log. */
  const hasNewQuests = ref(false);

  // ── Prerequisite checking ─────────────────────────────────────────────────

  function checkPrereq(prereq: QuestPrerequisite): boolean {
    switch (prereq.kind) {
      case 'quest':
        return completedQuestIds.value.includes(prereq.questId);

      case 'level': {
        const levels = partyStore.members.map(m => m.level);
        if (prereq.scope === 'all')    return levels.every(l => l >= prereq.minLevel);
        if (prereq.scope === 'leader') return (levels[0] ?? 0) >= prereq.minLevel;
        return levels.some(l => l >= prereq.minLevel); // 'any' (default)
      }

      case 'item': {
        const need = prereq.qty ?? 1;
        const have = invStore.entries
          .filter(e => e.item.id === prereq.itemId)
          .reduce((s, e) => s + e.qty, 0);
        return have >= need;
      }

      case 'dungeon': {
        const dungeonStore = useDungeonStore();
        const completed = dungeonStore.completedStages[prereq.dungeonId] ?? [];
        return completed.length > 0;
      }

      case 'class':
        return partyStore.members.some(m => prereq.classIds.includes(m.classId));
    }
  }

  function checkPrerequisites(questId: string): boolean {
    const quest = QUEST_DB[questId];
    if (!quest?.prerequisites?.length) return true;
    return quest.prerequisites.every(p => checkPrereq(p));
  }

  // ── Unlock logic ──────────────────────────────────────────────────────────

  /** Explicitly unlock a single quest by id (used by reward processing). */
  function unlock(questId: string) {
    if (
      !unlockedQuestIds.value.includes(questId) &&
      !completedQuestIds.value.includes(questId)
    ) {
      unlockedQuestIds.value = [...unlockedQuestIds.value, questId];
      hasNewQuests.value = true;
    }
  }

  /** Scan all quests and unlock any whose prerequisites are now met. */
  function tryUnlockAll() {
    let anyNew = false;
    for (const quest of Object.values(QUEST_DB)) {
      if (unlockedQuestIds.value.includes(quest.id)) continue;
      if (completedQuestIds.value.includes(quest.id)) continue;
      if (checkPrerequisites(quest.id)) {
        unlockedQuestIds.value = [...unlockedQuestIds.value, quest.id];
        anyNew = true;
      }
    }
    if (anyNew) hasNewQuests.value = true;
  }

  /** Called when the player opens the quest log — clears the badge. */
  function clearNewFlag() {
    hasNewQuests.value = false;
  }

  // ── Objective helpers ─────────────────────────────────────────────────────

  function getObjectiveMax(obj: QuestObjective): number {
    switch (obj.kind) {
      case 'kill':    return obj.count;
      case 'collect': return obj.count;
      case 'dungeon': return obj.requiredVictories ?? 1;
      case 'level':   return obj.minLevel;
      case 'manual':  return obj.count ?? 1;
    }
  }

  /**
   * Returns the current progress value for an objective.
   * Collect and level objectives are computed live from current state;
   * all others use the stored progress counter.
   */
  function getObjectiveCurrent(questId: string, obj: QuestObjective, idx: number): number {
    switch (obj.kind) {
      case 'collect': {
        return invStore.entries
          .filter(e => e.item.id === obj.itemId)
          .reduce((s, e) => s + e.qty, 0);
      }
      case 'level': {
        const levels = partyStore.members.map(m => m.level);
        if (obj.scope === 'all')    return Math.min(...levels);
        if (obj.scope === 'leader') return levels[0] ?? 0;
        return Math.max(...levels);
      }
      default:
        return objectiveProgress.value[questId]?.[idx] ?? 0;
    }
  }

  function isObjectiveComplete(questId: string, obj: QuestObjective, idx: number): boolean {
    return getObjectiveCurrent(questId, obj, idx) >= getObjectiveMax(obj);
  }

  function canTurnIn(questId: string): boolean {
    const quest = QUEST_DB[questId];
    if (!quest) return false;
    if (!unlockedQuestIds.value.includes(questId)) return false;
    if (completedQuestIds.value.includes(questId)) return false;
    return quest.objectives.every((obj, i) => isObjectiveComplete(questId, obj, i));
  }

  // ── Progress recording (called from dungeon store) ────────────────────────

  function addProgress(questId: string, objIndex: number, amount: number) {
    const quest = QUEST_DB[questId];
    if (!quest) return;
    const obj = quest.objectives[objIndex];
    if (!obj) return;
    const existing = objectiveProgress.value[questId] ?? new Array(quest.objectives.length).fill(0);
    const updated = [...existing];
    updated[objIndex] = Math.min((updated[objIndex] ?? 0) + amount, getObjectiveMax(obj));
    objectiveProgress.value = { ...objectiveProgress.value, [questId]: updated };
  }

  function recordKill(enemyId: string, dungeonId: string) {
    for (const quest of Object.values(QUEST_DB)) {
      if (!unlockedQuestIds.value.includes(quest.id)) continue;
      if (completedQuestIds.value.includes(quest.id)) continue;
      quest.objectives.forEach((obj, i) => {
        if (obj.kind !== 'kill') return;
        if (obj.enemyId !== '*' && obj.enemyId !== enemyId) return;
        if (obj.dungeonId && obj.dungeonId !== dungeonId) return;
        addProgress(quest.id, i, 1);
      });
    }
    tryUnlockAll();
  }

  function recordDungeonClear(dungeonId: string) {
    for (const quest of Object.values(QUEST_DB)) {
      if (!unlockedQuestIds.value.includes(quest.id)) continue;
      if (completedQuestIds.value.includes(quest.id)) continue;
      quest.objectives.forEach((obj, i) => {
        if (obj.kind !== 'dungeon') return;
        if (obj.dungeonId !== '*' && obj.dungeonId !== dungeonId) return;
        addProgress(quest.id, i, 1);
      });
    }
    tryUnlockAll();
  }

  // ── Turn-in ───────────────────────────────────────────────────────────────

  function turnIn(questId: string) {
    if (!canTurnIn(questId)) return;
    const quest = QUEST_DB[questId];
    if (!quest) return;

    const gameStore    = useGameStore();
    const dungeonStore = useDungeonStore();

    // Consume items from collect objectives marked consume: true
    for (const obj of quest.objectives) {
      if (obj.kind === 'collect' && obj.consume) {
        let remaining = obj.count;
        for (const entry of [...invStore.entries]) {
          if (entry.item.id !== obj.itemId) continue;
          const toRemove = Math.min(remaining, entry.qty);
          invStore.remove(entry.key, toRemove);
          remaining -= toRemove;
          if (remaining <= 0) break;
        }
      }
    }

    // Mark completed before applying rewards so unlock-from-reward quests
    // don't accidentally include this quest in a re-lock check
    completedQuestIds.value = [...completedQuestIds.value, questId];

    // Apply rewards
    for (const reward of quest.rewards) {
      switch (reward.kind) {
        case 'xp':
          partyStore.awardXp(reward.amount);
          break;
        case 'currency': {
          const copper =
            (reward.copper ?? 0) +
            (reward.silver ?? 0) * 100 +
            (reward.gold   ?? 0) * 10000;
          gameStore.addGold(copper);
          break;
        }
        case 'item': {
          const item = ITEM_DB[reward.itemId];
          if (item) invStore.add(item, reward.qty ?? 1);
          break;
        }
        case 'unlock':
          if (reward.unlockType === 'quest') {
            unlock(reward.unlockId);
          } else if (reward.unlockType === 'dungeon') {
            dungeonStore.unlockDungeon(reward.unlockId);
          }
          break;
        // 'text' rewards are display-only
      }
    }

    // Unlock any quests whose prereqs are now satisfied
    tryUnlockAll();
  }

  // ── Initialise: silently unlock all immediately-available quests ──────────
  tryUnlockAll();
  hasNewQuests.value = false; // don't badge for quests available at game start

  return {
    unlockedQuestIds,
    completedQuestIds,
    objectiveProgress,
    hasNewQuests,
    unlock,
    tryUnlockAll,
    clearNewFlag,
    getObjectiveMax,
    getObjectiveCurrent,
    isObjectiveComplete,
    canTurnIn,
    recordKill,
    recordDungeonClear,
    turnIn,
  };
});
