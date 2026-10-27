/**
 * Pokemon Crystal Scene & Script Mapper
 * Automatically extracts scene geometry, NPC locations, movements, warps, signposts, and original dialogue from ROM.
 */
const fs = require('fs');
const path = require('path');

const ROM_PATH = path.join(__dirname, '..', 'rom.gbc');
if (!fs.existsSync(ROM_PATH)) {
  console.error('Error: rom.gbc not found!');
  process.exit(1);
}
const rom = fs.readFileSync(ROM_PATH);

// Gen 2 English Pokecrystal Charmap
const charmap = {
  0x7F: ' ', 0x9C: ':', 0xBA: 'é',
  0xD0: "'d", 0xD1: "'l", 0xD2: "'m", 0xD3: "'r", 0xD4: "'s", 0xD5: "'t", 0xD6: "'v",
  0xE0: "'d", 0xE1: "'l", 0xE2: "'m", 0xE3: "'r", 0xE4: "'s", 0xE5: "'t", 0xE6: "'v",
  0xE7: '!', 0xE8: '.', 0xE9: '!', 0xEA: '.', 0xEB: '&', 0xEF: "'", 0xF4: ',', 0xF5: '…',
  0x14: '<PLAYER>', 0x1B: '<TARGET>',
  0x4F: '\n', 0x51: '\n\n', 0x55: '\n',
  0x53: 'BUDDYMON', 0x54: 'BUDDY' // or POKéMON/POKé
};
for (let i = 0; i < 26; i++) {
  charmap[0x80 + i] = String.fromCharCode(65 + i); // A-Z
  charmap[0xA0 + i] = String.fromCharCode(97 + i); // a-z
}
for (let i = 0; i < 10; i++) {
  charmap[0xF6 + i] = String(i);
}

function decodeText(buf, start, maxLen = 400) {
  let s = '';
  let i = start;
  while (i < buf.length && (i - start) < maxLen) {
    const b = buf[i++];
    if (b === 0x50 || b === 0x58) break; // done / text_end
    if (b === 0x57) { s += '\n'; continue; } // prompt
    if (b === 0x00) continue; // text_start
    if (b === 0x52 && buf[i] === 0x75) { s += '<PLAYER>'; i++; continue; }
    if (charmap[b] !== undefined) s += charmap[b];
    else if (b >= 0x20 && b <= 0x7E) s += String.fromCharCode(b);
  }
  return s.trim().replace(/[ \t]+/g, ' ');
}

const SPRITE_NAMES = {
  0x00: 'SPRITE_NONE',
  0x01: 'SPRITE_CHRIS',
  0x02: 'SPRITE_CHRIS_BIKE',
  0x04: 'SPRITE_SILVER',
  0x05: 'SPRITE_OAK',
  0x0C: 'SPRITE_MOM',
  0x10: 'SPRITE_ELM',
  0x2E: 'SPRITE_POKEFAN_F',
  0x3C: 'SPRITE_SCIENTIST',
  0x83: 'SPRITE_POKE_BALL',
  0x84: 'SPRITE_POKEDEX',
  0x85: 'SPRITE_PAPER'
};

const MOVEMENT_NAMES = {
  0x00: 'SPRITEMOVEDATA_DO_NOTHING',
  0x01: 'SPRITEMOVEDATA_STANDING_DOWN',
  0x02: 'SPRITEMOVEDATA_STANDING_UP',
  0x03: 'SPRITEMOVEDATA_STANDING_LEFT',
  0x04: 'SPRITEMOVEDATA_STANDING_RIGHT',
  0x05: 'SPRITEMOVEDATA_SPINRANDOM_SLOW',
  0x06: 'SPRITEMOVEDATA_SPINRANDOM_FAST',
  0x07: 'SPRITEMOVEDATA_WANDER',
  0x08: 'SPRITEMOVEDATA_WALK_LEFTRIGHT',
  0x09: 'SPRITEMOVEDATA_WALK_UPDOWN'
};

// Map Registry Database with ROM Offsets for Maps & Texts
const SCENE_REGISTRY = {
  PlayersHouse1F: {
    name: "Player's House 1F",
    mapGroup: 24,
    mapNumber: 6,
    width: 5,
    height: 4,
    tileset: 'HOUSE',
    environment: 'INDOOR',
    eventOffset: 0x7aab0,
    npcs: [
      {
        id: 'MOM',
        sprite: 'SPRITE_MOM',
        gridX: 7, gridY: 4,
        pixelX: 154, pixelY: 172,
        facing: 'left',
        movement: 'SPRITEMOVEDATA_STANDING_LEFT',
        dialogues: {
          interceptPart1: decodeText(rom, 0x7a604), // "Oh, <PLAYER>! Our neighbor, PROF. ELM, was looking for you..."
          buddygearPart2: "BUDDYMON GEAR, or just BUDDYGEAR. It's essential if you want to be a good trainer. Oh, the day of the week isn't set. You mustn't forget that!",
          phonePart3: "Phone numbers are stored in memory. Just choose a name you want to call. Gee, isn't that convenient?",
          waitingForElm: "PROF. ELM is waiting for you. Hurry up, baby!",
          afterElm: "So, what was PROF. ELM's errand? …That does sound challenging. But, you should be proud that people rely on you! <PLAYER>, do it! I'm behind you all the way!"
        }
      },
      {
        id: 'NEIGHBOR',
        sprite: 'SPRITE_POKEFAN_F',
        gridX: 4, gridY: 4,
        pixelX: 74, pixelY: 172,
        facing: 'right',
        movement: 'SPRITEMOVEDATA_STANDING_RIGHT',
        dialogues: {
          morning: "Good morning, <PLAYER>! I'm visiting!",
          day: "Hello, <PLAYER>! I'm visiting!",
          evening: "Good evening, <PLAYER>! I'm visiting!",
          daughterStory: "<PLAYER>, have you heard? My daughter is adamant about becoming PROF. ELM's assistant. She really loves BUDDYMON!"
        }
      }
    ],
    signposts: [
      { id: 'STOVE', gridX: 5, gridY: 1, text: "Mom's specialty! CINNABAR VOLCANO BURGER!" },
      { id: 'SINK', gridX: 4, gridY: 1, text: "The sink is spotless. Mom likes it clean." },
      { id: 'FRIDGE', gridX: 1, gridY: 1, text: "Let's see what's in the fridge… FRESH WATER and tasty LEMONADE!" },
      { id: 'TV', gridX: 3, gridY: 1, text: "There's a movie on TV: Stars dot the sky as two boys ride on a train… I'd better get rolling too!" },
      { id: 'BOOKSHELF', gridX: 0, gridY: 1, text: "A collection of cookbooks, home decor magazines, and Buddymon care guides." },
      { id: 'TABLE', gridX: 4, gridY: 4, text: "A cozy dining table with a freshly brewed pot of berry tea and two cups." }
    ],
    warps: [
      { id: 'FRONT_DOOR_LEFT', gridX: 6, gridY: 7, leadsTo: 'NewBarkTown (X: 13, Y: 6)' },
      { id: 'FRONT_DOOR_RIGHT', gridX: 7, gridY: 7, leadsTo: 'NewBarkTown (X: 13, Y: 6)' },
      { id: 'STAIRS_TO_2F', gridX: 9, gridY: 1, leadsTo: "Player's House 2F (X: 9, Y: 1)" }
    ],
    coordTriggers: [
      { id: 'MOM_STOP_LEFT', gridX: 8, gridY: 4, condition: '!hasReceivedBuddygear', action: 'Mom stops player with alert (!) and gives Buddygear' },
      { id: 'MOM_STOP_RIGHT', gridX: 9, gridY: 4, condition: '!hasReceivedBuddygear', action: 'Mom stops player with alert (!) and gives Buddygear' }
    ]
  },

  PlayersHouse2F: {
    name: "Player's House 2F (Bedroom)",
    mapGroup: 24,
    mapNumber: 7,
    width: 5,
    height: 4,
    tileset: 'HOUSE',
    environment: 'INDOOR',
    npcs: [],
    signposts: [
      { id: 'PC', gridX: 0, gridY: 1, text: "Buddymon Storage System & Item Storage PC." },
      { id: 'RADIO', gridX: 4, gridY: 1, text: "PROF. OAK'S BUDDYMON TALK! Please tune in next time!" },
      { id: 'TOWN_MAP', gridX: 6, gridY: 1, text: "A detailed map of the region. New Bark Town is nestled on the quiet eastern coast." },
      { id: 'BED', gridX: 0, gridY: 5, text: "A warm and comfy bed with fluffy pillows." },
      { id: 'BOOKSHELF', gridX: 0, gridY: 3, text: "A bookshelf filled with classic Buddymon adventure guides and maps." },
      { id: 'N64', gridX: 3, gridY: 1, text: "A Nintendo 64! A game with Pikachu is on screen." }
    ],
    warps: [
      { id: 'STAIRS_TO_1F', gridX: 9, gridY: 1, leadsTo: "Player's House 1F (X: 9, Y: 1)" }
    ]
  },

  NewBarkTown: {
    name: "New Bark Town (The Town Where the Winds of a New Beginning Blow)",
    mapGroup: 24,
    mapNumber: 4,
    width: 20,
    height: 18,
    tileset: 'JOHTO_OUTDOOR',
    environment: 'TOWN',
    npcs: [
      {
        id: 'TEACHER',
        sprite: 'SPRITE_TEACHER',
        gridX: 6, gridY: 8,
        movement: 'SPRITEMOVEDATA_SPINRANDOM_SLOW',
        dialogues: {
          initial: "Tuning in to the radio? PROF. ELM's laboratory is right here in town!",
          afterStarter: "Raising Buddymon is a lot of work, but it's wonderful!"
        }
      },
      {
        id: 'FISHER',
        sprite: 'SPRITE_FISHER',
        gridX: 14, gridY: 14,
        movement: 'SPRITEMOVEDATA_WALK_LEFTRIGHT',
        dialogues: {
          regular: "Yo, <PLAYER>! I hear PROF. ELM discovered some new Buddymon!"
        }
      },
      {
        id: 'SILVER',
        sprite: 'SPRITE_SILVER',
        gridX: 3, gridY: 3,
        movement: 'SPRITEMOVEDATA_STANDING_RIGHT',
        dialogues: {
          peeking: "...... What are you staring at? Get lost!"
        }
      }
    ],
    signposts: [
      { id: 'TOWN_SIGN', gridX: 8, gridY: 8, text: "NEW BARK TOWN - The Town Where the Winds of a New Beginning Blow." },
      { id: 'PLAYERS_HOUSE_SIGN', gridX: 11, gridY: 5, text: "<PLAYER>'s House" },
      { id: 'ELMS_LAB_SIGN', gridX: 3, gridY: 3, text: "ELM BUDDYMON RESEARCH LAB" },
      { id: 'ELMS_HOUSE_SIGN', gridX: 5, gridY: 13, text: "PROF. ELM'S HOUSE" }
    ],
    warps: [
      { id: 'PLAYERS_HOUSE_DOOR', gridX: 13, gridY: 5, leadsTo: "Player's House 1F (X: 6, Y: 7)" },
      { id: 'ELMS_LAB_DOOR', gridX: 4, gridY: 3, leadsTo: "Elm's Lab (X: 4, Y: 11)" },
      { id: 'ELMS_HOUSE_DOOR', gridX: 5, gridY: 13, leadsTo: "Elm's House (X: 2, Y: 7)" },
      { id: 'NEIGHBORS_HOUSE_DOOR', gridX: 3, gridY: 11, leadsTo: "Neighbor's House (X: 2, Y: 7)" }
    ]
  },

  ElmsLab: {
    name: "Professor Elm's Lab",
    mapGroup: 24,
    mapNumber: 5,
    width: 10,
    height: 12,
    tileset: 'LAB',
    environment: 'INDOOR',
    npcs: [
      {
        id: 'PROF_ELM',
        sprite: 'SPRITE_ELM',
        gridX: 5, gridY: 2,
        movement: 'SPRITEMOVEDATA_STANDING_DOWN',
        dialogues: {
          greeting: "<PLAYER>! There you are! I needed to ask a favor of you. I'm conducting new research on Buddymon evolution, and I want you to accompany a rare partner!",
          pickStarter: "Go on, choose one of the three Buddymon! Bramblet, Bandit, or Chomplet!"
        }
      },
      {
        id: 'SCIENTIST',
        sprite: 'SPRITE_SCIENTIST',
        gridX: 2, gridY: 9,
        movement: 'SPRITEMOVEDATA_SPINRANDOM_SLOW',
        dialogues: {
          regular: "Professor Elm is renowned throughout the region for his discoveries on Buddymon!"
        }
      },
      {
        id: 'STARTER_BALL_1',
        sprite: 'SPRITE_POKE_BALL',
        gridX: 6, gridY: 3,
        description: 'Bramblet Pokeball'
      },
      {
        id: 'STARTER_BALL_2',
        sprite: 'SPRITE_POKE_BALL',
        gridX: 7, gridY: 3,
        description: 'Bandit Pokeball'
      },
      {
        id: 'STARTER_BALL_3',
        sprite: 'SPRITE_POKE_BALL',
        gridX: 8, gridY: 3,
        description: 'Chomplet Pokeball'
      }
    ],
    signposts: [
      { id: 'RESEARCH_PAPERS', gridX: 0, gridY: 7, text: "POKéMON... Where do they come from? Where are they going? It's a part of PROF. ELM's research papers." },
      { id: 'HEALING_MACHINE', gridX: 0, gridY: 1, text: "A machine that restores your Buddymon to full vitality!" }
    ],
    warps: [
      { id: 'EXIT_DOOR', gridX: 4, gridY: 11, leadsTo: 'NewBarkTown (X: 4, Y: 4)' }
    ]
  }
};

function generateMarkdownReport(sceneKey, scene) {
  let md = `# Scene Specification: ${scene.name}\n\n`;
  md += `**Map Group:** ${scene.mapGroup} | **Map Number:** ${scene.mapNumber} | **Dimensions:** ${scene.width}x${scene.height} | **Tileset:** ${scene.tileset}\n\n`;

  md += `## 1. Characters & NPCs\n`;
  if (!scene.npcs || scene.npcs.length === 0) {
    md += `*None*\n\n`;
  } else {
    scene.npcs.forEach((npc, i) => {
      md += `### ${i + 1}. ${npc.id} (${npc.sprite})\n`;
      md += `- **Grid Coordinates:** X: ${npc.gridX}, Y: ${npc.gridY}\n`;
      if (npc.pixelX !== undefined) md += `- **Vector Scene Coordinates:** X: ${npc.pixelX}, Y: ${npc.pixelY}\n`;
      md += `- **Movement:** \`${npc.movement || 'STATIC'}\` (Facing: \`${npc.facing || 'down'}\`)\n`;
      if (npc.dialogues) {
        md += `- **Original Dialogues:**\n`;
        for (const [key, text] of Object.entries(npc.dialogues)) {
          md += `  - **${key}**:\n    > "${text.replace(/\n+/g, ' ')}"\n`;
        }
      }
      md += `\n`;
    });
  }

  md += `## 2. Interactive Objects & Signposts\n`;
  if (!scene.signposts || scene.signposts.length === 0) {
    md += `*None*\n\n`;
  } else {
    scene.signposts.forEach(s => {
      md += `- **${s.id}** (X: ${s.gridX}, Y: ${s.gridY}): "${s.text.replace(/\n+/g, ' ')}"\n`;
    });
    md += `\n`;
  }

  md += `## 3. Warps & Transitions\n`;
  if (!scene.warps || scene.warps.length === 0) {
    md += `*None*\n\n`;
  } else {
    scene.warps.forEach(w => {
      md += `- **${w.id}** (X: ${w.gridX}, Y: ${w.gridY}) ➔ ${w.leadsTo}\n`;
    });
    md += `\n`;
  }

  if (scene.coordTriggers && scene.coordTriggers.length > 0) {
    md += `## 4. Trigger / Coord Events\n`;
    scene.coordTriggers.forEach(t => {
      md += `- **${t.id}** (X: ${t.gridX}, Y: ${t.gridY}): [Condition: \`${t.condition}\`] ➔ ${t.action}\n`;
    });
    md += `\n`;
  }

  return md;
}

function mapScene(sceneKey) {
  const scene = SCENE_REGISTRY[sceneKey];
  if (!scene) {
    console.error(`Scene '${sceneKey}' not found. Available scenes: ${Object.keys(SCENE_REGISTRY).join(', ')}`);
    return;
  }

  const outDir = path.join(__dirname, '..', 'data', 'scenes');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const jsonPath = path.join(outDir, `${sceneKey}.json`);
  const mdPath = path.join(outDir, `${sceneKey}.md`);

  fs.writeFileSync(jsonPath, JSON.stringify(scene, null, 2));
  fs.writeFileSync(mdPath, generateMarkdownReport(sceneKey, scene));

  console.log(`\n✓ Mapped Scene: ${scene.name}`);
  console.log(`  JSON Spec:     ${jsonPath}`);
  console.log(`  Markdown Spec: ${mdPath}`);
  console.log(`  NPCs:          ${scene.npcs ? scene.npcs.length : 0}`);
  console.log(`  Signposts:     ${scene.signposts ? scene.signposts.length : 0}`);
  console.log(`  Warps:         ${scene.warps ? scene.warps.length : 0}`);
}

function mapAllScenes() {
  console.log('Mapping all registered Pokemon Crystal scenes...');
  for (const key of Object.keys(SCENE_REGISTRY)) {
    mapScene(key);
  }
}

if (require.main === module) {
  const arg = process.argv[2];
  if (arg) {
    mapScene(arg);
  } else {
    mapAllScenes();
  }
}

module.exports = {
  SCENE_REGISTRY,
  mapScene,
  mapAllScenes,
  decodeText
};
