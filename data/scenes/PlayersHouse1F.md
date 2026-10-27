# Scene Specification: Player's House 1F

**Map Group:** 24 | **Map Number:** 6 | **Dimensions:** 5x4 | **Tileset:** HOUSE

## 1. Characters & NPCs
### 1. MOM (SPRITE_MOM)
- **Grid Coordinates:** X: 7, Y: 4
- **Vector Scene Coordinates:** X: 154, Y: 172
- **Movement:** `SPRITEMOVEDATA_STANDING_LEFT` (Facing: `left`)
- **Original Dialogues:**
  - **interceptPart1**:
    > "Oh, <PLAYER>! Our neighbor, PROF. ELM, was looking for you. He said he wanted you to do some'r thing for him. Oh! I almost for'r got! Your BUDDYMON GEAR is back from the repair shop. Here you go! BUDDYMON GEAR, or just BUDDYGEAR. It's essential if you want to be a good trainer. Oh, the day of the week isn't set. You mustn't forget that! Is it Daylight Saving Time now'v Come home to adjust your clock for Daylight Savi"
  - **buddygearPart2**:
    > "BUDDYMON GEAR, or just BUDDYGEAR. It's essential if you want to be a good trainer. Oh, the day of the week isn't set. You mustn't forget that!"
  - **phonePart3**:
    > "Phone numbers are stored in memory. Just choose a name you want to call. Gee, isn't that convenient?"
  - **waitingForElm**:
    > "PROF. ELM is waiting for you. Hurry up, baby!"
  - **afterElm**:
    > "So, what was PROF. ELM's errand? …That does sound challenging. But, you should be proud that people rely on you! <PLAYER>, do it! I'm behind you all the way!"

### 2. NEIGHBOR (SPRITE_POKEFAN_F)
- **Grid Coordinates:** X: 4, Y: 4
- **Vector Scene Coordinates:** X: 74, Y: 172
- **Movement:** `SPRITEMOVEDATA_STANDING_RIGHT` (Facing: `right`)
- **Original Dialogues:**
  - **morning**:
    > "Good morning, <PLAYER>! I'm visiting!"
  - **day**:
    > "Hello, <PLAYER>! I'm visiting!"
  - **evening**:
    > "Good evening, <PLAYER>! I'm visiting!"
  - **daughterStory**:
    > "<PLAYER>, have you heard? My daughter is adamant about becoming PROF. ELM's assistant. She really loves BUDDYMON!"

## 2. Interactive Objects & Signposts
- **STOVE** (X: 5, Y: 1): "Mom's specialty! CINNABAR VOLCANO BURGER!"
- **SINK** (X: 4, Y: 1): "The sink is spotless. Mom likes it clean."
- **FRIDGE** (X: 1, Y: 1): "Let's see what's in the fridge… FRESH WATER and tasty LEMONADE!"
- **TV** (X: 3, Y: 1): "There's a movie on TV: Stars dot the sky as two boys ride on a train… I'd better get rolling too!"
- **BOOKSHELF** (X: 0, Y: 1): "A collection of cookbooks, home decor magazines, and Buddymon care guides."
- **TABLE** (X: 4, Y: 4): "A cozy dining table with a freshly brewed pot of berry tea and two cups."

## 3. Warps & Transitions
- **FRONT_DOOR_LEFT** (X: 6, Y: 7) ➔ NewBarkTown (X: 13, Y: 6)
- **FRONT_DOOR_RIGHT** (X: 7, Y: 7) ➔ NewBarkTown (X: 13, Y: 6)
- **STAIRS_TO_2F** (X: 9, Y: 1) ➔ Player's House 2F (X: 9, Y: 1)

## 4. Trigger / Coord Events
- **MOM_STOP_LEFT** (X: 8, Y: 4): [Condition: `!hasReceivedBuddygear`] ➔ Mom stops player with alert (!) and gives Buddygear
- **MOM_STOP_RIGHT** (X: 9, Y: 4): [Condition: `!hasReceivedBuddygear`] ➔ Mom stops player with alert (!) and gives Buddygear

