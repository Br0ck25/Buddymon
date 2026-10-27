# Changelog

All notable changes to Buddymon will be documented in this file.

## [Unreleased] - 2026-10-27

### Added
- **Door Warp Collision & Exit Unblocked**:
  - Fixed 1F front door threshold in `canMoveTo1F` to allow `footY <= 345` along the door corridor (`footX: 150..250`), resolving the collision boundary that previously held the player back at `y = 280`.
  - Updated movement warp trigger in `moveHouse1FPlayer` to trigger `warpOutToTown()` when walking down through the door mat (`ny >= 284` or stepping down from `y >= 276`), enabling immediate, seamless walking outside into New Bark Town.
  - Aligned 'A' button interaction when facing down towards the door (`py >= 260, dir === 'down'`).
- **Aesthetic Refinement & De-Cartooning**:
  - Replaced bubbly children's cartoon typography (`Fredoka`, `Lilita One`) with clean, sharp, professional RPG typography (`Plus Jakarta Sans` and system gaming sans-serif).
  - Replaced oversized glowing neon-bordered oval rugs in 1F Living Room and Bedroom with elegant, grounded rectangular woven rugs featuring traditional fret stitching.
  - Removed non-authentic floating neon chevron badges hovering over NPC heads (Mom, Neighbor, Teacher, Fisher, Silver) and doorway mats, restoring the classic immersive Ken Sugimori aesthetic.
  - Refactored player sprite (Chris): removed circular spectacles and pink cheek blush circles, replacing them with authentic Ken Sugimori focused anime eyes, white highlights, backward baseball cap, and clean athletic jacket trim.
- **Sink Centering & Interaction Alignment**: Replaced left-edge bounding check with center footprint alignment (`centerX = px + 16`), allowing the player to stand dead-center in front of the sink (as well as the left and right sides) to trigger the sink dialogue ("The sink is spotless. Mom likes it clean.") without mistakenly activating the neighboring fridge.
- **HD Outdoor Scene: New Bark Town (`Art.townScene`)**:
  - Recreated New Bark Town in full HD vector art matching Pokemon Crystal's 20x18 ROM map specification.
  - **Player's House**: Red-shingled cottage with smoking chimney, 2F dormer window (player's bedroom), flower planter, welcome mat, and interactive front door that warps back into 1F.
  - **Prof. Elm's Research Lab**: Large 2-story facility with rooftop satellite weather instrument, double frosted glass entry doors, and side observation window.
  - **Silver / Rival NPC (`Art.silverSprite`)**: Standing outside Elm's Lab window with wild spiky crimson hair and high-collar dark coat, peeking suspiciously inside ("…… What are you staring at? Get lost!").
  - **Teacher NPC (`Art.teacherSprite`)**: Chibi vector sprite with glasses, teal cardigan, and burgundy skirt strolling near the town center path ("Tuning in to the radio? PROF. ELM's laboratory is right here in town!").
  - **Fisher NPC (`Art.fisherSprite`)**: Chibi vector sprite in yellow bucket hat, fishing vest, and boots overlooking the southern shoreline ("Yo, <PLAYER>! I hear PROF. ELM discovered some new Buddymon!").
  - **Signposts & Landmarks**: Carved Town Signpost ("NEW BARK TOWN - The Town Where the Winds of a New Beginning Blow."), Player's House Sign, Elm Lab Sign, Elm House Sign, and southern water shoreline with wooden pier fencing.
  - **Seamless Roundtrip Warps**: Stepping through the front doors of Player's House 1F fades out to New Bark Town; stepping into the cottage front door in New Bark Town fades seamlessly back into 1F.
- **Authentic Pokemon Crystal Intro Flow**:
  - **Step 1: Boy/Girl Selection (`gender`)**: Choosing "NEW GAME" now opens directly into the authentic Crystal gender prompt ("Are you a boy? Or are you a girl?") with full-bleed vector artwork and gold-framed dialogue.
  - **Step 2: Dark Clock Wake-up Scene (`clock`)**: Smooth fade to dark with the exact Crystal opening lines (`"......"`, `"Zzz... Hm? Wha...?"`, `"You woke me up!"`, `"Will you check the clock for me? What time is it?"`, and `"What? I overslept! Time to get moving!"`), synced directly with the player's real device clock.
  - **Step 3: Prof. Oak Intro (`prof`)**: Smooth fade into Prof. Oak (`"Hello! Sorry to keep you waiting! Welcome to the world of BUDDYMON!..."`), Bandit creature reveal, and naming prompt (`NEW NAME`, `CHRIS`/`KRIS`, `BUDDY`, `ASH`/`LEAF`).
- **Cinematic Fade Transitions (`#hdFadeOverlay`)**:
  - Implemented an HD screen transition engine (`fadeTransition(action, callback, duration = 280)`) with smooth fade-to-black and fade-in transitions across intro scenes, bedroom-to-1F stairs, and 1F-to-town warps.
- **Authentic 1F Mom Intercept & Walk-Over Cutscene**:
  - **Stairs Hallway Free Walk**: The player can now walk down the hallway beside the stairs (`y = 104..152`) without premature interruption, matching the original `PlayersHouse1F.asm` coord events at `(8, 4)` and `(9, 4)`.
  - **Mom Walk-Over Script**: When the player attempts to pass Mom towards the front door (`ny >= 164`) or table, Mom alerts with `!`, turns right, and walks across the room step-by-step from `x = 154` to `x = 284` right beside the player.
  - **Mom Return-to-Seat Script**: Once dialogue concludes and Buddygear is received, Mom turns left, walks step-by-step back across the room to her table chair at `x = 154, y = 172`, sits down, and resumes morning tea with Neighbor Pokefan F.
- **Footprint Collision Alignment**: Replaced top-of-head collision checks with bottom-of-foot footprint collision (`footX = nx + 16, footY = ny + 34`) in Bedroom (`canMoveTo`) and 1F Living Room (`canMoveTo1F`), allowing the player to walk directly up to baseboards, furniture, and appliances with zero awkward gap.
- **Tightened 1F Landing Intercept & State Reset**: Ensured Mom intercept triggers on any step off the stairs landing (`ny >= 116 || nx <= 308`) if Buddygear has not been received, turned the player to face Mom during intercept, and reset `hasReceivedBuddygear` on New Game so new playthroughs are always stopped.
- **Oak Speech Sequence Alignment**: Aligned Prof. Oak intro sequence with Pokemon Crystal so Oak introduces the world and reveals Bandit before prompting the Boy/Girl selection and Name entry.
- **Bedroom Nintendo 64**: Added the Nintendo 64 console on the bedroom desk with authentic dialogue from Pokemon Crystal ROM.
- **1F Neighbor NPC (`Art.neighborSprite`)**: Added Mom's friend / Neighbor (Pokefan F) sitting at the living room dining table opposite Mom, enjoying morning tea. Styled in custom chibi vector art with an emerald dress, cream shawl, and wavy auburn hair.
- **Dining Table Tea Scene**: Added a teapot with steam, teacups, saucers, and berry treats to the dining table.
- **Automatic Mom Intercept**: Stepping away from the stairs landing towards the room or front door (`ny >= 130 || nx <= 280`) before receiving the Buddygear automatically triggers Mom to stop the player with an alert `!` bubble, turn to face the player, and initiate the Buddygear dialogue.
- **New Bark Town Outside State**: Pre-packaged clean `initial_new_bark_town_state.json` (`MapGroup: 24, MapNumber: 4, X: 13, Y: 6`) so stepping through the 1F front doors seamlessly exits directly outside into New Bark Town.
- **Scene Mapper Tool (`scripts/crystal_scene_mapper.cjs`)**: Automated tool to parse ROM maps, extracting exact NPC positions, movement types, warps, signposts, coord events, and original text directly from the ROM (`npm run map-scene`).
- **Exact Original Dialogues**: Replaced placeholder text with exact Pokemon Crystal dialogue extracted from the ROM for Mom, Neighbor, Stove, Sink, Fridge, and TV.
