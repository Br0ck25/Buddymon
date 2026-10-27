# Scene Specification: New Bark Town (The Town Where the Winds of a New Beginning Blow)

**Map Group:** 24 | **Map Number:** 4 | **Dimensions:** 20x18 | **Tileset:** JOHTO_OUTDOOR

## 1. Characters & NPCs
### 1. TEACHER (SPRITE_TEACHER)
- **Grid Coordinates:** X: 6, Y: 8
- **Movement:** `SPRITEMOVEDATA_SPINRANDOM_SLOW` (Facing: `down`)
- **Original Dialogues:**
  - **initial**:
    > "Tuning in to the radio? PROF. ELM's laboratory is right here in town!"
  - **afterStarter**:
    > "Raising Buddymon is a lot of work, but it's wonderful!"

### 2. FISHER (SPRITE_FISHER)
- **Grid Coordinates:** X: 14, Y: 14
- **Movement:** `SPRITEMOVEDATA_WALK_LEFTRIGHT` (Facing: `down`)
- **Original Dialogues:**
  - **regular**:
    > "Yo, <PLAYER>! I hear PROF. ELM discovered some new Buddymon!"

### 3. SILVER (SPRITE_SILVER)
- **Grid Coordinates:** X: 3, Y: 3
- **Movement:** `SPRITEMOVEDATA_STANDING_RIGHT` (Facing: `down`)
- **Original Dialogues:**
  - **peeking**:
    > "...... What are you staring at? Get lost!"

## 2. Interactive Objects & Signposts
- **TOWN_SIGN** (X: 8, Y: 8): "NEW BARK TOWN - The Town Where the Winds of a New Beginning Blow."
- **PLAYERS_HOUSE_SIGN** (X: 11, Y: 5): "<PLAYER>'s House"
- **ELMS_LAB_SIGN** (X: 3, Y: 3): "ELM BUDDYMON RESEARCH LAB"
- **ELMS_HOUSE_SIGN** (X: 5, Y: 13): "PROF. ELM'S HOUSE"

## 3. Warps & Transitions
- **PLAYERS_HOUSE_DOOR** (X: 13, Y: 5) ➔ Player's House 1F (X: 6, Y: 7)
- **ELMS_LAB_DOOR** (X: 4, Y: 3) ➔ Elm's Lab (X: 4, Y: 11)
- **ELMS_HOUSE_DOOR** (X: 5, Y: 13) ➔ Elm's House (X: 2, Y: 7)
- **NEIGHBORS_HOUSE_DOOR** (X: 3, Y: 11) ➔ Neighbor's House (X: 2, Y: 7)

