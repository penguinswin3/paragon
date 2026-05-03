// ─────────────────────────────────────────────────────────────────────────────
// game-config.ts  — Single source of truth for all balance values.
// Edit numbers here; never scatter magic numbers across stores / utils.
// ─────────────────────────────────────────────────────────────────────────────

// ── Save / Persistence ────────────────────────────────────────────────────────
/** localStorage key used for the auto-save slot. */
export const SAVE_KEY = 'paragon-save';
/** Increment when the save schema changes; triggers load-validation failure. */
export const GAME_VERSION = 2;



// ── Starting Resources ────────────────────────────────────────────────────────
export const STARTING_GOLD   = 0;
export const STARTING_SILVER = 2;
export const STARTING_COPPER = 50;

// ── Character Base-Stat Defaults ──────────────────────────────────────────────
/** Fallback values used when a character's baseStats omit a field. */
export const DEFAULT_BASE_STATS = {
  hp:   50,
  atk:   5,
  def:   2,
  spd:   5,
  crit: 0.05, // 5 %
} as const;

// ── Level-Up Scaling (applied per level above 1) ──────────────────────────────
export const LEVEL_HP_PER_LEVEL  =  8;   // flat HP added each level
export const LEVEL_ATK_PER_LEVEL =  1;   // flat ATK added each level
export const LEVEL_DEF_PER_LEVEL =  0.5; // floored — so every 2 levels

/** Multiplier applied to xpToNext on each level-up. */
export const XP_CURVE_MULTIPLIER = 1.4;

/** Base XP required to reach level 2. */
export const XP_BASE = 100;

// ── Combat Timing ─────────────────────────────────────────────────────────────
/** Simulation tick interval in milliseconds. */
export const COMBAT_TICK_MS = 250;

/** Initial cooldown for a freshly-spawned party unit (before jitter). */
export const PARTY_INITIAL_COOLDOWN     = 1000;
/** Random jitter added to initial party cooldown (0 .. value). */
export const PARTY_INITIAL_COOLDOWN_JITTER = 400;

/** Initial cooldown for a freshly-spawned enemy unit (before jitter). */
export const ENEMY_INITIAL_COOLDOWN        = 1500;
/** Random jitter added to initial enemy cooldown (0 .. value). */
export const ENEMY_INITIAL_COOLDOWN_JITTER = 600;

// ── Attack-Speed Formula: cooldown = clamp(BASE - spd * FACTOR, MIN, MAX) + jitter
export const COOLDOWN_BASE      = 2500;  // ms — zero-spd baseline
export const COOLDOWN_SPD_FACTOR = 120;  // ms reduction per point of spd
export const COOLDOWN_MIN        =  600; // ms — fastest possible swing
export const COOLDOWN_MAX        = 4000; // ms — slowest possible swing
export const COOLDOWN_JITTER     =  200; // random ms added after clamping

// ── Damage Formula ────────────────────────────────────────────────────────────
/** Fraction of defender DEF that reduces incoming damage: dmg = atk - def * FACTOR */
export const DEF_REDUCTION_FACTOR = 0.6;

/** Damage is rolled in [result-1, result+1] for variance. */
export const DAMAGE_ROLL_SPREAD = 1;

/** Crit multiplier applied to final damage roll. */
export const CRIT_DAMAGE_MULTIPLIER = 1.75;

// ── Loot ──────────────────────────────────────────────────────────────────────
/** Probability that any loot drops at all when an enemy dies. */
export const LOOT_DROP_CHANCE = 0.7; // 70 %

// ── Combat Log ────────────────────────────────────────────────────────────────
/** Maximum number of entries retained in the combat log before trimming. */
export const COMBAT_LOG_MAX = 200;

// ── Playback Speed ────────────────────────────────────────────────────────────
export const SPEED_MIN = 0.5;
export const SPEED_MAX = 4.0;
