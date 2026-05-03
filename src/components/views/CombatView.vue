<script setup lang="ts">
import { useDungeonStore } from '@/stores/dungeon';
import StatBar from '@/components/ui/StatBar.vue';
import { computed, nextTick, ref, watch } from 'vue';
import type { CombatLogEntry } from '@/types/types';

const dungeon = useDungeonStore();

const run = computed(() => dungeon.run);
const party = computed(() => run.value?.units.filter(u => u.side === 'party') ?? []);
const enemies = computed(() => run.value?.units.filter(u => u.side === 'enemy') ?? []);
const log = computed<CombatLogEntry[]>(() => run.value?.log ?? []);

const logEl = ref<HTMLElement | null>(null);
watch(() => log.value.length, async () => {
  await nextTick();
  if (logEl.value) logEl.value.scrollTop = logEl.value.scrollHeight;
});

function logClass(e: CombatLogEntry) {
  return {
    'dim':   e.kind === 'info',
    'warn':  e.kind === 'damage',
    'mag':   e.kind === 'crit',
    'bad':   e.kind === 'death',
    'good':  e.kind === 'loot',
    'neon':  e.kind === 'system'
  };
}
</script>

<template>
  <div v-if="run" class="combat">
    <div class="hud">
      <span class="neon">⚔ {{ dungeon.selectedDungeon?.name }}</span>
      <span class="dim"> · encounter {{ run.encounterIndex + 1 }} / {{ dungeon.selectedStage?.encounters.length }}</span>
      <span class="status" :class="run.status">[{{ run.status }}]</span>

      <div class="speed">
        <span class="dim">spd</span>
        <button v-for="s in [0.5, 1, 2, 4]" :key="s"
                :class="{ active: dungeon.speed === s }" @click="dungeon.setSpeed(s)">
          {{ s }}×
        </button>
      </div>
      <button v-if="run.status === 'running'" class="abort" @click="dungeon.abortDungeon()">abort</button>
      <button v-else class="abort" @click="dungeon.dismissResult()">close</button>
    </div>

    <div class="arena">
      <div class="side party">
        <div v-for="u in party" :key="u.uid" class="unit" :class="{ dead: !u.alive }">
          <div class="row">
            <span class="g neon">{{ u.glyph }}</span>
            <span class="n">{{ u.name }}</span>
            <span class="dim">A{{ u.atk }} D{{ u.def }} S{{ u.spd }}</span>
          </div>
          <StatBar :value="u.hp" :max="u.maxHp" color="var(--neon-good)"
                   :label="`${Math.max(0, u.hp)} / ${u.maxHp}`" :height="10" />
          <StatBar :value="Math.max(0, 2500 - u.cooldown)" :max="2500"
                   color="var(--neon-2)" :height="3" />
        </div>
      </div>

      <div class="vs">
        <pre class="ascii">VS</pre>
      </div>

      <div class="side enemy">
        <div v-for="u in enemies" :key="u.uid" class="unit" :class="{ dead: !u.alive }">
          <div class="row">
            <span class="g bad">{{ u.glyph }}</span>
            <span class="n">{{ u.name }}</span>
            <span class="dim">A{{ u.atk }} D{{ u.def }}</span>
          </div>
          <StatBar :value="u.hp" :max="u.maxHp" color="var(--neon-danger)"
                   :label="`${Math.max(0, u.hp)} / ${u.maxHp}`" :height="10" />
          <StatBar :value="Math.max(0, 2500 - u.cooldown)" :max="2500"
                   color="var(--neon-warn)" :height="3" />
        </div>
      </div>
    </div>

    <div class="log" ref="logEl">
      <div v-for="(e, i) in log" :key="i" :class="logClass(e)">
        <span class="dim">›</span> {{ e.text }}
      </div>
    </div>

    <div v-if="run.status === 'victory' || run.status === 'defeat'" class="result">
      <pre v-if="run.status === 'victory'" class="banner good">
╔═══════════════════════╗
║      ★ VICTORY ★      ║
╚═══════════════════════╝</pre>
      <pre v-else class="banner bad">
╔═══════════════════════╗
║       ☠ DEFEAT        ║
╚═══════════════════════╝</pre>
      <div>XP gained: <span class="warn">{{ run.rewards.xp }}</span></div>
      <div>Loot: <span v-if="run.rewards.loot.length === 0" class="dim">—</span>
        <span v-for="(it, i) in run.rewards.loot" :key="i" :class="`r-${it.rarity}`">
          {{ it.glyph }} {{ it.name }}{{ i < run.rewards.loot.length - 1 ? ', ' : '' }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.combat { display: flex; flex-direction: column; gap: 8px; height: 100%; min-height: 0; }

.hud {
  display: flex; align-items: center; gap: 10px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 5px;
  font-family: 'Cinzel', Georgia, serif;
  font-size: 11px; letter-spacing: 0.1em;
}
.status { margin-left: 6px; letter-spacing: 0.2em; text-transform: uppercase; }
.status.running  { color: var(--gold); }
.status.victory  { color: var(--good); }
.status.defeat   { color: var(--crimson); }
.speed { margin-left: auto; display: flex; gap: 2px; }
.speed button { padding: 2px 6px; font-size: 10px; }
.speed button.active { color: var(--gold); border-color: var(--gold); }
.abort { color: var(--crimson); border-color: var(--crimson); }

.arena { display: grid; grid-template-columns: 1fr auto 1fr; gap: 10px; align-items: start; }
.side { display: flex; flex-direction: column; gap: 6px; }
.side.enemy { text-align: right; }
.unit {
  border: 1px solid var(--border);
  background: #100c08;
  padding: 5px 7px;
  transition: opacity .2s;
}
.unit.dead { opacity: 0.22; filter: grayscale(0.9); }
.row { display: flex; gap: 6px; align-items: center; font-size: 11px; font-family: 'Cinzel', Georgia, serif; }
.side.enemy .row { flex-direction: row-reverse; }
.g { font-size: 17px; }
.n { flex: 1; font-size: 11px; letter-spacing: 0.05em; }
.vs { display:flex; align-items:center; justify-content:center; }
.ascii { color: var(--amber); font-size: 18px; margin: 0; font-family: 'Cinzel', Georgia, serif; }

.log {
  flex: 1; min-height: 80px; max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--border);
  padding: 5px 10px;
  background: #0a0704;
  font-size: 12px;
  font-family: 'IM Fell English', Georgia, serif;
}
.log > div { padding: 1px 0; }
.log > div.dim    { color: var(--fg-dim); font-style: italic; }
.log > div.warn   { color: var(--amber); }
.log > div.mag    { color: var(--crimson); font-weight: bold; }
.log > div.bad    { color: var(--crimson); }
.log > div.good   { color: var(--good); }
.log > div.neon   { color: var(--gold); letter-spacing: 0.1em; }

.result {
  border: 1px solid var(--border-hi);
  padding: 10px;
  text-align: center;
  background: #0e0b08;
  font-family: 'Cinzel', Georgia, serif;
}
.banner { margin: 0 auto; line-height: 1.1; }
.banner.good { color: var(--good); }
.banner.bad  { color: var(--crimson); }
</style>

