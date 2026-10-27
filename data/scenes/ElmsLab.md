# Scene Specification: Professor Elm's Lab

**Map Group:** 24 | **Map Number:** 5 | **Dimensions:** 10x12 | **Tileset:** LAB

## 1. Characters & NPCs
### 1. PROF_ELM (SPRITE_ELM)
- **Grid Coordinates:** X: 5, Y: 2
- **Movement:** `SPRITEMOVEDATA_STANDING_DOWN` (Facing: `down`)
- **Original Dialogues:**
  - **greeting**:
    > "<PLAYER>! There you are! I needed to ask a favor of you. I'm conducting new research on Buddymon evolution, and I want you to accompany a rare partner!"
  - **pickStarter**:
    > "Go on, choose one of the three Buddymon! Bramblet, Bandit, or Chomplet!"

### 2. SCIENTIST (SPRITE_SCIENTIST)
- **Grid Coordinates:** X: 2, Y: 9
- **Movement:** `SPRITEMOVEDATA_SPINRANDOM_SLOW` (Facing: `down`)
- **Original Dialogues:**
  - **regular**:
    > "Professor Elm is renowned throughout the region for his discoveries on Buddymon!"

### 3. STARTER_BALL_1 (SPRITE_POKE_BALL)
- **Grid Coordinates:** X: 6, Y: 3
- **Movement:** `STATIC` (Facing: `down`)

### 4. STARTER_BALL_2 (SPRITE_POKE_BALL)
- **Grid Coordinates:** X: 7, Y: 3
- **Movement:** `STATIC` (Facing: `down`)

### 5. STARTER_BALL_3 (SPRITE_POKE_BALL)
- **Grid Coordinates:** X: 8, Y: 3
- **Movement:** `STATIC` (Facing: `down`)

## 2. Interactive Objects & Signposts
- **RESEARCH_PAPERS** (X: 0, Y: 7): "POKéMON... Where do they come from? Where are they going? It's a part of PROF. ELM's research papers."
- **HEALING_MACHINE** (X: 0, Y: 1): "A machine that restores your Buddymon to full vitality!"

## 3. Warps & Transitions
- **EXIT_DOOR** (X: 4, Y: 11) ➔ NewBarkTown (X: 4, Y: 4)

