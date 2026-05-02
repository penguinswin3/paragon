import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type {
  CombatLogEntry, CombatUnit, Dungeon, DungeonRun, EnemyTemplate, Item, LootEntry
} from '@/types';
import { DUNGEON_DB, ITEM_DB } from '@/data/content';
import { clamp, rollDice, uid, weightedPick } from '@/utils/game';
import { usePartyStore } from './party';
import { useInventoryStore } from './inventory';
import { useGameStore } from './game';

const TICK_MS = 250;

export const useDungeonStore = defineStore('dungeon', () => {
  const partyStore = usePartyStore();
  const invStore = useInventoryStore();
  const gameStore = useGameStore();

  const dungeons = ref<Dungeon[]>(Object.values(DUNGEON_DB));
  const selectedId = ref<string>(dungeons.value[0]?.id ?? '');
  const run = ref<DungeonRun | null>(null);
  const speed = ref(1);

  let timer: number | null = null;

  const selected = computed(() =>
    dungeons.value.find(d => d.id === selectedId.value) ?? null
  );

  const isRunning = computed(() => run.value?.status === 'running');

  function select(id: string) {
    if (isRunning.value) return;
    selectedId.value = id;
  }

  function setSpeed(s: number) { speed.value = clamp(s, 0.5, 4); }

  function pushLog(kind: CombatLogEntry['kind'], text: string) {
    if (!run.value) return;
    const e: CombatLogEntry = { t: Date.now(), text, kind };
    run.value.log.push(e);
    if (run.value.log.length > 200) run.value.log.splice(0, run.value.log.length - 200);
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
        cooldown: 1000 + rollDice(0, 400),
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
      cooldown: 1500 + rollDice(0, 600),
      alive: true,
      sourceId: t.id
    }));
  }

  function startDungeon() {
    if (!selected.value || isRunning.value) return;
    const d = selected.value;
    const partyUnits = buildPartyUnits();
    const enemies = buildEnemyUnits(d.encounters[0].enemies);
    run.value = {
      dungeonId: d.id,
      status: 'running',
      encounterIndex: 0,
      units: [...partyUnits, ...enemies],
      log: [],
      rewards: { xp: 0, loot: [] }
    };
    pushLog('system', `▶ Entering ${d.name}`);
    if (d.encounters[0].intro) pushLog('info', d.encounters[0].intro);
    startTimer();
  }

  function abortDungeon() {
    stopTimer();
    if (run.value) {
      run.value.status = 'idle';
      pushLog('system', '✖ Run aborted');
    }
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
        u.cooldown = clamp(2500 - u.spd * 120, 600, 4000) + rollDice(0, 200);
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
    let dmg = Math.max(1, attacker.atk - Math.floor(tgt.def * 0.6));
    dmg = rollDice(Math.max(1, dmg - 1), dmg + 1);
    if (isCrit) dmg = Math.floor(dmg * 1.75);
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
      }
    }
  }

  function findEnemyTemplate(id: string): EnemyTemplate | undefined {
    for (const d of dungeons.value)
      for (const e of d.encounters)
        for (const t of e.enemies)
          if (t.id === id) return t;
    return undefined;
  }

  function rollLoot(table: LootEntry[]) {
    if (!run.value) return;
    if (table.length === 0) return;
    // 70% chance any drop at all
    if (Math.random() > 0.7) return;
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
    if (!run.value || !selected.value) return;
    const next = run.value.encounterIndex + 1;
    if (next >= selected.value.encounters.length) {
      return endRun(true);
    }
    run.value.encounterIndex = next;
    const enemies = buildEnemyUnits(selected.value.encounters[next].enemies);
    // remove dead enemies, keep party
    run.value.units = run.value.units.filter(u => u.side === 'party').concat(enemies);
    pushLog('system', `── Encounter ${next + 1} / ${selected.value.encounters.length} ──`);
    const intro = selected.value.encounters[next].intro;
    if (intro) pushLog('info', intro);
  }

  function endRun(victory: boolean) {
    if (!run.value) return;
    stopTimer();
    run.value.status = victory ? 'victory' : 'defeat';
    if (victory) {
      pushLog('system', '★ VICTORY ★');
      const xpPer = Math.ceil(run.value.rewards.xp / Math.max(1, partyStore.members.length));
      partyStore.awardXp(xpPer);
      for (const it of run.value.rewards.loot) {
        const qty = (it as any).stack ?? 1;
        invStore.add(it, qty);
      }
      gameStore.addGold(rollDice(20, 80) * (selected.value?.difficulty ?? 1));
      pushLog('info', `Each hero gained ${xpPer} XP.`);
    } else {
      pushLog('system', '☠ DEFEAT — the party retreats.');
    }
  }

  function dismissResult() {
    run.value = null;
  }

  return {
    dungeons, selectedId, selected, run, speed, isRunning,
    select, setSpeed, startDungeon, abortDungeon, dismissResult
  };
});

