<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useGameStore } from '@/stores/game';
import { SAVE_KEY, GAME_VERSION } from '@/data/game-config';
import { usePartyStore } from '@/stores/party';
import { useInventoryStore } from '@/stores/inventory';
import { useDungeonStore } from '@/stores/dungeon';
import { useQuestStore } from '@/stores/quests';

const game = useGameStore();
const party = usePartyStore();
const inventory = useInventoryStore();
const dungeon = useDungeonStore();
const quests = useQuestStore();

// ── UI state ──────────────────────────────────────────────────────────────────
const exportString = ref('');
const loadInput = ref('');
const statusMsg = ref('');
const showExport = ref(false);
const showLoad = ref(false);
const confirmReset = ref(false);
const loadError = ref('');

// ── Save migration ─────────────────────────────────────────────────────────────
type CurrentSnapshot = ReturnType<typeof buildSnapshot>;

/**
 * One entry per version N → N+1. Keys are the version being migrated FROM.
 * When GAME_VERSION is bumped, add a new entry here that transforms the old
 * shape into the new one and sets snap.version to N+1.
 *
 * Example (not yet needed):
 *   1: (s) => ({ ...s, version: 2, game: { ...s.game, newField: 'default' } }),
 */
const migrators: Record<number, (s: any) => any> = {
  // migrations go here as the schema evolves
};

/**
 * Walk a raw snapshot from its saved version up to GAME_VERSION by applying
 * each registered migrator in sequence. Throws a descriptive Error if any
 * step fails or a required migrator is missing.
 */
function migrateSnapshot(raw: any): CurrentSnapshot {
  if (!raw || typeof raw !== 'object') throw new Error('Not a valid save object.');
  let snap = raw;
  const savedVersion: number = typeof snap.version === 'number' ? snap.version : 0;
  for (let v = savedVersion; v < GAME_VERSION; v++) {
    const fn = migrators[v];
    if (!fn) throw new Error(`Save is version ${savedVersion} — no migration path to version ${GAME_VERSION}. The save may be too old.`);
    try {
      snap = fn(snap);
    } catch {
      throw new Error(`Migration from version ${v} to ${v + 1} failed. The save data may be corrupt.`);
    }
  }
  snap.version = GAME_VERSION;
  return snap as CurrentSnapshot;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildSnapshot() {
  return {
    version: GAME_VERSION,
    game: {
      view: game.view,
      resources: { ...game.resources },
    },
    party: {
      members: JSON.parse(JSON.stringify(party.members)),
      selectedId: party.selectedId,
    },
    inventory: {
      entries: JSON.parse(JSON.stringify(inventory.entries)),
    },
    dungeon: {
      selectedDungeonId: dungeon.selectedDungeonId,
      selectedStageId: dungeon.selectedStageId,
      speed: dungeon.speed,
      completedStages: JSON.parse(JSON.stringify(dungeon.completedStages)),
      unlockedDungeonIds: [...dungeon.unlockedDungeonIds],
    },
    quest: {
      unlockedQuestIds:  [...quests.unlockedQuestIds],
      completedQuestIds: [...quests.completedQuestIds],
      objectiveProgress: JSON.parse(JSON.stringify(quests.objectiveProgress)),
    },
  };
}

function applySnapshot(snap: ReturnType<typeof buildSnapshot>) {
  game.view = snap.game.view;
  game.resources = { ...snap.game.resources };
  party.members = snap.party.members;
  party.selectedId = snap.party.selectedId;
  inventory.entries = snap.inventory.entries;
  dungeon.selectedDungeonId = snap.dungeon.selectedDungeonId;
  dungeon.selectedStageId = snap.dungeon.selectedStageId;
  dungeon.speed = snap.dungeon.speed;
  dungeon.completedStages = snap.dungeon.completedStages;
  dungeon.unlockedDungeonIds = snap.dungeon.unlockedDungeonIds;
  // Active run is never persisted — clear it on load
  dungeon.run = null;
  // Quest state — optional for backwards compat with older saves
  if (snap.quest) {
    quests.unlockedQuestIds  = snap.quest.unlockedQuestIds;
    quests.completedQuestIds = snap.quest.completedQuestIds;
    quests.objectiveProgress = snap.quest.objectiveProgress;
  }
  // Restoring saved state — no new-quest badge needed
  quests.hasNewQuests = false;
}

// ── Actions ───────────────────────────────────────────────────────────────────
function saveToCache() {
  try {
    const json = JSON.stringify(buildSnapshot());
    localStorage.setItem(SAVE_KEY, json);
    flash('Saved to browser cache.');
  } catch {
    flash('Save failed — storage may be full.', true);
  }
}

function silentSave() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(buildSnapshot()));
  } catch { /* silently ignore */ }
}

function handleVisibility() {
  if (document.hidden) silentSave();
}

onMounted(() => {
  // Auto-load save from localStorage on startup
  try {
    const stored = localStorage.getItem(SAVE_KEY);
    if (stored) {
      const raw = JSON.parse(stored);
      const snap = migrateSnapshot(raw);
      applySnapshot(snap);
    }
  } catch {
    // Corrupt or outdated save — silently ignore and start fresh
    localStorage.removeItem(SAVE_KEY);
  }
  document.addEventListener('visibilitychange', handleVisibility);
  window.addEventListener('beforeunload', silentSave);
});

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', handleVisibility);
  window.removeEventListener('beforeunload', silentSave);
});

function exportSave() {
  const json = JSON.stringify(buildSnapshot());
  exportString.value = btoa(unescape(encodeURIComponent(json)));
  showExport.value = true;
  showLoad.value = false;
  confirmReset.value = false;
}

function downloadSave() {
  const json = JSON.stringify(buildSnapshot());
  const b64 = btoa(unescape(encodeURIComponent(json)));
  const blob = new Blob([b64], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `paragon-save-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  flash('Save file downloaded.');
}

function copyExport() {
  navigator.clipboard.writeText(exportString.value).then(
    () => flash('Copied to clipboard.'),
    () => flash('Copy failed — select and copy manually.', true),
  );
}

function loadSave() {
  showLoad.value = true;
  showExport.value = false;
  confirmReset.value = false;
  loadError.value = '';
}

function applyLoad() {
  loadError.value = '';
  try {
    const json = decodeURIComponent(escape(atob(loadInput.value.trim())));
    const raw = JSON.parse(json);
    const snap = migrateSnapshot(raw);
    applySnapshot(snap);
    loadInput.value = '';
    showLoad.value = false;
    flash('Save loaded successfully.');
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : 'The save string could not be read.';
  }
}

function resetSave() {
  confirmReset.value = true;
  showExport.value = false;
  showLoad.value = false;
}

function confirmDoReset() {
  localStorage.removeItem(SAVE_KEY);
  confirmReset.value = false;
  game.optionsOpen = false;
  // Force a full page reload so all stores reinitialise from defaults
  window.location.reload();
}

function flash(msg: string, isError = false) {
  statusMsg.value = (isError ? '✖ ' : '✔ ') + msg;
  setTimeout(() => { statusMsg.value = ''; }, 3000);
}
</script>

<template>
  <Transition name="fade">
    <div v-if="game.optionsOpen" class="overlay" @click.self="game.optionsOpen = false">
      <div class="panel">
        <div class="panel-header">
          <span class="title">OPTIONS</span>
          <button class="close" @click="game.optionsOpen = false">✕</button>
        </div>

        <div class="section-title">Save / Load</div>

        <div class="btn-row">
          <button class="opt-btn" @click="saveToCache">
            Save to Cache
          </button>
          <button class="opt-btn" @click="exportSave">
            Export Save (clipboard)
          </button>
          <button class="opt-btn" @click="downloadSave">
            Download Save File
          </button>
          <button class="opt-btn" @click="loadSave">
            Load Save
          </button>
        </div>

        <!-- Export area -->
        <div v-if="showExport" class="sub-panel">
          <label class="sub-label">Base-64 save string — copy and store safely:</label>
          <textarea class="save-text" readonly :value="exportString" rows="4" spellcheck="false" />
          <button class="opt-btn small" @click="copyExport">Copy to clipboard</button>
        </div>

        <!-- Load area -->
        <div v-if="showLoad" class="sub-panel">
          <label class="sub-label">Paste your save string below, then click Apply:</label>
          <textarea class="save-text" v-model="loadInput" rows="4" spellcheck="false"
                    placeholder="Paste base-64 save string here…" />
          <button class="opt-btn small accent" :disabled="!loadInput.trim()" @click="applyLoad">
            Apply Save
          </button>
          <div v-if="loadError" class="load-error">
            <span class="load-error-msg">✖ {{ loadError }}</span>
            <span class="load-error-hint">
              Your current session is untouched. Export it now to keep your progress safe.
            </span>
            <button class="opt-btn small danger" @click="downloadSave">
              Download Current Save
            </button>
          </div>
        </div>

        <div v-if="statusMsg" class="status" :class="{ err: statusMsg.startsWith('✖') }">
          {{ statusMsg }}
        </div>
        <div class="section-title" style="margin-top:4px">Danger Zone</div>
        <div class="btn-row">
          <button class="opt-btn danger" @click="resetSave">Reset Save</button>
        </div>

        <!-- Reset confirmation -->
        <div v-if="confirmReset" class="sub-panel danger-panel">
          <span class="sub-label">This will erase all progress and reload. Are you sure?</span>
          <div style="display:flex;gap:8px;margin-top:4px">
            <button class="opt-btn small accent-danger" @click="confirmDoReset">Yes, Reset</button>
            <button class="opt-btn small" @click="confirmReset = false">Cancel</button>
          </div>
        </div>      </div>
    </div>
  </Transition>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: transparent;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 8px 8px 0 0;
}

.panel {
  background: var(--panel);
  border: 1px solid var(--border-hi);
  width: 360px;
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.7);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.title {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 11px;
  letter-spacing: 0.35em;
  color: var(--gold-bright);
}
.close {
  font-size: 13px;
  color: var(--fg-dim);
  padding: 2px 6px;
  border: 1px solid var(--border);
  background: transparent;
}
.close:hover { border-color: var(--border-glow); color: var(--fg); }

.section-title {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 9px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--fg-dim);
  border-bottom: 1px solid var(--border);
  padding-bottom: 4px;
}

.btn-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.opt-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  font-family: 'Cinzel', Georgia, serif;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--fg-dim);
  cursor: pointer;
  text-align: left;
}
.opt-btn:hover:not(:disabled) { border-color: var(--border-glow); color: var(--fg); }
.opt-btn:disabled { opacity: 0.4; cursor: default; }
.opt-btn.small { font-size: 9px; padding: 5px 10px; align-self: flex-start; }
.opt-btn.accent { border-color: var(--gold); color: var(--gold); }
.opt-btn.accent:hover:not(:disabled) { background: var(--gold-tint-mid); }

.btn-glyph { font-size: 14px; font-family: serif; }

.sub-panel {
  display: flex;
  flex-direction: column;
  gap: 6px;
  border: 1px solid var(--border);
  padding: 10px;
  background: rgba(255,255,255,0.02);
}
.sub-label {
  font-size: 9px;
  letter-spacing: 0.08em;
  color: var(--fg-dim);
  font-family: 'Cinzel', Georgia, serif;
}
.save-text {
  resize: vertical;
  font-family: 'Courier New', monospace;
  font-size: 10px;
  background: var(--bg);
  color: var(--fg);
  border: 1px solid var(--border);
  padding: 6px;
  word-break: break-all;
  line-height: 1.5;
}

.status {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 9px;
  letter-spacing: 0.1em;
  color: var(--r-uncommon);
  padding: 4px 0;
}
.status.err { color: var(--r-rare); }

.opt-btn.danger { color: var(--r-rare, #c0392b); border-color: rgba(192,57,43,0.45); }
.opt-btn.danger:hover:not(:disabled) { border-color: var(--r-rare, #c0392b); background: rgba(192,57,43,0.1); }
.opt-btn.accent-danger { border-color: var(--r-rare, #c0392b); color: var(--r-rare, #c0392b); }
.opt-btn.accent-danger:hover:not(:disabled) { background: rgba(192,57,43,0.15); }

.danger-panel {
  border-color: rgba(192,57,43,0.4);
  background: rgba(192,57,43,0.05);
}

.load-error {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 4px;
  padding: 8px;
  border: 1px solid rgba(192,57,43,0.4);
  background: rgba(192,57,43,0.05);
}
.load-error-msg {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 9px;
  letter-spacing: 0.08em;
  color: var(--r-rare, #c0392b);
}
.load-error-hint {
  font-size: 9px;
  color: var(--fg-dim);
  font-style: italic;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
