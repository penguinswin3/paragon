import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type {
  CombatLogEntry, CombatUnit, Dungeon, DungeonRun, DungeonStage, Encounter,
  EnemyTemplate, Item, LootEntry
} from '@/types/types';
import { DUNGEON_DB } from '@/data/dungeons';
import { ITEM_DB } from '@/data/items';
import { useQuestStore } from './quests';
import { clamp, rollDice, uid, weightedPick } from '@/utils/game';
import { usePartyStore } from './party';
import { useInventoryStore } from './inventory';
import { useGameStore } from './game';
import {
  COMBAT_TICK_MS,
  PARTY_INITIAL_COOLDOWN, PARTY_INITIAL_COOLDOWN_JITTER,
  ENEMY_INITIAL_COOLDOWN, ENEMY_INITIAL_COOLDOWN_JITTER,
  COOLDOWN_BASE, COOLDOWN_SPD_FACTOR, COOLDOWN_MIN, COOLDOWN_MAX, COOLDOWN_JITTER,
  DEF_REDUCTION_FACTOR, DAMAGE_ROLL_SPREAD, CRIT_DAMAGE_MULTIPLIER,
  LOOT_DROP_CHANCE, COMBAT_LOG_MAX,
  SPEED_MIN, SPEED_MAX,
} from '@/data/game-config';

const TICK_MS = COMBAT_TICK_MS;

export const useDungeonStore = defineStore('dungeon', () => {
  const partyStore = usePartyStore();
  const invStore = useInventoryStore();
  const gameStore = useGameStore();

  const dungeons = ref<Dungeon[]>(Object.values(DUNGEON_DB));
  const selectedDungeonId = ref<string>(dungeons.value[0]?.id ?? '');
  const selectedStageId = ref<string>(dungeons.value[0]?.stages[0]?.id ?? '');
  /** dungeonId → array of completed stageIds */
  const completedStages = ref<Record<string, string[]>>({});
  /**
   * Dungeons available to the player. Starts with first two; others are
   * unlocked by the quest system via unlockDungeon().
   */
  const unlockedDungeonIds = ref<string[]>(
    dungeons.value.slice(0, 2).map(d => d.id)
  );
  const run = ref<DungeonRun | null>(null);
  const speed = ref(1);

  let timer: number | null = null;

  const selectedDungeon = computed<Dungeon | null>(() =>
    dungeons.value.find(d => d.id === selectedDungeonId.value) ?? null
  );

  const selectedStage = computed<DungeonStage | null>(() =>
    selectedDungeon.value?.stages.find(s => s.id === selectedStageId.value) ?? null
  );

  const isRunning = computed(() => run.value?.status === 'running');

  function isStageUnlocked(dungeonId: string, stageId: string): boolean {
    const dungeon = dungeons.value.find(d => d.id === dungeonId);
    if (!dungeon) return false;
    const idx = dungeon.stages.findIndex(s => s.id === stageId);
    if (idx === 0) return true;
    if (idx < 0) return false;
    const prevId = dungeon.stages[idx - 1].id;
    return (completedStages.value[dungeonId] ?? []).includes(prevId);
  }

  function selectDungeon(id: string) {
    if (isRunning.value) return;
    selectedDungeonId.value = id;
    const d = dungeons.value.find(d => d.id === id);
    if (!d || d.stages.length === 0) return;
    // Auto-advance to the furthest unlocked stage
    let lastUnlocked = d.stages[0].id;
    for (const stage of d.stages) {
      if (isStageUnlocked(id, stage.id)) lastUnlocked = stage.id;
      else break;
    }
    selectedStageId.value = lastUnlocked;
  }

  function selectStage(id: string) {
    if (isRunning.value) return;
    selectedStageId.value = id;
  }

  /** Called by the quest system when a quest reward unlocks a dungeon. */
  function unlockDungeon(id: string) {
    if (!unlockedDungeonIds.value.includes(id)) {
      unlockedDungeonIds.value = [...unlockedDungeonIds.value, id];
    }
  }

  function setSpeed(s: number) { speed.value = clamp(s, SPEED_MIN, SPEED_MAX); }

  function pushLog(kind: CombatLogEntry['kind'], text: string) {
    if (!run.value) return;
    const e: CombatLogEntry = { t: Date.now(), text, kind };
    run.value.log.push(e);
    if (run.value.log.length > COMBAT_LOG_MAX) run.value.log.splice(0, run.value.log.length - COMBAT_LOG_MAX);
  }

  function buildPartyUnits(): CombatUnit[] {
    return partyStore.members.map(c => {
      const s = partyStore.stats[c.id];
      return {
        uid: uid('p'),
        name: c.name,
        glyph: c.glyph,
        side: 'party',
        hp: s.hp, maxHp: s.hp,
        atk: s.atk, def: s.def, spd: s.spd, crit: s.crit,
        cooldown: PARTY_INITIAL_COOLDOWN + rollDice(0, PARTY_INITIAL_COOLDOWN_JITTER),
        alive: true,
        sourceId: c.id
      };
    });
  }

  function buildEnemyUnits(templates: EnemyTemplate[]): CombatUnit[] {
    return templates.map(t => ({
      uid: uid('e'),
      name: t.name,
      glyph: t.glyph,
      side: 'enemy',
      hp: t.stats.hp, maxHp: t.stats.hp,
      atk: t.stats.atk, def: t.stats.def, spd: t.stats.spd, crit: t.stats.crit,
      cooldown: ENEMY_INITIAL_COOLDOWN + rollDice(0, ENEMY_INITIAL_COOLDOWN_JITTER),
      alive: true,
      sourceId: t.id
    }));
  }

  /**
   * Route an encounter to the appropriate handler.
   * Combat encounters start the tick engine; all other categories are logged
   * and auto-resolved so the run advances immediately.
   */
  function resolveEncounter(enc: Encounter) {
    if (!run.value) return;
    if (enc.intro) pushLog('info', enc.intro);
    if (enc.category === 'combat') {
      const enemies = buildEnemyUnits(enc.enemies);
      run.value.units = run.value.units.filter(u => u.side === 'party').concat(enemies);
      startTimer();
    } else {
      if (enc.category === 'social')
        pushLog('info', `[Social]      ${enc.npcName}: "${enc.prompt}"`);
      else if (enc.category === 'exploration')
        pushLog('info', `[Exploration] ${enc.description}`);
      else if (enc.category === 'special')
        pushLog('info', `[Special]     ${enc.description}`);
      if (enc.outro) pushLog('info', enc.outro);
      advanceEncounter();
    }
  }

  function startDungeon() {
    if (!selectedDungeon.value || !selectedStage.value || isRunning.value) return;
    const dungeon = selectedDungeon.value;
    const stage = selectedStage.value;
    run.value = {
      dungeonId: dungeon.id,
      stageId: stage.id,
      status: 'running',
      encounterIndex: 0,
      units: [...buildPartyUnits()],
      log: [],
      rewards: { xp: 0, loot: [] }
    };
    pushLog('system', `▶ Entering ${dungeon.name} — ${stage.name}`);
    resolveEncounter(stage.encounters[0]);
  }

  function abortDungeon() {
    stopTimer();
    run.value = null;
  }

  function startTimer() {
    stopTimer();
    timer = window.setInterval(tick, TICK_MS);
  }
  function stopTimer() {
    if (timer !== null) { clearInterval(timer); timer = null; }
  }

  function aliveOnSide(side: 'party' | 'enemy') {
    return run.value!.units.filter(u => u.alive && u.side === side);
  }

  function tick() {
    if (!run.value || run.value.status !== 'running') return;
    const dt = TICK_MS * speed.value;

    const units = run.value.units;
    // Sort by cooldown so faster units act earlier this tick
    const order = [...units].filter(u => u.alive).sort((a, b) => a.cooldown - b.cooldown);
    for (const u of order) {
      if (!u.alive) continue;
      u.cooldown -= dt;
      if (u.cooldown <= 0) {
        performAttack(u);
        // attack speed: lower spd means longer cooldown
        u.cooldown = clamp(COOLDOWN_BASE - u.spd * COOLDOWN_SPD_FACTOR, COOLDOWN_MIN, COOLDOWN_MAX) + rollDice(0, COOLDOWN_JITTER);
      }
    }

    // check encounter end
    const partyAlive = aliveOnSide('party').length > 0;
    const enemyAlive = aliveOnSide('enemy').length > 0;
    if (!partyAlive) return endRun(false);
    if (!enemyAlive) return advanceEncounter();
  }

  function performAttack(attacker: CombatUnit) {
    const targets = aliveOnSide(attacker.side === 'party' ? 'enemy' : 'party');
    if (targets.length === 0) return;
    const tgt = targets[rollDice(0, targets.length - 1)];
    const isCrit = Math.random() < attacker.crit;
    let dmg = Math.max(1, attacker.atk - Math.floor(tgt.def * DEF_REDUCTION_FACTOR));
    dmg = rollDice(Math.max(1, dmg - DAMAGE_ROLL_SPREAD), dmg + DAMAGE_ROLL_SPREAD);
    if (isCrit) dmg = Math.floor(dmg * CRIT_DAMAGE_MULTIPLIER);
    tgt.hp -= dmg;
    pushLog(
      isCrit ? 'crit' : 'damage',
      `${attacker.glyph} ${attacker.name} → ${tgt.glyph} ${tgt.name} ${isCrit ? 'CRIT ' : ''}-${dmg}`
    );
    if (tgt.hp <= 0) {
      tgt.hp = 0;
      tgt.alive = false;
      pushLog('death', `☠ ${tgt.name} falls`);
      // award loot/xp from this enemy if it's an enemy unit
      if (tgt.side === 'enemy') {
        const tmpl = findEnemyTemplate(tgt.sourceId);
        if (tmpl) {
          run.value!.rewards.xp += tmpl.xpReward;
          rollLoot(tmpl.lootTable);
        }
        // Quest kill tracking
        useQuestStore().recordKill(tgt.sourceId, run.value!.dungeonId);
      }
    }
  }

  function findEnemyTemplate(id: string): EnemyTemplate | undefined {
    for (const d of dungeons.value)
      for (const stage of d.stages)
        for (const e of stage.encounters)
          if (e.category === 'combat')
            for (const t of e.enemies)
              if (t.id === id) return t;
    return undefined;
  }

  function rollLoot(table: LootEntry[]) {
    if (!run.value) return;
    if (table.length === 0) return;
    // chance any drop at all
    if (Math.random() > LOOT_DROP_CHANCE) return;
    const pick = weightedPick(table);
    if (!pick) return;
    const baseItem = ITEM_DB[pick.itemId];
    if (!baseItem) return;
    const qty = pick.min !== undefined ? rollDice(pick.min, pick.max ?? pick.min) : 1;
    const item: Item = { ...baseItem };
    run.value.rewards.loot.push(item);
    if (qty > 1 && item.type !== 'gear') (item as any).stack = qty;
    pushLog('loot', `+ ${item.glyph} ${item.name}${qty > 1 ? ` ×${qty}` : ''}`);
  }

  function advanceEncounter() {
    if (!run.value) return;
    // Resolve the active stage from the run (not the selection, which may have changed)
    const dungeon = dungeons.value.find(d => d.id === run.value!.dungeonId);
    const stage = dungeon?.stages.find(s => s.id === run.value!.stageId);
    if (!stage) return;
    const next = run.value.encounterIndex + 1;
    if (next >= stage.encounters.length) {
      return endRun(true);
    }
    run.value.encounterIndex = next;
    // Strip dead enemies; party units persist across encounters
    run.value.units = run.value.units.filter(u => u.side === 'party');
    pushLog('system', `── Encounter ${next + 1} / ${stage.encounters.length} ──`);
    resolveEncounter(stage.encounters[next]);
  }

  function endRun(victory: boolean) {
    if (!run.value) return;
    stopTimer();
    run.value.status = victory ? 'victory' : 'defeat';
    if (victory) {
      const { dungeonId, stageId } = run.value;
      // Record stage completion
      const prev = completedStages.value[dungeonId] ?? [];
      if (!prev.includes(stageId)) {
        completedStages.value = { ...completedStages.value, [dungeonId]: [...prev, stageId] };
      }
      pushLog('system', '★ VICTORY ★');
      const xpPer = Math.ceil(run.value.rewards.xp / Math.max(1, partyStore.members.length));
      partyStore.awardXp(xpPer);
      for (const it of run.value.rewards.loot) {
        const qty = (it as any).stack ?? 1;
        invStore.add(it, qty);
      }
      const stageDiff = dungeons.value
        .find(d => d.id === dungeonId)
        ?.stages.find(s => s.id === stageId)?.difficulty ?? 1;
      gameStore.addGold(rollDice(20, 80) * stageDiff);
      pushLog('info', `Each hero gained ${xpPer} XP.`);
      // Quest progress: dungeon clear + check for newly unlocked quests
      useQuestStore().recordDungeonClear(dungeonId);
    } else {
      pushLog('system', '☠ DEFEAT — the party retreats.');
    }
  }

  function dismissResult() {
    run.value = null;
  }

  return {
    dungeons,
    selectedDungeonId, selectedStageId,
    selectedDungeon, selectedStage,
    completedStages, unlockedDungeonIds,
    run, speed, isRunning,
    selectDungeon, selectStage, setSpeed,
    startDungeon, abortDungeon, dismissResult,
    isStageUnlocked, unlockDungeon,
  };
});

