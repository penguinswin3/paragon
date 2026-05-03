import type { Quest } from '@/types/types';

// ─────────────────────────────────────────────────────────────────────────────
// QUEST_DB  — all quest definitions.
//
// Rules:
//  • Every quest needs a unique id (snake_case).
//  • All balance numbers (XP amounts, currency totals) belong here, not in
//    game-config — they are content values not engine tuning knobs.
//  • Prerequisites are checked by the quest store before showing 'available'.
//  • Use hidden: true on rewards you want concealed until turn-in.
//  • Use tags to group quests for UI filtering ('main', 'side', 'daily', …).
// ─────────────────────────────────────────────────────────────────────────────

export const QUEST_DB: Record<string, Quest> = {

  // ── Tutorial / introductory ─────────────────────────────────────────────────

  first_blood: {
    id: 'first_blood',
    title: 'First Blood',
    description: 'The crypts beneath the old city are never truly silent. Prove your party is ready.',
    flavor: 'Innkeeper Aldric leans across the bar. "Start small — the Whispering Crypt is close."',
    difficulty: 'trivial',
    sortOrder: 1,
    tags: ['main', 'tutorial'],
    objectives: [
      { kind: 'dungeon', dungeonId: 'whispering_crypt', requiredVictories: 1,
        label: 'Clear the Whispering Crypt' },
    ],
    rewards: [
      { kind: 'xp',       amount: 50 },
      { kind: 'currency', silver: 1, copper: 20 },
      { kind: 'unlock',   unlockId: 'bounty_bones', unlockType: 'quest' },
    ],
  },

  // ── Main quests ──────────────────────────────────────────────────────────────

  shadow_rising: {
    id: 'shadow_rising',
    title: 'Shadow Rising',
    description:
      'Reports reach the guild of a Wraith stronger than any seen before. Hunt it down before it grows bolder.',
    flavor: 'Guild Board — Priority Notice',
    difficulty: 'normal',
    sortOrder: 10,
    tags: ['main'],
    prerequisites: [
      { kind: 'quest',  questId: 'first_blood' },
      { kind: 'level',  minLevel: 2, scope: 'any' },
    ],
    objectives: [
      { kind: 'kill', enemyId: 'wraith', count: 3, label: 'Slay 3 Wraiths' },
    ],
    rewards: [
      { kind: 'xp',       amount: 200 },
      { kind: 'currency', gold: 1 },
      { kind: 'item',     itemId: 'shadow_dagger', hidden: true },
      { kind: 'unlock',   unlockId: 'iron_keep_siege', unlockType: 'quest', hidden: true },
    ],
  },

  iron_keep_siege: {
    id: 'iron_keep_siege',
    title: 'Siege of the Iron Keep',
    description:
      'The Ogre warlord has fortified the old keep. Clear every floor and end its reign.',
    flavor: '"Whatever guards the top — kill it twice." — Mercenary proverb',
    difficulty: 'hard',
    sortOrder: 20,
    tags: ['main'],
    prerequisites: [
      { kind: 'quest', questId: 'shadow_rising' },
      { kind: 'level', minLevel: 4, scope: 'all' },
    ],
    objectives: [
      { kind: 'dungeon', dungeonId: 'iron_keep', requiredVictories: 1,
        label: 'Conquer the Iron Keep' },
      { kind: 'kill', enemyId: 'ogre', count: 1, dungeonId: 'iron_keep',
        label: 'Defeat the Ogre Warlord' },
    ],
    rewards: [
      { kind: 'xp',       amount: 500 },
      { kind: 'currency', gold: 3 },
      { kind: 'item',     itemId: 'ember_amulet' },
      { kind: 'text',     label: 'The Iron Keep is yours. A new region has opened.',
        hidden: true },
      { kind: 'unlock',   unlockId: 'beyond_the_keep', unlockType: 'quest', hidden: true },
    ],
  },

  // ── Side quests ──────────────────────────────────────────────────────────────

  bounty_bones: {
    id: 'bounty_bones',
    title: 'Bone Collector',
    description:
      'The alchemist needs bone dust for her experiments. Collect enough from the crypts.',
    flavor: '"Fresh, if you can manage it." — Alchemist Seris',
    difficulty: 'easy',
    sortOrder: 100,
    tags: ['side', 'collection'],
    prerequisites: [
      { kind: 'quest', questId: 'first_blood' },
    ],
    objectives: [
      { kind: 'collect', itemId: 'bone_dust', count: 10, consume: true,
        label: 'Gather 10 Bone Dust' },
    ],
    rewards: [
      { kind: 'xp',       amount: 75 },
      { kind: 'item',     itemId: 'health_potion', qty: 3 },
      { kind: 'currency', silver: 2, copper: 50 },
    ],
  },

  mana_hunt: {
    id: 'mana_hunt',
    title: 'Shards of Power',
    description:
      'Mana Shards resonate with ancient magic. The wizard\'s tower will pay handsomely for a supply.',
    flavor: 'Classified notice pinned to the guild board.',
    difficulty: 'normal',
    sortOrder: 110,
    tags: ['side', 'collection'],
    prerequisites: [
      { kind: 'level', minLevel: 2, scope: 'any' },
      { kind: 'class', classIds: ['mage', 'cleric'] },
    ],
    objectives: [
      { kind: 'collect', itemId: 'mana_shard', count: 5, consume: true,
        label: 'Deliver 5 Mana Shards' },
    ],
    rewards: [
      { kind: 'xp',       amount: 120 },
      { kind: 'currency', gold: 1, silver: 2 },
      { kind: 'text',     label: 'The wizard shares a fragment of arcane lore.' },
    ],
  },

  goblin_clear: {
    id: 'goblin_clear',
    title: 'Pest Control',
    description:
      'Caravans are being harassed. Someone needs to thin out the goblin population.',
    difficulty: 'easy',
    sortOrder: 105,
    tags: ['side', 'kill'],
    objectives: [
      { kind: 'kill', enemyId: 'goblin', count: 10, label: 'Kill 10 Goblins' },
    ],
    rewards: [
      { kind: 'xp',       amount: 80 },
      { kind: 'currency', silver: 3 },
    ],
  },


  // ── Hidden / secret quest ─────────────────────────────────────────────────────

  beyond_the_keep: {
    id: 'beyond_the_keep',
    title: '???',
    description: 'Something stirs beyond the Iron Keep. The guild has no record of it.',
    flavor: 'This quest was not posted on the board.',
    difficulty: 'legendary',
    sortOrder: 999,
    tags: ['main', 'secret'],
    prerequisites: [
      { kind: 'quest', questId: 'iron_keep_siege' },
    ],
    objectives: [
      { kind: 'manual', description: 'Uncover what lies beyond the Iron Keep.' },
    ],
    rewards: [
      { kind: 'text',   label: '???', hidden: true },
      { kind: 'item',   itemId: 'ember_amulet', hidden: true },
      { kind: 'xp',     amount: 1000, hidden: true },
    ],
  },

};
