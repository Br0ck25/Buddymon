# Buddymon HD — Smartphone Remaster & Cloudflare Worker

## Overview
**Buddymon** is a custom high-definition remaster with full smartphone support (optimized for Pixel 9 and modern mobile devices), featuring:
1. **HD Mode (Buddymon)**: Edge-to-edge smartphone experience with no black bars, custom intro sequence (Chomplet sharks swimming in the deep blue, Bramblet in the meadow, Bandit under the golden moon), custom Buddymon start screen and title menu, restyled Options menu, automatic device clock sync (no clock question), and Buddymon-styled dialogue boxes.
2. **Normal Mode (Pokemon Crystal)**: The original retro 160x144 Game Boy Color experience with classic pixel rendering.
3. **The 3 Buddies in Elm's Lab**:
   - **Bramblet** (Grass buddy, leaf-spined hedgehog — replaces Chikorita)
   - **Bandit** (Fire/Dark buddy, tuxedo cat — replaces Cyndaquil)
   - **Chomplet** (Water buddy, smiling shark pup — replaces Totodile)
4. **100% Offline PWA**: Installable web app with Service Worker (`sw.js`) and high-resolution icons (`icon-192.png`, `icon-512.png`).
5. **Mobile State Save & Load**: Robust IndexedDB + localStorage storage supporting quick saves and SRAM across all mobile devices.
6. **Cloudflare Worker**: Fully functional `worker.js` ready for deployment to Cloudflare with `npx wrangler deploy`.
