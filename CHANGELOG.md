# Changelog

All notable changes to Buddymon will be documented in this file.

## [Unreleased] - 2026-10-27

### Added
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
