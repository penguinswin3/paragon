import type { Dungeon } from '@/types/types';
import { ENEMY_DB } from '@/data/enemies';

const CRYPT_ART = String.raw`
   _________
  /   ___   \
 |   |_| |_   |
 |   _____   |
 |__|     |__|
   |_|_|_|_|
`;

const FOREST_ART = String.raw`
     /\  /\  /\
    /  \/  \/  \
   /__/\__/\/\_/\
      ||  || ||
      ||  || ||
`;

const KEEP_ART = String.raw`
   |â€¾|_|â€¾|_|â€¾|
   |  o   o  |
   |   ___   |
   |__|   |__|
`;

export const DUNGEON_DB: Record<string, Dungeon> = {

  // Whispering Crypt
  // Stage 1 (diff 1)  Stage 2 (diff 2)
  whispering_crypt: {
    id: 'whispering_crypt',
    name: 'Whispering Crypt',
    art: CRYPT_ART,
    description: 'A catacomb network beneath the old city. The dead here are restless.',
    stages: [
      {
        id: 'outer_tombs',
        name: 'The Outer Tombs',
        description: 'The first antechambers. Restless skeletons patrol the dusty corridors.',
        difficulty: 1,
        recommendedLevel: 1,
        encounterWeights: { combat: 80, social: 10, exploration: 10, special: 0 },
        encounters: [
          {
            id: 'e1', category: 'combat',
            enemies: [ENEMY_DB.skeleton],
            intro: 'Bones rattle ahead.',
          },
          {
            id: 'e2', category: 'exploration',
            description:
              'A crumbling alcove reveals a hidden cache behind loose masonry. ' +
              'Dust coats whatever was left here long ago.',
            outcomes: [
              { id: 'o1', label: 'Salvage something useful', probability: 0.6,
                description: 'A handful of copper coins spill out.' },
              { id: 'o2', label: 'Nothing but cobwebs', probability: 0.4,
                description: 'The cache is empty â€” already looted.' },
            ],
          },
          {
            id: 'e3', category: 'combat',
            enemies: [ENEMY_DB.skeleton, ENEMY_DB.skeleton],
          },
          {
            id: 'e4', category: 'social',
            npcName: 'The Revenant',
            intro: 'A figure in tattered burial shrouds blocks the corridor, silent as stone.',
            prompt: 'We do not yield the passage to the living. Turn back, or join us.',
            choices: [
              { id: 'c1', label: 'Pay the toll (10 copper)',
                outcome: 'The revenant bows and steps aside. Unsettling, but effective.' },
              { id: 'c2', label: 'Refuse and push through',
                outcome: 'It lets out a hollow shriek and lunges.' },
            ],
          },
          {
            id: 'e5', category: 'combat',
            enemies: [ENEMY_DB.wraith],
            intro: 'A chill seeps in â€” something older than the dead stirs.',
          },
        ],
      },
      {
        id: 'inner_sanctum',
        name: 'The Inner Sanctum',
        description: 'The sealed heart of the crypt. A Wraith of unusual power holds court here.',
        difficulty: 2,
        recommendedLevel: 2,
        unlockText: 'A collapsed wall behind the outer tombs has revealed a deeper passage.',
        encounterWeights: { combat: 65, social: 5, exploration: 20, special: 10 },
        encounters: [
          {
            id: 'e1', category: 'combat',
            enemies: [ENEMY_DB.wraith, ENEMY_DB.skeleton],
            intro: 'The air grows cold. Wraith-fire flickers in the niches.',
          },
          {
            id: 'e2', category: 'exploration',
            description:
              'An offering table bears corroded relics beneath a cracked sarcophagus lid. ' +
              'Ancient script warns against disturbing the dead.',
            outcomes: [
              { id: 'o1', label: 'Take the relics', probability: 0.5,
                description: 'The relics crumble to dust, but a coin pouch beneath them survives.' },
              { id: 'o2', label: 'Heed the warning', probability: 0.3,
                description: 'Wise. The inscriptions pulse once, then go dark.' },
              { id: 'o3', label: 'Disturb the sarcophagus', probability: 0.2,
                description: 'A shrieking spirit erupts â€” but drops a shard of mana crystal as it dissipates.' },
            ],
          },
          {
            id: 'e3', category: 'combat',
            enemies: [ENEMY_DB.wraith, ENEMY_DB.wraith],
            intro: 'Two Wraiths circle from opposite ends of the chamber.',
          },
          {
            id: 'e4', category: 'special',
            description:
              'The sanctum\'s altar thrums with necrotic energy. Bones across the floor begin to stir.',
            scriptId: 'crypt_altar',
            outro: 'The altar\'s glow dims as you neutralise it. A key drops from the mechanism.',
          },
          {
            id: 'e5', category: 'combat',
            enemies: [ENEMY_DB.wraith],
            intro: 'The Crypt Lord descends from the ceiling on tattered wings.',
          },
        ],
      },
    ],
  },

  // Goblin Warren
  // Stage 1 (diff 1) Stage 2 (diff 2)
  goblin_warren: {
    id: 'goblin_warren',
    name: 'Goblin Warren',
    art: FOREST_ART,
    description: 'A sprawling tunnel system carved by generations of goblins. It goes deeper than it should.',
    stages: [
      {
        id: 'upper_tunnels',
        name: 'The Upper Tunnels',
        description: 'Shallow warrens teeming with shrieking goblins.',
        difficulty: 1,
        recommendedLevel: 1,
        encounterWeights: { combat: 60, social: 10, exploration: 30, special: 0 },
        encounters: [
          {
            id: 'e1', category: 'combat',
            enemies: [ENEMY_DB.goblin, ENEMY_DB.goblin],
            intro: 'High-pitched chatter echoes. They\'ve spotted you.',
          },
          {
            id: 'e2', category: 'exploration',
            description:
              'Piles of stolen goods from recent caravan raids line the tunnel walls â€” ' +
              'mostly junk, but goblins sometimes stumble onto valuable loot.',
            outcomes: [
              { id: 'o1', label: 'Rummage through the pile', probability: 0.5,
                description: 'A few usable items amid the trash.' },
              { id: 'o2', label: 'Spot something shiny', probability: 0.3,
                description: 'A coin pouch wedged under a rotting wheel.' },
              { id: 'o3', label: 'Just rubbish', probability: 0.2,
                description: 'Broken toys, gnawed bones, worthless trinkets.' },
            ],
          },
          {
            id: 'e3', category: 'combat',
            enemies: [ENEMY_DB.goblin, ENEMY_DB.goblin, ENEMY_DB.goblin],
          },
          {
            id: 'e4', category: 'exploration',
            description:
              'A rickety rope bridge sways over a pit lined with sharpened stakes. ' +
              'Goblin handiwork â€” crude but lethal.',
            outcomes: [
              { id: 'o1', label: 'Cross carefully', probability: 0.7,
                description: 'You make it across. The bridge groans but holds.' },
              { id: 'o2', label: 'Bridge collapses', probability: 0.3,
                description: 'Two planks snap. The party scrambles â€” minor scrapes all round.' },
            ],
          },
          {
            id: 'e5', category: 'social',
            npcName: 'Chief Grukk',
            intro: 'A particularly large goblin waddles forward, wearing a pot as a crown.',
            prompt: 'You strong! Grukk strong too! Maybe we talk, yes? You give shinies, Grukk let pass.',
            choices: [
              { id: 'c1', label: 'Bribe Grukk',
                outcome: 'Grukk beams, snatches the coins, and waves the party through.' },
              { id: 'c2', label: 'Challenge him to a duel',
                outcome: 'Grukk signals his boys. Welp.' },
              { id: 'c3', label: 'Compliment his crown',
                outcome: 'Grukk is flattered enough to let you pass for free. Somehow.' },
            ],
          },
        ],
      },
      {
        id: 'deep_warrens',
        name: 'The Deep Warrens',
        description: 'The lower tunnels, older and stranger. Something bigger lives down here.',
        difficulty: 2,
        recommendedLevel: 2,
        unlockText: 'Grukk\'s collapse has opened a trapdoor to the lower warrens.',
        encounterWeights: { combat: 65, social: 10, exploration: 15, special: 10 },
        encounters: [
          {
            id: 'e1', category: 'combat',
            enemies: [ENEMY_DB.goblin, ENEMY_DB.goblin, ENEMY_DB.goblin],
            intro: 'War-painted goblins â€” these ones look organised.',
          },
          {
            id: 'e2', category: 'exploration',
            description:
              'A collapsed passage has exposed a natural cavern. Bioluminescent fungi ' +
              'cast pale light across a subterranean pool.',
            outcomes: [
              { id: 'o1', label: 'Drink from the pool', probability: 0.4,
                description: 'The water is cold and clean. Refreshing, even.' },
              { id: 'o2', label: 'Search the cavern walls', probability: 0.4,
                description: 'Mineral deposits crumble off â€” some faintly magical.' },
              { id: 'o3', label: 'Something moves in the pool', probability: 0.2,
                description: 'A pale fish eyes you, then darts away. Harmless, but unsettling.' },
            ],
          },
          {
            id: 'e3', category: 'social',
            npcName: 'Goblin Shaman',
            intro: 'A robed goblin raises a gnarled staff. Its eyes glow faintly green.',
            prompt: 'Outsiders disturb the deep spirits. You must pass the trial â€” or burn.',
            choices: [
              { id: 'c1', label: 'Accept the trial',
                outcome: 'The shaman nods and leads you through a ritual. It is... surprisingly peaceful.' },
              { id: 'c2', label: 'Charge at the shaman',
                outcome: 'The staff crackles. This was a mistake.' },
            ],
          },
          {
            id: 'e4', category: 'combat',
            enemies: [ENEMY_DB.goblin, ENEMY_DB.goblin, ENEMY_DB.goblin],
            intro: 'The shaman\'s kin are not pleased. They pour from the tunnel walls.',
          },
          {
            id: 'e5', category: 'special',
            description:
              'A crude war-shrine adorned with stolen relics dominates the deepest chamber. ' +
              'Goblin war-drums still beat somewhere below.',
            scriptId: 'goblin_war_shrine',
            outro: 'The drums fall silent. The warren is yours.',
          },
        ],
      },
    ],
  },

  // Iron Keep
  // Stage 1 (diff 2)  Stage 2 (diff 3)  Stage 3 (diff 4)
  iron_keep: {
    id: 'iron_keep',
    name: 'Iron Keep',
    art: KEEP_ART,
    description: 'A ruined fortress of indeterminate age. Whatever broke its original garrison left marks on the stone.',
    stages: [
      {
        id: 'gatehouse',
        name: 'The Gatehouse',
        description: 'The fortified outer ring. Undead have reclaimed the walls.',
        difficulty: 2,
        recommendedLevel: 3,
        encounterWeights: { combat: 75, social: 0, exploration: 25, special: 0 },
        encounters: [
          {
            id: 'e1', category: 'combat',
            enemies: [ENEMY_DB.skeleton, ENEMY_DB.skeleton],
            intro: 'Guardians of stone and bone block the gatehouse arch.',
          },
          {
            id: 'e2', category: 'exploration',
            description:
              'The keep\'s armoury â€” ransacked long ago, but something catches the light ' +
              'beneath an overturned weapon rack.',
            outcomes: [
              { id: 'o1', label: 'Recover something useful', probability: 0.6,
                description: 'A well-preserved piece of armour among the rubble.' },
              { id: 'o2', label: 'Badly rusted, all of it', probability: 0.4,
                description: 'Nothing worth carrying. The rust alone would weigh you down.' },
            ],
          },
          {
            id: 'e3', category: 'combat',
            enemies: [ENEMY_DB.skeleton, ENEMY_DB.skeleton],
            intro: 'The portcullis raises on its own. Then two more step out.',
          },
        ],
      },
      {
        id: 'keep_proper',
        name: 'The Keep Proper',
        description: 'The main halls. Wraiths patrol where soldiers once stood.',
        difficulty: 3,
        recommendedLevel: 4,
        unlockText: 'The gatehouse is secured. The inner keep door is ajar.',
        encounterWeights: { combat: 60, social: 20, exploration: 10, special: 10 },
        encounters: [
          {
            id: 'e1', category: 'combat',
            enemies: [ENEMY_DB.wraith, ENEMY_DB.skeleton],
            intro: 'A wraith drifts from the shadows, trailing skeletal servants.',
          },
          {
            id: 'e2', category: 'social',
            npcName: 'Prisoner',
            intro: 'A shackled figure looks up weakly from a cell in the corridor wall.',
            prompt:
              'Pleaseâ€¦ I\'ve been here for weeks. I\'ll tell you what I know about the Ogre â€” ' +
              'the ward on his chamber, the cracks in his armour. Just get me out.',
            choices: [
              { id: 'c1', label: 'Free the prisoner',
                outcome: 'They whisper the Ogre\'s weakness before slipping into the dark.' },
              { id: 'c2', label: 'Leave them â€” can\'t risk it',
                outcome: 'They watch you go with hollow eyes. You press on.' },
            ],
          },
          {
            id: 'e3', category: 'combat',
            enemies: [ENEMY_DB.wraith, ENEMY_DB.wraith],
            intro: 'Two Wraiths shriek from the rafters.',
          },
        ],
      },
      {
        id: 'warlords_throne',
        name: "The Warlord's Throne",
        description: 'The keep\'s highest chamber. An Ogre warlord broods on a throne of rusted steel.',
        difficulty: 4,
        recommendedLevel: 5,
        unlockText: 'A staircase behind a Wraith\'s patrol route leads to the throne room.',
        encounterWeights: { combat: 60, social: 0, exploration: 0, special: 40 },
        encounters: [
          {
            id: 'e1', category: 'combat',
            enemies: [ENEMY_DB.ogre],
            intro: 'The ground trembles. Something enormous rounds the corner.',
          },
          {
            id: 'e2', category: 'special',
            description:
              'An ancient ward pulses at the keep\'s heart â€” a seal of crackling runes ' +
              'still active after centuries. Its purpose is unclear.',
            scriptId: 'keep_ward',
            outro: 'The runes flare once, then dim. Whatever they were holding may now stir.',
          },
        ],
      },
    ],
  },

};
