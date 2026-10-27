const fs = require('fs');
const zlib = require('zlib');

console.log('Building Buddymon HTML & Cloudflare Worker...');

const romBytes = fs.readFileSync('rom.gbc');
// Patch ROM to replace all POKé with BUDDY (POKéMON -> BUDDYMON, POKéGEAR -> BUDDYGEAR, POKéBALL -> BUDDYBALL, POKéDEX -> BUDDYDEX, POKéMON PROF. -> BUDDYMON PROF., POKéCENTER -> BUDDYCENTER)
const buddyMacroStr = [0x81, 0x94, 0x83, 0x83, 0x98, 0x50]; // BUDDY@
for (let i = 0; i < buddyMacroStr.length; i++) {
  romBytes[0x63 + i] = buddyMacroStr[i];
}
romBytes[0x11c7] = 0x63;
romBytes[0x11c8] = 0x00;
const romGz = zlib.gzipSync(romBytes);
const romB64 = romGz.toString('base64');
const emulatorJs = fs.readFileSync('emulator.js', 'utf8');
function findImageBase64(paths) {
  for (const p of paths) {
    if (fs.existsSync(p)) return fs.readFileSync(p).toString('base64');
  }
  return '';
}

const icon192B64 = findImageBase64(['assets/images/icons/icon-192.png', 'icon-192.png']);
const icon512B64 = findImageBase64(['assets/images/icons/icon-512.png', 'icon-512.png']);
const profB64 = findImageBase64(['assets/images/trainers/professor.png', 'assets/images/trainers/oak.png', 'assets/images/professor.png', 'professor.png']);
const boyB64 = findImageBase64(['assets/images/player/boy.png', 'assets/images/player/chris.png', 'assets/images/boy.png', 'boy.png']);
const girlB64 = findImageBase64(['assets/images/player/girl.png', 'assets/images/player/kris.png', 'assets/images/girl.png', 'girl.png']);
const swJs = fs.readFileSync('sw.js', 'utf8');
const manifestJson = fs.readFileSync('manifest.json', 'utf8');
const bedroomStateRaw = fs.readFileSync('initial_bedroom_state.json');
const bedroomStateGz = zlib.gzipSync(bedroomStateRaw);
const bedroomStateB64 = bedroomStateGz.toString('base64');
const house1FStateRaw = fs.readFileSync('initial_1f_state.json');
const house1FStateGz = zlib.gzipSync(house1FStateRaw);
const house1FStateB64 = house1FStateGz.toString('base64');
const newBarkTownStateRaw = fs.readFileSync('initial_new_bark_town_state.json');
const newBarkTownStateGz = zlib.gzipSync(newBarkTownStateRaw);
const newBarkTownStateB64 = newBarkTownStateGz.toString('base64');

// Build the vector art functions
const vectorArtJs = `
const INK = "#0b1730";
const Art = {};
const Scenes = {};

Art.eye = function(cx, cy, r, iris = "#e04a4a") {
  return \`<g stroke="\${INK}" stroke-width="3">
<ellipse cx="\${cx}" cy="\${cy}" rx="\${r}" ry="\${r * 1.15}" fill="#fff"/>
<ellipse cx="\${cx}" cy="\${cy}" rx="\${r * 0.7}" ry="\${r * 0.85}" fill="\${iris}"/>
<ellipse cx="\${cx}" cy="\${cy}" rx="\${r * 0.4}" ry="\${r * 0.5}" fill="\${INK}"/>
<circle cx="\${cx + r * 0.25}" cy="\${cy - r * 0.25}" r="\${r * 0.22}" fill="#fff"/>
</g>\`;
};

Art.bandit = function() {
  return \`<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="bn-fur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3f55"/><stop offset="1" stop-color="#171a26"/></linearGradient>
<linearGradient id="bn-white" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dfe5f2"/></linearGradient>
</defs>
<ellipse cx="100" cy="186" rx="58" ry="8" fill="#000" opacity=".22"/>
<g stroke="\${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
<path fill="url(#bn-fur)" d="M136 172 C200 174 204 112 172 90 C178 126 162 146 140 148 Z"/>
<ellipse cx="72" cy="178" rx="19" ry="11" fill="url(#bn-white)"/>
<ellipse cx="128" cy="178" rx="19" ry="11" fill="url(#bn-white)"/>
<ellipse cx="100" cy="142" rx="42" ry="37" fill="url(#bn-fur)"/>
<path fill="url(#bn-white)" d="M68 128 C78 116 122 116 132 128 C138 158 62 158 68 128 Z"/>
<path fill="url(#bn-fur)" d="M44 76 L46 12 L88 54 Z"/><path fill="#e8a5b4" stroke="none" d="M54 62 L55 32 L74 54 Z"/>
<path fill="url(#bn-fur)" d="M156 76 L154 12 L112 54 Z"/><path fill="#e8a5b4" stroke="none" d="M146 62 L145 32 L126 54 Z"/>
<path fill="url(#bn-fur)" d="M40 96 C36 66 66 48 100 48 C134 48 164 66 160 96 C158 120 130 136 100 136 C70 136 42 120 40 96 Z"/>
<path fill="url(#bn-white)" d="M44 106 L34 114 L46 116 L38 126 L54 122 C60 136 80 142 100 142 C120 142 140 136 146 122 L162 126 L154 116 L166 114 L156 106 C148 98 132 100 100 106 C68 100 52 98 44 106 Z"/>
<path fill="\${INK}" stroke="none" d="M86 102 L114 102 L108 120 L100 126 L92 120 Z"/>
</g>
<path d="M100 54 L100 80" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>
<g fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"><path d="M54 112 L22 104 M54 120 L24 124 M146 112 L178 104 M146 120 L176 124"/></g>
<ellipse cx="100" cy="106" rx="7" ry="4" fill="#5a5f78"/>
\${Art.eye(74, 92, 12, "#d6b52a")}\${Art.eye(126, 92, 12, "#d6b52a")}
<path d="M58 80 Q74 78 90 86 M142 80 Q126 78 110 86" fill="none" stroke="\${INK}" stroke-width="6" stroke-linecap="round"/>
<path d="M100 126 L100 132 M90 134 Q100 140 110 134" fill="none" stroke="\${INK}" stroke-width="4" stroke-linecap="round"/>
</svg>\`;
};

Art.bramblet = function() {
  return \`<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="bb-leaf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#58d684"/><stop offset="1" stop-color="#1f8f4e"/></linearGradient>
<linearGradient id="bb-fur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd9a0"/><stop offset="1" stop-color="#eeb06b"/></linearGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="9" fill="#000" opacity=".22"/>
<g stroke="\${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
<path fill="url(#bb-leaf)" d="M22 130 C10 100 20 66 46 50 L50 78 L58 30 L82 62 L100 14 L118 62 L142 30 L150 78 L154 50 C180 66 190 100 178 130 C160 150 40 150 22 130 Z"/>
<path fill="#7be8a0" stroke-width="3" d="M58 30 L66 70 L74 56 Z M100 14 L96 62 L108 62 Z M142 30 L126 56 L134 70 Z"/>
<ellipse cx="68" cy="172" rx="20" ry="12" fill="url(#bb-fur)"/>
<ellipse cx="132" cy="172" rx="20" ry="12" fill="url(#bb-fur)"/>
<ellipse cx="100" cy="138" rx="46" ry="38" fill="url(#bb-fur)"/>
<ellipse cx="100" cy="148" rx="26" ry="22" fill="#fff4d6" stroke="none"/>
<circle cx="58" cy="76" r="14" fill="url(#bb-fur)"/><circle cx="58" cy="76" r="7" fill="#ff9aa8" stroke="none"/>
<circle cx="142" cy="76" r="14" fill="url(#bb-fur)"/><circle cx="142" cy="76" r="7" fill="#ff9aa8" stroke="none"/>
<ellipse cx="100" cy="100" rx="50" ry="42" fill="url(#bb-fur)"/>
</g>
<path d="M74 66 Q100 52 126 66" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".55"/>
\${Art.eye(78, 98, 12, "#2e9e55")}\${Art.eye(122, 98, 12, "#2e9e55")}
<ellipse cx="100" cy="114" rx="8" ry="6" fill="\${INK}"/>
<path d="M92 124 Q100 132 108 124" fill="none" stroke="\${INK}" stroke-width="4" stroke-linecap="round"/>
<circle cx="64" cy="116" r="8" fill="#ff8c9e" opacity=".7"/><circle cx="136" cy="116" r="8" fill="#ff8c9e" opacity=".7"/>
</svg>\`;
};

Art.chomplet = function() {
  return \`<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="ch-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4fb6d9"/><stop offset="1" stop-color="#2a6fa8"/></linearGradient>
<linearGradient id="ch-mouth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d63a4a"/><stop offset="1" stop-color="#8f1f36"/></linearGradient>
</defs>
<ellipse cx="100" cy="188" rx="58" ry="8" fill="#000" opacity=".22"/>
<g stroke="\${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
<path fill="url(#ch-body)" d="M104 10 C132 24 140 46 140 66 L66 66 C84 52 100 34 104 10 Z"/>
<path fill="url(#ch-body)" d="M26 150 C22 100 52 66 100 66 C148 66 178 100 174 150 C170 176 140 188 100 188 C60 188 30 176 26 150 Z"/>
<path fill="#ffe08a" stroke="none" d="M44 160 C60 178 140 178 156 160 C150 186 50 186 44 160 Z"/>
<path fill="url(#ch-body)" d="M30 140 L8 156 L30 166 Z"/><path fill="url(#ch-body)" d="M170 140 L192 156 L170 166 Z"/>
<path fill="url(#ch-mouth)" d="M44 112 C66 130 134 130 156 112 C160 146 134 172 100 172 C66 172 40 146 44 112 Z"/>
</g>
<g fill="#fff" stroke="\${INK}" stroke-width="3" stroke-linejoin="round">
<path d="M50 114 L62 132 L72 118 Z"/><path d="M76 120 L88 138 L98 124 Z"/><path d="M102 124 L112 138 L124 120 Z"/><path d="M128 118 L138 132 L150 114 Z"/>
</g>
<path d="M82 160 C90 148 110 148 118 160 C112 170 88 170 82 160 Z" fill="#ff8da1" stroke="\${INK}" stroke-width="4"/>
<path d="M66 92 L90 86" stroke="\${INK}" stroke-width="6" stroke-linecap="round"/><path d="M134 92 L110 86" stroke="\${INK}" stroke-width="6" stroke-linecap="round"/>
\${Art.eye(72, 100, 12, "#e04a4a")}\${Art.eye(128, 100, 12, "#e04a4a")}
<path d="M84 52 C92 40 98 30 100 22" fill="none" stroke="#bfeaff" stroke-width="5" stroke-linecap="round" opacity=".7"/>
</svg>\`;
};

Art.introMeadow = function() {
  let flowers = "";
  const cols = ["#ff6b5e", "#ffc93c", "#fff6dc", "#ff9aa8"];
  for (let i = 0; i < 26; i++) {
    const x = (i * 137) % 980 + 10, y = 860 + ((i * 71) % 300);
    flowers += \`<circle cx="\${x}" cy="\${y}" r="9" fill="\${cols[i % 4]}" stroke="\${INK}" stroke-width="3"/>\`;
  }
  return \`<svg class="bgsvg" viewBox="0 0 1000 1200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="morn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc8ff"/><stop offset=".7" stop-color="#d9f2ff"/><stop offset="1" stop-color="#fff2c8"/></linearGradient></defs>
<rect width="1000" height="1200" fill="url(#morn)"/>
<circle cx="780" cy="260" r="90" fill="#ffe27a" stroke="\${INK}" stroke-width="6"/>
<g class="clouds2" fill="#fff" stroke="\${INK}" stroke-width="5"><path d="M110 330 q30 -60 90 -30 q50 -50 100 10 q40 0 40 40 H110z"/><path d="M520 180 q30 -50 80 -24 q40 -40 80 8 q34 0 34 34 H520z"/></g>
<path d="M0 760 C180 680 360 740 560 690 C760 640 880 720 1000 690 L1000 1200 L0 1200Z" fill="#59c97a" stroke="\${INK}" stroke-width="6"/>
<path d="M0 900 C220 830 420 900 620 850 C800 810 920 870 1000 850 L1000 1200 L0 1200Z" fill="#3fae62" stroke="\${INK}" stroke-width="6"/>
\${flowers}
</svg>\`;
};

Art.introSea = function() {
  const kelp = [80, 210, 380, 590, 760, 910].map((x, i) =>
    \`<path class="kelp" style="animation-delay:\${i * 0.4}s" d="M\${x} 1200 C\${x - 40} 1100 \${x + 40} 1020 \${x} 930 C\${x - 40} 850 \${x + 40} 780 \${x + 6} 700" fill="none" stroke="\${i % 2 ? "#1f9b6a" : "#2fc486"}" stroke-width="22" stroke-linecap="round"/>\`).join("");
  return \`<svg class="bgsvg" viewBox="0 0 1000 1200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6fd6ff"/><stop offset=".5" stop-color="#1a8fc4"/><stop offset="1" stop-color="#0b3b78"/></linearGradient>
  <linearGradient id="ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".4"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
</defs>
<rect width="1000" height="1200" fill="url(#sea)"/>
<g class="rays" fill="url(#ray)"><path d="M150 0 L330 0 L120 900 L-60 900Z"/><path d="M520 0 L650 0 L520 900 L360 900Z"/><path d="M800 0 L930 0 L1000 900 L780 900Z"/></g>
\${kelp}
<path d="M0 1130 C200 1090 380 1150 600 1110 C800 1075 920 1130 1000 1100 L1000 1200 L0 1200Z" fill="#e9c98a" stroke="\${INK}" stroke-width="6"/>
</svg>\`;
};

Art.logo = function() {
  return \`<svg class="logo-svg" viewBox="0 0 1000 230" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3a8"/><stop offset=".5" stop-color="#ffc93c"/><stop offset="1" stop-color="#f08a14"/></linearGradient>
<clipPath id="top-half"><rect x="0" y="0" width="1000" height="112"/></clipPath>
</defs>
<g font-family="'Lilita One','Fredoka',system-ui,sans-serif" text-anchor="middle" stroke-linejoin="round">
<text x="500" y="192" font-size="172" fill="#b84a12" stroke="\${INK}" stroke-width="34" paint-order="stroke">BUDDYMON</text>
<text x="500" y="176" font-size="172" fill="url(#gold)" stroke="\${INK}" stroke-width="30" paint-order="stroke">BUDDYMON</text>
<text x="500" y="176" font-size="172" fill="#fff" opacity=".45" clip-path="url(#top-half)">BUDDYMON</text>
</g>
</svg>\`;
};

Art.sky = function() {
  return \`<svg class="sky-svg" viewBox="0 0 1000 1200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="sky-dark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070c1e"/><stop offset=".5" stop-color="#0f1938"/><stop offset="1" stop-color="#1c2b57"/></linearGradient></defs>
<rect width="1000" height="1200" fill="url(#sky-dark)"/>
<circle cx="820" cy="240" r="80" fill="#ffe27a" stroke="\${INK}" stroke-width="6"/>
<g fill="#ffe98a" opacity=".8">
<circle cx="150" cy="180" r="4"/><circle cx="280" cy="110" r="3"/><circle cx="430" cy="220" r="5"/><circle cx="610" cy="140" r="4"/><circle cx="720" cy="290" r="3"/><circle cx="210" cy="380" r="4"/><circle cx="510" cy="350" r="3"/><circle cx="880" cy="420" r="4"/>
</g>
</svg>\`;
};

Art.oakPortrait = function() {
  return \`<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
<ellipse cx="80" cy="150" rx="55" ry="12" fill="#000" opacity=".25"/>
<g stroke="\${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
  <path d="M40 148 L46 105 L114 105 L120 148 Z" fill="#b02638"/>
  <path d="M56 105 L80 148 L104 105" fill="#f8fafc"/>
  <path d="M30 148 L46 105 L58 148 Z" fill="#e2e8f0"/>
  <path d="M130 148 L114 105 L102 148 Z" fill="#e2e8f0"/>
  <circle cx="80" cy="70" r="32" fill="#fcd3b0"/>
  <path d="M44 68 C42 40 60 28 80 28 C100 28 118 40 116 68 C116 74 114 80 110 82 C106 66 100 52 80 52 C60 52 54 66 50 82 Z" fill="#94a3b8"/>
  <path d="M46 64 C42 56 46 44 54 44 C50 54 50 64 52 72 Z" fill="#64748b"/>
  <path d="M114 64 C118 56 114 44 106 44 C110 54 110 64 108 72 Z" fill="#64748b"/>
  <path d="M72 82 Q80 88 88 82" fill="none" stroke="\${INK}" stroke-width="3"/>
  <path d="M68 94 Q80 100 92 94" fill="none" stroke="\${INK}" stroke-width="4"/>
  <ellipse cx="68" cy="70" rx="3.5" ry="5" fill="\${INK}"/>
  <ellipse cx="92" cy="70" rx="3.5" ry="5" fill="\${INK}"/>
  <path d="M62 60 Q70 56 76 60" fill="none" stroke="\${INK}" stroke-width="4"/>
  <path d="M84 60 Q90 56 98 60" fill="none" stroke="\${INK}" stroke-width="4"/>
</g>
</svg>\`;
};

Art.wooperFront = function() {
  return \`<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
<ellipse cx="80" cy="148" rx="42" ry="8" fill="#000" opacity=".2"/>
<g stroke="\${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
  <path d="M30 68 L10 58 M24 78 L6 80 M30 88 L12 98" fill="none" stroke="#d96076" stroke-width="5"/>
  <path d="M130 68 L150 58 M136 78 L154 80 M130 88 L148 98" fill="none" stroke="#d96076" stroke-width="5"/>
  <ellipse cx="80" cy="116" rx="32" ry="26" fill="#6bb8e6"/>
  <ellipse cx="80" cy="74" rx="38" ry="32" fill="#6bb8e6"/>
  <ellipse cx="80" cy="118" rx="20" ry="16" fill="#3b7fa8"/>
  <ellipse cx="66" cy="70" rx="4" ry="5" fill="\${INK}"/>
  <ellipse cx="94" cy="70" rx="4" ry="5" fill="\${INK}"/>
  <circle cx="68" cy="68" r="1.5" fill="#fff"/>
  <circle cx="96" cy="68" r="1.5" fill="#fff"/>
  <path d="M68 84 Q80 94 92 84" fill="none" stroke="\${INK}" stroke-width="4"/>
  <ellipse cx="66" cy="142" rx="10" ry="6" fill="#6bb8e6"/>
  <ellipse cx="94" cy="142" rx="10" ry="6" fill="#6bb8e6"/>
</g>
</svg>\`;
};

Art.girlSprite = function girlSprite(dir, step) {
  var isWalk1 = (step === 1);
  var isWalk2 = (step === 2);

  if (dir === 'up') {
    var lFootY = isWalk1 ? 31 : 33;
    var rFootY = isWalk2 ? 31 : 33;
    return \`<svg viewBox="0 0 32 40" width="32" height="40" class="chibi-sprite">
      <ellipse cx="16" cy="38" rx="10" ry="2.5" fill="#000" opacity="0.35"/>
      <rect x="8" y="\${lFootY}" width="7" height="6" rx="1" fill="#c9893d" stroke="#8f5d21" stroke-width="0.8"/>
      <rect x="8" y="\${lFootY + 4.5}" width="7" height="1.5" fill="#181a1d"/>
      <rect x="17" y="\${rFootY}" width="7" height="6" rx="1" fill="#c9893d" stroke="#8f5d21" stroke-width="0.8"/>
      <rect x="17" y="\${rFootY + 4.5}" width="7" height="1.5" fill="#181a1d"/>
      <rect x="8" y="24" width="16" height="8" rx="2" fill="#557a50"/>
      <rect x="7" y="17" width="18" height="9" rx="3" fill="#27477d" stroke="#1c335a" stroke-width="1"/>
      <line x1="16" y1="17" x2="16" y2="26" stroke="#1c335a" stroke-width="1"/>
      <rect x="4" y="\${isWalk1 ? 19 : 17}" width="4" height="6" rx="1.5" fill="#27477d"/>
      <rect x="24" y="\${isWalk2 ? 19 : 17}" width="4" height="6" rx="1.5" fill="#27477d"/>
      <path d="M5 9 C4 3 10 1 16 1 C22 1 28 3 27 9 C28 15 28 22 24 23 C22 21 21 17 21 15 C19 17 13 17 11 15 C11 17 10 21 8 23 C4 22 4 15 5 9 Z" fill="#422211" stroke="#281408" stroke-width="1"/>
      <path d="M10 4 Q16 3 22 4" stroke="#68391b" stroke-width="1.2" fill="none"/>
      <path d="M7 12 Q9 18 8 21" stroke="#68391b" stroke-width="1.2" fill="none"/>
      <path d="M25 12 Q23 18 24 21" stroke="#68391b" stroke-width="1.2" fill="none"/>
    </svg>\`;
  }

  if (dir === 'left' || dir === 'right') {
    var isRight = (dir === 'right');
    var flip = isRight ? 'transform="scale(-1, 1) translate(-32, 0)"' : '';
    
    // Both legs move! Alternating stride
    var fLegX = isWalk1 ? 9.5 : (isWalk2 ? 14 : 12);
    var bLegX = isWalk1 ? 15.5 : (isWalk2 ? 9.5 : 14);
    var fBootX = isWalk1 ? 8.5 : (isWalk2 ? 13 : 11);
    var bBootX = isWalk1 ? 14.5 : (isWalk2 ? 8.5 : 13);
    var fSoleY = 38;
    var bSoleY = isWalk1 ? 37 : (isWalk2 ? 37 : 38);

    // Both arms move! Natural walking counter-swing
    var fArmX = isWalk1 ? 14.5 : (isWalk2 ? 10.5 : 12.5);
    var bArmX = isWalk1 ? 10.5 : (isWalk2 ? 14.5 : 12.5);
    var fArmY = (isWalk1 || isWalk2) ? 19.5 : 18.5;
    var bArmY = (isWalk1 || isWalk2) ? 19.5 : 18.5;

    return \`<svg viewBox="0 0 32 40" width="32" height="40" class="chibi-sprite">
      <!-- Ground Contact Shadow directly under flat soles -->
      <ellipse cx="16" cy="38.5" rx="10" ry="2.5" fill="#000" opacity="0.4"/>
      <g \${flip}>
        <!-- Back Arm (swings opposite) -->
        <g opacity="0.75">
          <rect x="\${bArmX}" y="\${bArmY}" width="3.8" height="6.5" rx="1.5" fill="#1c335a"/>
          <circle cx="\${bArmX + 1.9}" cy="\${bArmY + 6}" r="1.3" fill="#deb89b"/>
        </g>

        <!-- Back Leg & Boot (darker for depth) -->
        <g opacity="0.85">
          <rect x="\${bLegX}" y="26" width="5.5" height="7" rx="1" fill="#425f3e"/>
          <path d="M\${bBootX} \${bSoleY} L\${bBootX + 7.5} \${bSoleY} L\${bBootX + 7.5} \${bSoleY - 4} L\${bBootX + 4} 33 L\${bBootX + 1} 33 L\${bBootX} 35 Z" fill="#a8712e"/>
          <rect x="\${bBootX}" y="\${bSoleY - 1}" width="7.5" height="1" fill="#181a1d"/>
        </g>

        <!-- Front Leg & Boot (grounded directly under hips) -->
        <rect x="\${fLegX}" y="26" width="6" height="7" rx="1" fill="#557a50" stroke="#3b5637" stroke-width="0.6"/>
        <rect x="\${fLegX - 0.5}" y="32" width="7" height="1.8" rx="0.6" fill="#476643"/>
        <path d="M\${fBootX} \${fSoleY} L\${fBootX + 8.5} \${fSoleY} L\${fBootX + 8.5} \${fSoleY - 4.5} L\${fBootX + 5} 33 L\${fBootX + 1.5} 33 L\${fBootX} 35.5 Z" fill="#c9893d" stroke="#8f5d21" stroke-width="0.8"/>
        <rect x="\${fBootX}" y="\${fSoleY - 1.2}" width="8.5" height="1.2" fill="#181a1d"/>
        <line x1="\${fBootX + 2.5}" y1="35" x2="\${fBootX + 5.5}" y2="35" stroke="#5a3812" stroke-width="0.8"/>

        <!-- Torso & Denim Jacket -->
        <rect x="10" y="17" width="11" height="8" rx="2" fill="#27477d"/>
        <rect x="8.5" y="19" width="3" height="4" fill="#fff"/>
        <!-- Front Arm (swings opposite) -->
        <rect x="\${fArmX}" y="\${fArmY}" width="4" height="6.5" rx="1.5" fill="#27477d"/>
        <circle cx="\${fArmX + 2}" cy="\${fArmY + 6.5}" r="1.5" fill="#fce1cd"/>

        <!-- Hair & Head -->
        <path d="M15 2 C21 2 26 6 25 14 C24 20 25 24 22 23 C19 20 18 15 18 13 C18 6 17 2 15 2 Z" fill="#36190a"/>
        <circle cx="14" cy="11" r="7.5" fill="#fce1cd"/>
        <ellipse cx="10" cy="11.5" rx="2.2" ry="2.7" fill="#4d7c3b"/>
        <ellipse cx="10" cy="11.8" rx="1.5" ry="1.8" fill="#1b3314"/>
        <circle cx="9.5" cy="10.8" r="0.7" fill="#fff"/>
        <path d="M7.5 12.5 Q6.5 13.5 8 14" stroke="#a3583b" stroke-width="0.8" fill="none"/>
        <path d="M14 2 C8 2 6 6 7 10 C8 8 11 6 15 6 C17 6 18 4 14 2 Z" fill="#422211"/>
        <path d="M7 9 Q10 8 12 11 Q10 13 8 12 Z" fill="#422211"/>
        <path d="M15 2 C18 2 23 4 23 8 C20 6 17 6 14 7 Z" fill="#422211"/>
      </g>
    </svg>\`;
  }

  // Facing Down
  var lBootY = isWalk1 ? 31 : 33;
  var rBootY = isWalk2 ? 31 : 33;
  return \`<svg viewBox="0 0 32 40" width="32" height="40" class="chibi-sprite">
    <ellipse cx="16" cy="38" rx="10" ry="2.5" fill="#000" opacity="0.38"/>
    <rect x="8" y="\${lBootY}" width="7" height="6" rx="1" fill="#c9893d" stroke="#8f5d21" stroke-width="0.8"/>
    <rect x="8" y="\${lBootY + 4.5}" width="7" height="1.5" fill="#181a1d"/>
    <line x1="8" y1="\${lBootY + 2.5}" x2="15" y2="\${lBootY + 2.5}" stroke="#872c3e" stroke-width="1"/>
    <rect x="17" y="\${rBootY}" width="7" height="6" rx="1" fill="#c9893d" stroke="#8f5d21" stroke-width="0.8"/>
    <rect x="17" y="\${rBootY + 4.5}" width="7" height="1.5" fill="#181a1d"/>
    <line x1="17" y1="\${rBootY + 2.5}" x2="24" y2="\${rBootY + 2.5}" stroke="#872c3e" stroke-width="1"/>
    <rect x="8" y="24" width="16" height="8" rx="2" fill="#557a50" stroke="#3e5c3a" stroke-width="0.8"/>
    <rect x="11" y="23" width="10" height="2" fill="#5c381c"/>
    <rect x="14" y="23" width="4" height="2" fill="#d4af37"/>
    <rect x="11" y="17" width="10" height="8" fill="#ffffff"/>
    <line x1="14" y1="18" x2="14" y2="24" stroke="#e2e8f0" stroke-width="0.7"/>
    <line x1="16" y1="18" x2="16" y2="24" stroke="#e2e8f0" stroke-width="0.7"/>
    <line x1="18" y1="18" x2="18" y2="24" stroke="#e2e8f0" stroke-width="0.7"/>
    <path d="M14 17 L16 19.5 L18 17" stroke="#94a3b8" stroke-width="0.8" fill="none"/>
    <ellipse cx="16" cy="20.2" rx="1.3" ry="1.7" fill="#cbd5e1" stroke="#64748b" stroke-width="0.6"/>
    <path d="M6.5 17 L12 17 L11 25 L6.5 25 Z" fill="#27477d" stroke="#1c335a" stroke-width="0.8"/>
    <path d="M25.5 17 L20 17 L21 25 L25.5 25 Z" fill="#27477d" stroke="#1c335a" stroke-width="0.8"/>
    <circle cx="11" cy="20" r="0.7" fill="#fcd34d"/>
    <circle cx="11" cy="23" r="0.7" fill="#fcd34d"/>
    <circle cx="21" cy="20" r="0.7" fill="#fcd34d"/>
    <circle cx="21" cy="23" r="0.7" fill="#fcd34d"/>
    <rect x="4" y="\${isWalk1 ? 19 : 17}" width="4" height="5" rx="1.5" fill="#27477d"/>
    <rect x="4" y="\${isWalk1 ? 24 : 22}" width="4" height="4" rx="1.5" fill="#fce1cd"/>
    <rect x="24" y="\${isWalk2 ? 19 : 17}" width="4" height="5" rx="1.5" fill="#27477d"/>
    <rect x="24" y="\${isWalk2 ? 24 : 22}" width="4" height="4" rx="1.5" fill="#fce1cd"/>
    <path d="M4 11 C3 16 4 23 7 24 C8.5 24 9 20 8 16 Z" fill="#36190a"/>
    <path d="M28 11 C29 16 28 23 25 24 C23.5 24 23 20 24 16 Z" fill="#36190a"/>
    <circle cx="16" cy="11" r="7.8" fill="#fce1cd"/>
    <circle cx="10" cy="13.5" r="1.5" fill="#f472b6" opacity="0.45"/>
    <circle cx="22" cy="13.5" r="1.5" fill="#f472b6" opacity="0.45"/>
    <ellipse cx="12" cy="11" rx="2.5" ry="3" fill="#4d7c3b"/>
    <ellipse cx="12" cy="11.5" rx="1.8" ry="2" fill="#1b3314"/>
    <circle cx="11.3" cy="10" r="0.8" fill="#fff"/>
    <circle cx="12.8" cy="12" r="0.4" fill="#fff"/>
    <ellipse cx="20" cy="11" rx="2.5" ry="3" fill="#4d7c3b"/>
    <ellipse cx="20" cy="11.5" rx="1.8" ry="2" fill="#1b3314"/>
    <circle cx="19.3" cy="10" r="0.8" fill="#fff"/>
    <circle cx="20.8" cy="12" r="0.4" fill="#fff"/>
    <path d="M14 14.5 Q16 16 18 14.5" stroke="#a3583b" stroke-width="1.1" fill="none" stroke-linecap="round"/>
    <path d="M5 9 C6 4 10 1.5 16 1.5 C22 1.5 26 4 27 9 C25 8 22 8 20 10.5 C18 7.5 14 7.5 12 10.5 C10 8 7 8 5 9 Z" fill="#422211" stroke="#281408" stroke-width="0.8"/>
    <path d="M7.5 8 Q8.5 13 9.5 14" stroke="#422211" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    <path d="M24.5 8 Q23.5 13 22.5 14" stroke="#422211" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  </svg>\`;
};

Art.boySprite = function boySprite(dir, step) {
  var isWalk1 = (step === 1);
  var isWalk2 = (step === 2);

  if (dir === 'up') {
    var lFootY = isWalk1 ? 31 : 33;
    var rFootY = isWalk2 ? 31 : 33;
    return \`<svg viewBox="0 0 32 40" width="32" height="40" class="chibi-sprite">
      <ellipse cx="16" cy="38" rx="10" ry="2.5" fill="#000" opacity="0.35"/>
      <rect x="9" y="27" width="5" height="5" fill="#32373e"/>
      <rect x="18" y="27" width="5" height="5" fill="#32373e"/>
      <rect x="8" y="\${lFootY}" width="7" height="6" rx="1" fill="#181a1d" stroke="#0d0e10" stroke-width="0.8"/>
      <rect x="8" y="\${lFootY + 4.5}" width="7" height="1.5" fill="#0a0b0d"/>
      <rect x="17" y="\${rFootY}" width="7" height="6" rx="1" fill="#181a1d" stroke="#0d0e10" stroke-width="0.8"/>
      <rect x="17" y="\${rFootY + 4.5}" width="7" height="1.5" fill="#0a0b0d"/>
      <rect x="7" y="18" width="18" height="11" rx="3" fill="#272b30" stroke="#181a1d" stroke-width="1"/>
      <line x1="16" y1="18" x2="16" y2="29" stroke="#872c3e" stroke-width="1.6"/>
      <rect x="9" y="16" width="14" height="3" rx="1.5" fill="#1f2327"/>
      <rect x="4" y="\${isWalk1 ? 20 : 18}" width="4.5" height="8" rx="2" fill="#272b30"/>
      <rect x="23.5" y="\${isWalk2 ? 20 : 18}" width="4.5" height="8" rx="2" fill="#272b30"/>
      <path d="M8 15 Q12 18 16 16 Q20 18 24 15 L24 12 L8 12 Z" fill="#3d2110"/>
      <path d="M6 14 C5 7 10 2 16 2 C22 2 27 7 26 14 C25 15 7 15 6 14 Z" fill="#7a2536" stroke="#4f131f" stroke-width="1"/>
      <path d="M10 4 C14 2 20 2 23 5 C20 7 13 6 10 4 Z" fill="#9b3248"/>
      <path d="M6 12 Q16 15 26 12" stroke="#4f131f" stroke-width="1" fill="none"/>
    </svg>\`;
  }

  if (dir === 'left' || dir === 'right') {
    var isRight = (dir === 'right');
    var flip = isRight ? 'transform="scale(-1, 1) translate(-32, 0)"' : '';
    
    // Both legs move! Alternating stride
    var fLegX = isWalk1 ? 9.5 : (isWalk2 ? 14 : 12);
    var bLegX = isWalk1 ? 15.5 : (isWalk2 ? 9.5 : 14);
    var fBootX = isWalk1 ? 8.5 : (isWalk2 ? 13 : 11);
    var bBootX = isWalk1 ? 14.5 : (isWalk2 ? 8.5 : 13);
    var fSoleY = 38;
    var bSoleY = isWalk1 ? 37 : (isWalk2 ? 37 : 38);

    // Both arms move! Natural walking counter-swing
    var fArmX = isWalk1 ? 15 : (isWalk2 ? 11 : 13);
    var bArmX = isWalk1 ? 11 : (isWalk2 ? 15 : 13);
    var fArmY = (isWalk1 || isWalk2) ? 19.5 : 18.5;
    var bArmY = (isWalk1 || isWalk2) ? 19.5 : 18.5;

    return \`<svg viewBox="0 0 32 40" width="32" height="40" class="chibi-sprite">
      <!-- Ground Contact Shadow directly under flat soles -->
      <ellipse cx="16" cy="38.5" rx="10" ry="2.5" fill="#000" opacity="0.4"/>
      <g \${flip}>
        <!-- Back Arm (swings opposite) -->
        <g opacity="0.75">
          <rect x="\${bArmX}" y="\${bArmY}" width="4" height="7" rx="1.6" fill="#1f2327"/>
          <circle cx="\${bArmX + 2}" cy="\${bArmY + 6.5}" r="1.4" fill="#deb89b"/>
        </g>

        <!-- Back Leg & Boot (darker for depth) -->
        <g opacity="0.85">
          <rect x="\${bLegX}" y="26" width="5.5" height="7" rx="1" fill="#24282d"/>
          <path d="M\${bBootX} \${bSoleY} L\${bBootX + 7.5} \${bSoleY} L\${bBootX + 7.5} \${bSoleY - 4} L\${bBootX + 4} 33 L\${bBootX + 1} 33 L\${bBootX} 35 Z" fill="#121316"/>
          <rect x="\${bBootX}" y="\${bSoleY - 1}" width="7.5" height="1" fill="#050607"/>
        </g>

        <!-- Front Leg & Boot (grounded directly under hips) -->
        <rect x="\${fLegX}" y="26" width="6" height="7" rx="1" fill="#32373e" stroke="#1f2327" stroke-width="0.6"/>
        <rect x="\${fLegX - 0.5}" y="32" width="7" height="1.8" rx="0.6" fill="#272b30"/>
        <path d="M\${fBootX} \${fSoleY} L\${fBootX + 8.5} \${fSoleY} L\${fBootX + 8.5} \${fSoleY - 4.5} L\${fBootX + 5} 33 L\${fBootX + 1.5} 33 L\${fBootX} 35.5 Z" fill="#1a1c20" stroke="#0d0e10" stroke-width="0.7"/>
        <rect x="\${fBootX}" y="\${fSoleY - 1.2}" width="8.5" height="1.2" fill="#08090a"/>
        <line x1="\${fBootX + 2.5}" y1="35" x2="\${fBootX + 5.5}" y2="35" stroke="#872c3e" stroke-width="0.8"/>

        <!-- Torso & Jacket -->
        <rect x="11" y="18" width="10" height="9.5" rx="2.5" fill="#272b30" stroke="#181a1d" stroke-width="1"/>
        <line x1="13" y1="18" x2="13" y2="27.5" stroke="#872c3e" stroke-width="1.3"/>
        <rect x="12" y="16.5" width="8" height="2.5" rx="1" fill="#1f2327"/>

        <!-- Front Arm (swings opposite) -->
        <rect x="\${fArmX}" y="\${fArmY}" width="4.5" height="7.5" rx="1.8" fill="#272b30" stroke="#181a1d" stroke-width="0.6"/>
        <circle cx="\${fArmX + 2.2}" cy="\${fArmY + 7}" r="1.6" fill="#fce1cd"/>

        <!-- Head & Features -->
        <circle cx="16" cy="11" r="7.5" fill="#fce1cd"/>
        <path d="M9.5 12 Q8 13 9.5 13.5" stroke="#a3583b" stroke-width="0.8" fill="none"/>
        <ellipse cx="12.5" cy="11.5" rx="2.4" ry="2.8" fill="#2b1810"/>
        <circle cx="12" cy="10.8" r="0.7" fill="#fff"/>
        <ellipse cx="12.5" cy="11.5" rx="3.2" ry="3.4" fill="none" stroke="#1f2937" stroke-width="1.2"/>
        <line x1="15.7" y1="11.5" x2="20" y2="10.5" stroke="#1f2937" stroke-width="1"/>
        <path d="M8 9 Q11 6 16 7 L16 12 Q13 11 8.5 12 Z" fill="#3d2110"/>
        <polygon points="15,11 16,14 14,13" fill="#3d2110"/>
        <path d="M7 11 C6 6 10 2 17 2 C22 2 25 5 24 10 C23 13 18 13 7 11 Z" fill="#7a2536" stroke="#4f131f" stroke-width="1"/>
        <path d="M21 4 C24 6 25 10 23 13 C20 12 21 8 21 4 Z" fill="#9b3248"/>
      </g>
    </svg>\`;
  }

  // Facing Down
  var lBootY = isWalk1 ? 31 : 33;
  var rBootY = isWalk2 ? 31 : 33;
  return \`<svg viewBox="0 0 32 40" width="32" height="40" class="chibi-sprite">
    <ellipse cx="16" cy="38" rx="10" ry="2.5" fill="#000" opacity="0.38"/>
    <rect x="9" y="27" width="5" height="5" fill="#32373e"/>
    <rect x="18" y="27" width="5" height="5" fill="#32373e"/>
    <rect x="8" y="\${lBootY}" width="7" height="6" rx="1" fill="#181a1d" stroke="#0d0e10" stroke-width="0.8"/>
    <rect x="8" y="\${lBootY + 4.5}" width="7" height="1.5" fill="#0a0b0d"/>
    <line x1="8" y1="\${lBootY + 2.5}" x2="15" y2="\${lBootY + 2.5}" stroke="#872c3e" stroke-width="1.2"/>
    <rect x="17" y="\${rBootY}" width="7" height="6" rx="1" fill="#181a1d" stroke="#0d0e10" stroke-width="0.8"/>
    <rect x="17" y="\${rBootY + 4.5}" width="7" height="1.5" fill="#0a0b0d"/>
    <line x1="17" y1="\${rBootY + 2.5}" x2="24" y2="\${rBootY + 2.5}" stroke="#872c3e" stroke-width="1.2"/>
    <rect x="7" y="18" width="18" height="11" rx="3" fill="#272b30" stroke="#181a1d" stroke-width="1"/>
    <line x1="16" y1="18" x2="16" y2="29" stroke="#9b3248" stroke-width="2"/>
    <path d="M10 20 L12 23 L12 28" stroke="#872c3e" stroke-width="1" fill="none"/>
    <path d="M22 20 L20 23 L20 28" stroke="#872c3e" stroke-width="1" fill="none"/>
    <rect x="9" y="16" width="14" height="3" rx="1.5" fill="#1f2327"/>
    <rect x="4" y="\${isWalk1 ? 20 : 18}" width="4.5" height="8" rx="2" fill="#272b30"/>
    <circle cx="6.2" cy="\${isWalk1 ? 27.5 : 25.5}" r="1.6" fill="#fce1cd"/>
    <rect x="23.5" y="\${isWalk2 ? 20 : 18}" width="4.5" height="8" rx="2" fill="#272b30"/>
    <circle cx="25.8" cy="\${isWalk2 ? 27.5 : 25.5}" r="1.6" fill="#fce1cd"/>
    <circle cx="16" cy="11" r="8" fill="#fce1cd"/>
    <circle cx="9.5" cy="13.5" r="1.4" fill="#f7a898" opacity="0.6"/>
    <circle cx="22.5" cy="13.5" r="1.4" fill="#f7a898" opacity="0.6"/>
    <polygon points="7,10 9,14 8,11" fill="#3d2110"/>
    <polygon points="25,10 23,14 24,11" fill="#3d2110"/>
    <path d="M8 8 L10 11.5 L12 9 L15 12 L17 9 L20 11.5 L22 8 L24 9.5" stroke="#3d2110" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <ellipse cx="12" cy="11.5" rx="3.3" ry="3.5" fill="none" stroke="#1f2937" stroke-width="1.2"/>
    <ellipse cx="20" cy="11.5" rx="3.3" ry="3.5" fill="none" stroke="#1f2937" stroke-width="1.2"/>
    <line x1="15.3" y1="11.5" x2="16.7" y2="11.5" stroke="#1f2937" stroke-width="1.2"/>
    <ellipse cx="12" cy="11.5" rx="1.8" ry="2" fill="#2b1810"/>
    <circle cx="11.3" cy="10.8" r="0.7" fill="#fff"/>
    <ellipse cx="20" cy="11.5" rx="1.8" ry="2" fill="#2b1810"/>
    <circle cx="19.3" cy="10.8" r="0.7" fill="#fff"/>
    <path d="M14 15 Q16 16.5 18 15" stroke="#6b3620" stroke-width="1.1" fill="none" stroke-linecap="round"/>
    <path d="M6 10 C5 4 10 1 16 1 C22 1 27 4 26 10 C25 11 7 11 6 10 Z" fill="#7a2536" stroke="#4f131f" stroke-width="1"/>
    <path d="M11 3 C15 1 20 2 23 4.5 C20 6 14 5 11 3 Z" fill="#9b3248"/>
    <path d="M6 9 C11 11 21 11 26 9" stroke="#4f131f" stroke-width="1" fill="none"/>
  </svg>\`;
};

Art.momSprite = function momSprite(dir, step) {
  var isWalk1 = (step === 1);
  var isWalk2 = (step === 2);

  if (dir === 'up') {
    var lFootY = isWalk1 ? 31 : 33;
    var rFootY = isWalk2 ? 31 : 33;
    return \`<svg viewBox="0 0 32 40" width="32" height="40" class="chibi-sprite">
      <ellipse cx="16" cy="38" rx="10" ry="2.5" fill="#000" opacity="0.35"/>
      <rect x="9" y="\${lFootY}" width="6" height="5" rx="1" fill="#4a2e1b"/>
      <rect x="17" y="\${rFootY}" width="6" height="5" rx="1" fill="#4a2e1b"/>
      <path d="M7 23 L25 23 L24 33 L8 33 Z" fill="#e76f51" stroke="#b04a32" stroke-width="0.8"/>
      <path d="M9 19 L23 19 L22 28 L10 28 Z" fill="#fdfbf7" stroke="#cbd5e1" stroke-width="0.8"/>
      <line x1="10" y1="18" x2="21" y2="25" stroke="#cbd5e1" stroke-width="1.6"/>
      <line x1="22" y1="18" x2="11" y2="25" stroke="#cbd5e1" stroke-width="1.6"/>
      <ellipse cx="16" cy="25" rx="3.5" ry="1.8" fill="#fdfbf7" stroke="#cbd5e1" stroke-width="0.7"/>
      <circle cx="16" cy="25" r="1.2" fill="#e2e8f0"/>
      <rect x="4" y="\${isWalk1 ? 20 : 18}" width="4" height="7" rx="1.5" fill="#e76f51"/>
      <rect x="24" y="\${isWalk2 ? 20 : 18}" width="4" height="7" rx="1.5" fill="#e76f51"/>
      <circle cx="16" cy="11" r="8" fill="#5c3821"/>
      <ellipse cx="16" cy="4" rx="4.5" ry="3.5" fill="#4a2a14" stroke="#361a08" stroke-width="0.8"/>
      <rect x="13" y="6" width="6" height="2" rx="1" fill="#f43f5e"/>
      <path d="M8 12 Q16 16 24 12" stroke="#361a08" stroke-width="1.2" fill="none"/>
    </svg>\`;
  }

  if (dir === 'left' || dir === 'right') {
    var isRight = (dir === 'right');
    var flip = isRight ? 'transform="scale(-1, 1) translate(-32, 0)"' : '';
    var fLegX = isWalk1 ? 10 : (isWalk2 ? 14 : 12);
    var bLegX = isWalk1 ? 15 : (isWalk2 ? 9 : 13);
    var fFootX = isWalk1 ? 9 : (isWalk2 ? 13 : 11);
    var bFootX = isWalk1 ? 14 : (isWalk2 ? 8 : 12);
    var fSoleY = 38;
    var bSoleY = isWalk1 ? 37 : (isWalk2 ? 37 : 38);

    var fArmX = isWalk1 ? 15 : (isWalk2 ? 11 : 13);
    var bArmX = isWalk1 ? 11 : (isWalk2 ? 15 : 13);
    var fArmY = (isWalk1 || isWalk2) ? 19.5 : 18.5;
    var bArmY = (isWalk1 || isWalk2) ? 19.5 : 18.5;

    return \`<svg viewBox="0 0 32 40" width="32" height="40" class="chibi-sprite">
      <ellipse cx="16" cy="38.5" rx="10" ry="2.5" fill="#000" opacity="0.35"/>
      <g \${flip}>
        <g opacity="0.8">
          <rect x="\${bArmX}" y="\${bArmY}" width="3.8" height="6.5" rx="1.5" fill="#b04a32"/>
          <circle cx="\${bArmX + 1.9}" cy="\${bArmY + 6}" r="1.3" fill="#fce1cd"/>
        </g>
        <g opacity="0.85">
          <rect x="\${bFootX}" y="\${bSoleY - 4}" width="6" height="4" rx="1" fill="#4a2e1b"/>
        </g>
        <path d="M11 18 L21 18 L23 33 L10 33 Z" fill="#e76f51" stroke="#b04a32" stroke-width="0.8"/>
        <path d="M9.5 20 L18 20 L19 32 L8.5 32 Z" fill="#fdfbf7" stroke="#cbd5e1" stroke-width="0.8"/>
        <rect x="\${fFootX}" y="\${fSoleY - 4.5}" width="6.5" height="4.5" rx="1.2" fill="#5c3821" stroke="#361a08" stroke-width="0.6"/>
        <rect x="\${fArmX}" y="\${fArmY}" width="4" height="6.8" rx="1.6" fill="#e76f51" stroke="#b04a32" stroke-width="0.6"/>
        <circle cx="\${fArmX + 2}" cy="\${fArmY + 6.5}" r="1.5" fill="#fce1cd"/>
        <circle cx="15" cy="11" r="7.5" fill="#fce1cd"/>
        <ellipse cx="20" cy="6" rx="3.5" ry="3" fill="#4a2a14"/>
        <path d="M12 2 C18 2 23 5 22 13 C21 18 19 20 17 17 C16 12 17 6 12 2 Z" fill="#5c3821"/>
        <ellipse cx="11.5" cy="11" rx="2" ry="2.5" fill="#361a08"/>
        <circle cx="11" cy="10.3" r="0.7" fill="#fff"/>
        <circle cx="9.5" cy="13.5" r="1.3" fill="#f472b6" opacity="0.5"/>
        <path d="M9 13.5 Q11 15 13 13.5" stroke="#a3583b" stroke-width="0.9" fill="none"/>
        <path d="M13 2 C9 2 7 6 8 10 C9 8 11 6 14 6 Z" fill="#5c3821"/>
      </g>
    </svg>\`;
  }

  // Facing Down
  var lFootY = isWalk1 ? 31 : 33;
  var rFootY = isWalk2 ? 31 : 33;
  return \`<svg viewBox="0 0 32 40" width="32" height="40" class="chibi-sprite">
    <ellipse cx="16" cy="38" rx="10" ry="2.5" fill="#000" opacity="0.38"/>
    <rect x="9" y="\${lFootY}" width="6" height="5" rx="1.2" fill="#5c3821" stroke="#361a08" stroke-width="0.7"/>
    <rect x="17" y="\${rFootY}" width="6" height="5" rx="1.2" fill="#5c3821" stroke="#361a08" stroke-width="0.7"/>
    <path d="M7 23 L25 23 L24 33 L8 33 Z" fill="#e76f51" stroke="#b04a32" stroke-width="0.8"/>
    <path d="M10 17 L22 17 L21 31 L11 31 Z" fill="#fdfbf7" stroke="#cbd5e1" stroke-width="0.8"/>
    <rect x="13" y="24" width="6" height="4.5" rx="1" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="0.6"/>
    <circle cx="16" cy="24" r="0.9" fill="#f43f5e"/>
    <path d="M12 17 L16 19.5 L20 17" stroke="#b04a32" stroke-width="0.9" fill="none"/>
    <rect x="4" y="\${isWalk1 ? 19 : 17}" width="4" height="6" rx="1.5" fill="#e76f51"/>
    <circle cx="6" cy="\${isWalk1 ? 25 : 23}" r="1.5" fill="#fce1cd"/>
    <rect x="24" y="\${isWalk2 ? 19 : 17}" width="4" height="6" rx="1.5" fill="#e76f51"/>
    <circle cx="26" cy="\${isWalk2 ? 25 : 23}" r="1.5" fill="#fce1cd"/>
    <circle cx="16" cy="11" r="7.8" fill="#fce1cd"/>
    <circle cx="10" cy="13.5" r="1.5" fill="#f472b6" opacity="0.5"/>
    <circle cx="22" cy="13.5" r="1.5" fill="#f472b6" opacity="0.5"/>
    <ellipse cx="12" cy="11.5" rx="2" ry="2.5" fill="#361a08"/>
    <circle cx="11.3" cy="10.8" r="0.7" fill="#fff"/>
    <ellipse cx="20" cy="11.5" rx="2" ry="2.5" fill="#361a08"/>
    <circle cx="19.3" cy="10.8" r="0.7" fill="#fff"/>
    <path d="M14 14.5 Q16 16.5 18 14.5" stroke="#a3583b" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    <ellipse cx="16" cy="4" rx="4.5" ry="3.5" fill="#4a2a14"/>
    <path d="M6 10 C5 4 10 1.5 16 1.5 C22 1.5 27 4 26 10 C24 8 21 8 19 11 C17 8 14 8 12 11 C10 8 7 8 6 10 Z" fill="#5c3821" stroke="#361a08" stroke-width="0.8"/>
    <path d="M7 8 Q8 13 9 14" stroke="#5c3821" stroke-width="2" stroke-linecap="round" fill="none"/>
    <path d="M25 8 Q24 13 23 14" stroke="#5c3821" stroke-width="2" stroke-linecap="round" fill="none"/>
  </svg>\`;
};

Art.neighborSprite = function neighborSprite(dir, step) {
  var isWalk1 = (step === 1);
  var isWalk2 = (step === 2);

  if (dir === 'up') {
    var lFootY = isWalk1 ? 31 : 33;
    var rFootY = isWalk2 ? 31 : 33;
    return \`<svg viewBox="0 0 32 40" width="32" height="40" class="chibi-sprite">
      <ellipse cx="16" cy="38" rx="10" ry="2.5" fill="#000" opacity="0.35"/>
      <rect x="9" y="\${lFootY}" width="6" height="5" rx="1.2" fill="#1e1b4b" stroke="#0f172a" stroke-width="0.7"/>
      <rect x="17" y="\${rFootY}" width="6" height="5" rx="1.2" fill="#1e1b4b" stroke="#0f172a" stroke-width="0.7"/>
      <!-- Emerald Dress -->
      <path d="M7 23 L25 23 L24 33 L8 33 Z" fill="#059669" stroke="#047857" stroke-width="0.8"/>
      <!-- Cream Shawl -->
      <path d="M9 19 L23 19 L22 28 L10 28 Z" fill="#fef3c7" stroke="#fde68a" stroke-width="0.8"/>
      <circle cx="16" cy="24" r="1.5" fill="#d97706"/>
      <rect x="4" y="\${isWalk1 ? 20 : 18}" width="4" height="7" rx="1.5" fill="#059669"/>
      <rect x="24" y="\${isWalk2 ? 20 : 18}" width="4" height="7" rx="1.5" fill="#059669"/>
      <!-- Auburn Hair Back with Waves -->
      <circle cx="16" cy="11" r="8.5" fill="#9a3412"/>
      <path d="M7 11 Q16 19 25 11 Q26 18 22 21 Q16 23 10 21 Q6 18 7 11 Z" fill="#7c2d12"/>
      <ellipse cx="16" cy="4" rx="4.5" ry="3.5" fill="#b45309" stroke="#7c2d12" stroke-width="0.8"/>
    </svg>\`;
  }

  if (dir === 'left' || dir === 'right') {
    var isRight = (dir === 'right');
    var flip = isRight ? 'transform="scale(-1, 1) translate(-32, 0)"' : '';
    var fFootX = isWalk1 ? 9 : (isWalk2 ? 13 : 11);
    var bFootX = isWalk1 ? 14 : (isWalk2 ? 8 : 12);
    var fSoleY = 38;
    var bSoleY = isWalk1 ? 37 : (isWalk2 ? 37 : 38);

    var fArmX = isWalk1 ? 15 : (isWalk2 ? 11 : 13);
    var bArmX = isWalk1 ? 11 : (isWalk2 ? 15 : 13);
    var fArmY = (isWalk1 || isWalk2) ? 19.5 : 18.5;
    var bArmY = (isWalk1 || isWalk2) ? 19.5 : 18.5;

    return \`<svg viewBox="0 0 32 40" width="32" height="40" class="chibi-sprite">
      <ellipse cx="16" cy="38.5" rx="10" ry="2.5" fill="#000" opacity="0.35"/>
      <g \${flip}>
        <g opacity="0.8">
          <rect x="\${bArmX}" y="\${bArmY}" width="3.8" height="6.5" rx="1.5" fill="#047857"/>
          <circle cx="\${bArmX + 1.9}" cy="\${bArmY + 6}" r="1.3" fill="#fce1cd"/>
        </g>
        <g opacity="0.85">
          <rect x="\${bFootX}" y="\${bSoleY - 4}" width="6" height="4" rx="1" fill="#1e1b4b"/>
        </g>
        <!-- Dress and Shawl -->
        <path d="M11 18 L21 18 L23 33 L10 33 Z" fill="#059669" stroke="#047857" stroke-width="0.8"/>
        <path d="M9.5 20 L18 20 L19 30 L8.5 30 Z" fill="#fef3c7" stroke="#fde68a" stroke-width="0.8"/>
        <rect x="\${fFootX}" y="\${fSoleY - 4.5}" width="6.5" height="4.5" rx="1.2" fill="#1e1b4b" stroke="#0f172a" stroke-width="0.6"/>
        <rect x="\${fArmX}" y="\${fArmY}" width="4" height="6.8" rx="1.6" fill="#059669" stroke="#047857" stroke-width="0.6"/>
        <circle cx="\${fArmX + 2}" cy="\${fArmY + 6.5}" r="1.5" fill="#fce1cd"/>
        <!-- Head & Face -->
        <circle cx="15" cy="11" r="7.5" fill="#fce1cd"/>
        <!-- Auburn Wavy Hair -->
        <path d="M12 2 C18 2 23 5 23 13 C23 18 20 22 17 21 C15 17 18 10 12 4 Z" fill="#9a3412"/>
        <path d="M14 2 C10 2 7 6 8 11 C9 8 11 6 15 6 Z" fill="#7c2d12"/>
        <ellipse cx="20" cy="8" rx="3" ry="4" fill="#b45309"/>
        <!-- Eye & Blush -->
        <ellipse cx="11.5" cy="11" rx="2" ry="2.5" fill="#1e293b"/>
        <circle cx="11" cy="10.3" r="0.7" fill="#fff"/>
        <circle cx="9.5" cy="13.5" r="1.3" fill="#f472b6" opacity="0.5"/>
        <path d="M9 13.5 Q11 15 13 13.5" stroke="#a3583b" stroke-width="0.9" fill="none"/>
      </g>
    </svg>\`;
  }

  // Facing Down
  var lFootY = isWalk1 ? 31 : 33;
  var rFootY = isWalk2 ? 31 : 33;
  return \`<svg viewBox="0 0 32 40" width="32" height="40" class="chibi-sprite">
    <ellipse cx="16" cy="38" rx="10" ry="2.5" fill="#000" opacity="0.38"/>
    <rect x="9" y="\${lFootY}" width="6" height="5" rx="1.2" fill="#1e1b4b" stroke="#0f172a" stroke-width="0.7"/>
    <rect x="17" y="\${rFootY}" width="6" height="5" rx="1.2" fill="#1e1b4b" stroke="#0f172a" stroke-width="0.7"/>
    <!-- Emerald Dress -->
    <path d="M7 23 L25 23 L24 33 L8 33 Z" fill="#059669" stroke="#047857" stroke-width="0.8"/>
    <!-- Cream Shawl -->
    <path d="M10 17 L22 17 L21 29 L11 29 Z" fill="#fef3c7" stroke="#fde68a" stroke-width="0.8"/>
    <circle cx="16" cy="23" r="1.5" fill="#d97706"/>
    <!-- Arms -->
    <rect x="4" y="\${isWalk1 ? 19 : 17}" width="4" height="7.5" rx="1.6" fill="#059669" stroke="#047857" stroke-width="0.7"/>
    <circle cx="6" cy="\${isWalk1 ? 27 : 25}" r="1.5" fill="#fce1cd"/>
    <rect x="24" y="\${isWalk2 ? 19 : 17}" width="4" height="7.5" rx="1.6" fill="#059669" stroke="#047857" stroke-width="0.7"/>
    <circle cx="26" cy="\${isWalk2 ? 27 : 25}" r="1.5" fill="#fce1cd"/>
    <!-- Head -->
    <circle cx="16" cy="11" r="7.5" fill="#fce1cd"/>
    <!-- Auburn Wavy Hair -->
    <path d="M8 8 C8 3 12 1 16 1 C20 1 24 3 24 8 C24 13 25 18 24 21 C22 19 23 12 21 10 C18 9 14 9 11 10 C9 12 10 19 8 21 C7 18 8 13 8 8 Z" fill="#9a3412"/>
    <path d="M11 2 Q16 0 21 2 Q16 4 11 2 Z" fill="#b45309"/>
    <!-- Eyes -->
    <ellipse cx="12" cy="11.5" rx="2" ry="2.5" fill="#1e293b"/>
    <circle cx="11.5" cy="10.8" r="0.7" fill="#fff"/>
    <ellipse cx="20" cy="11.5" rx="2" ry="2.5" fill="#1e293b"/>
    <circle cx="19.5" cy="10.8" r="0.7" fill="#fff"/>
    <!-- Blush -->
    <circle cx="9.5" cy="14" r="1.5" fill="#f472b6" opacity="0.5"/>
    <circle cx="22.5" cy="14" r="1.5" fill="#f472b6" opacity="0.5"/>
    <!-- Smile -->
    <path d="M14 14 Q16 16 18 14" stroke="#a3583b" stroke-width="1" fill="none" stroke-linecap="round"/>
  </svg>\`;
};

Art.bedroomScene = function(gender, player, aspect) {
  var px = player.x;
  var py = player.y;
  var spriteSvg = (gender === 'GIRL') ? Art.girlSprite(player.dir, player.step) : Art.boySprite(player.dir, player.step);

  if (!aspect || aspect <= 0) aspect = 1.25;
  // Dynamic camera viewport tracking player sprite across bedroom
  var camW = 260;
  var camH = camW * aspect;
  if (camH > 340) {
    camH = 340;
    camW = Math.min(400, camH / aspect);
  }
  if (camW > 400) {
    camW = 400;
    camH = Math.min(340, camW * aspect);
  }

  var cx = px + 12;
  var cy = py + 16;
  var camX = Math.max(0, Math.min(400 - camW, cx - camW / 2));
  var camY = Math.max(0, Math.min(340 - camH, cy - camH / 2));

  return \`<svg class="bedroom-svg" viewBox="\${camX.toFixed(1)} \${camY.toFixed(1)} \${camW.toFixed(1)} \${camH.toFixed(1)}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="floorWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b47846"/><stop offset="100%" stop-color="#8a5327"/></linearGradient>
      <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3b5c"/><stop offset="70%" stop-color="#1d2a45"/><stop offset="100%" stop-color="#141d30"/></linearGradient>
      <linearGradient id="sunbeam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff8db" stop-opacity="0.35"/><stop offset="100%" stop-color="#ffd166" stop-opacity="0.0"/></linearGradient>
      <radialGradient id="rugGrad" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#2a4365"/><stop offset="80%" stop-color="#1e2d42"/><stop offset="100%" stop-color="#d4af37"/></radialGradient>
      <linearGradient id="bedQuilt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b82f6"/><stop offset="100%" stop-color="#1d4ed8"/></linearGradient>
      <linearGradient id="pcGlow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#67e8f9"/><stop offset="100%" stop-color="#0284c7"/></linearGradient>
    </defs>

    <!-- Wall & Baseboard -->
    <rect x="0" y="0" width="400" height="84" fill="url(#wallGrad)"/>
    <rect x="0" y="0" width="400" height="8" fill="#101726"/>
    <rect x="0" y="78" width="400" height="6" fill="#523218" stroke="#36200e" stroke-width="1"/>

    <!-- Floor -->
    <rect x="0" y="84" width="400" height="256" fill="url(#floorWood)"/>

    <!-- Wood floor planks -->
    <g stroke="#71421e" stroke-width="1.5" opacity="0.65">
      <line x1="0" y1="116" x2="400" y2="116"/><line x1="0" y1="148" x2="400" y2="148"/><line x1="0" y1="180" x2="400" y2="180"/><line x1="0" y1="212" x2="400" y2="212"/><line x1="0" y1="244" x2="400" y2="244"/><line x1="0" y1="276" x2="400" y2="276"/><line x1="0" y1="308" x2="400" y2="308"/>
      <line x1="60" y1="84" x2="60" y2="116"/><line x1="180" y1="84" x2="180" y2="116"/><line x1="310" y1="84" x2="310" y2="116"/>
      <line x1="110" y1="116" x2="110" y2="148"/><line x1="240" y1="116" x2="240" y2="148"/><line x1="370" y1="116" x2="370" y2="148"/>
      <line x1="50" y1="148" x2="50" y2="180"/><line x1="160" y1="148" x2="160" y2="180"/><line x1="290" y1="148" x2="290" y2="180"/>
      <line x1="90" y1="180" x2="90" y2="212"/><line x1="220" y1="180" x2="220" y2="212"/><line x1="340" y1="180" x2="340" y2="212"/>
      <line x1="40" y1="212" x2="40" y2="244"/><line x1="150" y1="212" x2="150" y2="244"/><line x1="270" y1="212" x2="270" y2="244"/>
      <line x1="80" y1="244" x2="80" y2="276"/><line x1="200" y1="244" x2="200" y2="276"/><line x1="320" y1="244" x2="320" y2="276"/>
      <line x1="50" y1="276" x2="50" y2="308"/><line x1="170" y1="276" x2="170" y2="308"/><line x1="290" y1="276" x2="290" y2="308"/>
    </g>

    <!-- Sunny Window -->
    <g transform="translate(140, 10)">
      <rect x="0" y="0" width="84" height="60" rx="4" fill="#5c381c" stroke="#2b1809" stroke-width="2"/>
      <rect x="6" y="6" width="72" height="48" rx="2" fill="#70c0e8"/>
      <circle cx="58" cy="18" r="12" fill="#fff5cc"/>
      <path d="M12 36 q10 -10 24 -4 q12 -12 26 2 q8 0 8 8 H12 z" fill="#ffffff" opacity="0.85"/>
      <line x1="42" y1="6" x2="42" y2="54" stroke="#4a2a12" stroke-width="2.5"/>
      <line x1="6" y1="30" x2="78" y2="30" stroke="#4a2a12" stroke-width="2.5"/>
      <path d="M2 4 C14 16 10 42 2 56 L2 4 Z" fill="#e29578" stroke="#873e23" stroke-width="1.5"/>
      <path d="M82 4 C70 16 74 42 82 56 L82 4 Z" fill="#e29578" stroke="#873e23" stroke-width="1.5"/>
      <rect x="-4" y="0" width="92" height="4" rx="2" fill="#d4af37"/>
    </g>
    <polygon points="146,70 224,70 310,260 170,260" fill="url(#sunbeam)"/>

    <!-- Wall Town Map -->
    <g transform="translate(38, 16)">
      <rect x="0" y="0" width="46" height="34" rx="2" fill="#f4ebd0" stroke="#5c381c" stroke-width="3"/>
      <path d="M6 14 Q14 8 22 14 T38 12 Q36 24 24 26 T8 22 Z" fill="#8cb369"/>
      <path d="M14 16 L22 18 L28 14" stroke="#d90429" stroke-width="1.2" stroke-dasharray="2,1" fill="none"/>
      <circle cx="14" cy="16" r="1.5" fill="#d90429"/><circle cx="28" cy="14" r="1.5" fill="#d90429"/>
    </g>

    <!-- Wall Poster -->
    <g transform="translate(254, 16)">
      <rect x="0" y="0" width="32" height="40" rx="2" fill="#fff" stroke="#1d2a45" stroke-width="2"/>
      <rect x="3" y="3" width="26" height="26" fill="#fefae0"/>
      <circle cx="16" cy="16" r="9" fill="#3a3f55"/>
      <circle cx="13" cy="15" r="2" fill="#d6b52a"/><circle cx="19" cy="15" r="2" fill="#d6b52a"/>
      <path d="M14 20 Q16 23 18 20" stroke="#fff" stroke-width="1" fill="none"/>
      <rect x="6" y="32" width="20" height="3" rx="1" fill="#c1121f"/>
    </g>

    <!-- Stairs Leading Down to 1F -->
    <g id="obj-stairs" transform="translate(320, 16)" style="cursor:pointer;">
      <rect x="2" y="10" width="66" height="76" rx="3" fill="#000" opacity="0.45"/>
      <rect x="2" y="6" width="66" height="80" rx="4" fill="#141d30" stroke="#2a3b5c" stroke-width="2"/>
      <rect x="6" y="12" width="58" height="10" fill="#3b200d" stroke="#1f1006" stroke-width="1"/>
      <rect x="6" y="22" width="58" height="10" fill="#522d13" stroke="#1f1006" stroke-width="1"/>
      <rect x="6" y="32" width="58" height="10" fill="#693a18" stroke="#1f1006" stroke-width="1"/>
      <rect x="6" y="42" width="58" height="10" fill="#80471e" stroke="#1f1006" stroke-width="1"/>
      <rect x="6" y="52" width="58" height="10" fill="#965423" stroke="#1f1006" stroke-width="1"/>
      <rect x="6" y="62" width="58" height="12" fill="#ad6028" stroke="#1f1006" stroke-width="1"/>
      <line x1="6" y1="10" x2="6" y2="76" stroke="#d4af37" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="6" cy="10" r="2" fill="#fcd34d"/>
      <circle cx="6" cy="43" r="2" fill="#fcd34d"/>
      <circle cx="6" cy="76" r="2" fill="#fcd34d"/>
      <rect x="14" y="70" width="44" height="14" rx="3" fill="#101726" stroke="#d4af37" stroke-width="1.2"/>
      <text x="36" y="80" font-family="sans-serif" font-size="8" font-weight="800" fill="#f59e0b" text-anchor="middle">▼ 1F</text>
    </g>

    <!-- Center Rug -->
    <ellipse cx="200" cy="220" rx="80" ry="42" fill="url(#rugGrad)" stroke="#d4af37" stroke-width="2.5"/>
    <ellipse cx="200" cy="220" rx="66" ry="32" fill="none" stroke="#60a5fa" stroke-width="1.5" stroke-dasharray="6,4"/>

    <!-- Bed (Top-Left) -->
    <g id="obj-bed" transform="translate(12, 60)" style="cursor:pointer;">
      <rect x="4" y="8" width="76" height="74" rx="6" fill="#000" opacity="0.32"/>
      <rect x="6" y="6" width="72" height="72" rx="4" fill="#523218" stroke="#2b1809" stroke-width="2"/>
      <rect x="6" y="2" width="72" height="14" rx="3" fill="#6e4220" stroke="#2b1809" stroke-width="2"/>
      <rect x="10" y="16" width="64" height="58" rx="3" fill="#edf2f7"/>
      <rect x="14" y="18" width="26" height="14" rx="4" fill="#fff" stroke="#cbd5e1" stroke-width="1.5"/>
      <rect x="44" y="18" width="26" height="14" rx="4" fill="#fff" stroke="#cbd5e1" stroke-width="1.5"/>
      <path d="M10 32 Q42 36 74 32 L74 74 L10 74 Z" fill="url(#bedQuilt)" stroke="#1e3a8a" stroke-width="1.5"/>
      <path d="M10 32 Q42 38 74 32" stroke="#93c5fd" stroke-width="2.5" fill="none"/>
      <circle cx="42" cy="54" r="7" fill="none" stroke="#fcd34d" stroke-width="2"/>
      <polygon points="42,49 44,53 48,54 44,57 45,61 42,58 39,61 40,57 36,54 40,53" fill="#fcd34d"/>
    </g>

    <!-- Radio / Nightstand -->
    <g id="obj-radio" transform="translate(88, 66)" style="cursor:pointer;">
      <rect x="2" y="8" width="32" height="34" rx="3" fill="#000" opacity="0.3"/>
      <rect x="2" y="4" width="30" height="32" rx="3" fill="#6e4220" stroke="#36200e" stroke-width="1.8"/>
      <rect x="4" y="18" width="26" height="14" rx="2" fill="#523218"/>
      <circle cx="17" cy="25" r="1.8" fill="#d4af37"/>
      <rect x="6" y="8" width="22" height="13" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1"/>
      <rect x="8" y="10" width="8" height="5" rx="1" fill="#10b981"/>
      <line x1="9" y1="12" x2="15" y2="12" stroke="#047857" stroke-width="1"/>
      <circle cx="19" cy="11" r="0.8" fill="#64748b"/><circle cx="23" cy="11" r="0.8" fill="#64748b"/><circle cx="21" cy="14" r="0.8" fill="#64748b"/>
      <line x1="8" y1="8" x2="4" y2="0" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round"/>
    </g>

    <!-- Desk & PC -->
    <g id="obj-pc" transform="translate(136, 62)" style="cursor:pointer;">
      <rect x="4" y="10" width="76" height="38" rx="4" fill="#000" opacity="0.3"/>
      <rect x="4" y="6" width="74" height="36" rx="3" fill="#784720" stroke="#3d210c" stroke-width="2"/>
      <rect x="8" y="18" width="66" height="20" fill="#5c3414"/>
      <rect x="24" y="-12" width="34" height="24" rx="2" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
      <rect x="26" y="-10" width="30" height="20" rx="1" fill="url(#pcGlow)"/>
      <rect x="38" y="12" width="6" height="6" fill="#334155"/>
      <rect x="33" y="16" width="16" height="3" rx="1" fill="#475569"/>
      <circle cx="41" cy="0" r="4.5" fill="#f59e0b"/>
      <text x="41" y="2.5" font-family="sans-serif" font-size="5" font-weight="900" fill="#0b1730" text-anchor="middle">B</text>
      <rect x="23" y="22" width="24" height="8" rx="1.5" fill="#1e293b" stroke="#475569" stroke-width="0.8"/>
      <rect x="52" y="22" width="6" height="8" rx="2" fill="#0f172a"/>
    </g>

    <!-- Bookshelf against Left Wall -->
    <g id="obj-bookshelf" transform="translate(4, 150)" style="cursor:pointer;">
      <rect x="0" y="6" width="22" height="74" rx="2" fill="#000" opacity="0.3"/>
      <rect x="0" y="0" width="16" height="72" rx="2" fill="#523218" stroke="#2b1809" stroke-width="2"/>
      <rect x="3" y="6" width="10" height="26" rx="1.5" fill="#6b3f20" stroke="#36200e" stroke-width="1"/>
      <rect x="3" y="38" width="10" height="26" rx="1.5" fill="#6b3f20" stroke="#36200e" stroke-width="1"/>
      <rect x="-1" y="-1" width="19" height="5" rx="1" fill="#784724" stroke="#2b1809" stroke-width="1"/>
      <rect x="-1" y="68" width="19" height="5" rx="1" fill="#36200e"/>
      <rect x="15" y="10" width="5" height="18" fill="#1e293b"/>
      <rect x="16" y="12" width="4" height="14" fill="#e11d48"/>
      <rect x="15" y="42" width="5" height="18" fill="#1e293b"/>
      <rect x="16" y="44" width="4" height="14" fill="#2563eb"/>
      <line x1="8" y1="8" x2="8" y2="30" stroke="#784724" stroke-width="0.8" opacity="0.5"/>
      <line x1="8" y1="40" x2="8" y2="62" stroke="#784724" stroke-width="0.8" opacity="0.5"/>
    </g>

    <!-- Monstera Potted Plant -->
    <g id="obj-plant" transform="translate(340, 270)" style="cursor:pointer;">
      <ellipse cx="14" cy="28" rx="14" ry="5" fill="#000" opacity="0.3"/>
      <polygon points="4,18 24,18 20,30 8,30" fill="#a0522d" stroke="#5c2409" stroke-width="1.5"/>
      <ellipse cx="14" cy="18" rx="10" ry="3" fill="#6e2d0f"/>
      <path d="M14 18 Q6 10 2 12 Q2 4 10 8 Q14 10 14 18 Z" fill="#2d6a4f" stroke="#1b4332" stroke-width="1"/>
      <path d="M14 18 Q20 8 26 10 Q28 2 20 6 Q16 8 14 18 Z" fill="#40916c" stroke="#1b4332" stroke-width="1"/>
      <path d="M14 18 Q14 6 12 0 Q18 0 16 6 Q15 12 14 18 Z" fill="#52b788" stroke="#1b4332" stroke-width="1"/>
    </g>

    <!-- Player Character Sprite rendered dynamically inside room SVG -->
    <g transform="translate(\${px}, \${py})">
      \${spriteSvg}
    </g>
  </svg>\`;
};

Art.house1FScene = function(gender, player, mom, neighbor, aspect, momAlertActive) {
  var px = player.x;
  var py = player.y;
  var playerSvg = (gender === 'GIRL') ? Art.girlSprite(player.dir, player.step) : Art.boySprite(player.dir, player.step);
  var momSvg = Art.momSprite(mom.dir, mom.step);
  var neighborSvg = (neighbor && Art.neighborSprite) ? Art.neighborSprite(neighbor.dir, neighbor.step) : '';

  if (!aspect || aspect <= 0) aspect = 1.25;
  var camW = 260;
  var camH = camW * aspect;
  if (camH > 340) {
    camH = 340;
    camW = Math.min(400, camH / aspect);
  }
  if (camW > 400) {
    camW = 400;
    camH = Math.min(340, camW * aspect);
  }

  var cx = px + 12;
  var cy = py + 16;
  var camX = Math.max(0, Math.min(400 - camW, cx - camW / 2));
  var camY = Math.max(0, Math.min(340 - camH, cy - camH / 2));

  return \`<svg class="bedroom-svg" viewBox="\${camX.toFixed(1)} \${camY.toFixed(1)} \${camW.toFixed(1)} \${camH.toFixed(1)}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="floorWood1F" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b47846"/><stop offset="100%" stop-color="#8a5327"/></linearGradient>
      <linearGradient id="wallGrad1F" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2d4c0"/><stop offset="70%" stop-color="#d4c2a7"/><stop offset="100%" stop-color="#bfa98d"/></linearGradient>
      <radialGradient id="rugGrad1F" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#991b1b"/><stop offset="85%" stop-color="#7f1d1d"/><stop offset="100%" stop-color="#d4af37"/></radialGradient>
      <linearGradient id="fridgeGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f8fafc"/><stop offset="70%" stop-color="#e2e8f0"/><stop offset="100%" stop-color="#cbd5e1"/></linearGradient>
      <linearGradient id="tvGlow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0284c7"/></linearGradient>
    </defs>

    <!-- Wall & Baseboard -->
    <rect x="0" y="0" width="400" height="84" fill="url(#wallGrad1F)"/>
    <g stroke="#cfbea6" stroke-width="1" opacity="0.45">
      <line x1="20" y1="0" x2="20" y2="78"/><line x1="60" y1="0" x2="60" y2="78"/><line x1="100" y1="0" x2="100" y2="78"/>
      <line x1="140" y1="0" x2="140" y2="78"/><line x1="180" y1="0" x2="180" y2="78"/><line x1="220" y1="0" x2="220" y2="78"/>
      <line x1="260" y1="0" x2="260" y2="78"/><line x1="300" y1="0" x2="300" y2="78"/>
    </g>
    <rect x="0" y="0" width="400" height="8" fill="#523218"/>
    <rect x="0" y="78" width="400" height="6" fill="#523218" stroke="#36200e" stroke-width="1"/>

    <!-- Floor -->
    <rect x="0" y="84" width="400" height="256" fill="url(#floorWood1F)"/>
    <g stroke="#71421e" stroke-width="1.5" opacity="0.65">
      <line x1="0" y1="116" x2="400" y2="116"/><line x1="0" y1="148" x2="400" y2="148"/><line x1="0" y1="180" x2="400" y2="180"/><line x1="0" y1="212" x2="400" y2="212"/><line x1="0" y1="244" x2="400" y2="244"/><line x1="0" y1="276" x2="400" y2="276"/><line x1="0" y1="308" x2="400" y2="308"/>
      <line x1="50" y1="84" x2="50" y2="116"/><line x1="160" y1="84" x2="160" y2="116"/><line x1="280" y1="84" x2="280" y2="116"/>
      <line x1="100" y1="116" x2="100" y2="148"/><line x1="220" y1="116" x2="220" y2="148"/><line x1="350" y1="116" x2="350" y2="148"/>
      <line x1="60" y1="148" x2="60" y2="180"/><line x1="180" y1="148" x2="180" y2="180"/><line x1="300" y1="148" x2="300" y2="180"/>
      <line x1="120" y1="180" x2="120" y2="212"/><line x1="250" y1="180" x2="250" y2="212"/><line x1="370" y1="180" x2="370" y2="212"/>
      <line x1="70" y1="212" x2="70" y2="244"/><line x1="190" y1="212" x2="190" y2="244"/><line x1="310" y1="212" x2="310" y2="244"/>
      <line x1="130" y1="244" x2="130" y2="276"/><line x1="260" y1="244" x2="260" y2="276"/><line x1="380" y1="244" x2="380" y2="276"/>
    </g>

    <!-- Stairs Leading Up to 2F Bedroom -->
    <g id="obj-stairs-1f" transform="translate(320, 16)" style="cursor:pointer;">
      <rect x="2" y="10" width="66" height="76" rx="3" fill="#000" opacity="0.45"/>
      <rect x="2" y="6" width="66" height="80" rx="4" fill="#141d30" stroke="#2a3b5c" stroke-width="2"/>
      <rect x="6" y="12" width="58" height="10" fill="#ad6028" stroke="#1f1006" stroke-width="1"/>
      <rect x="6" y="22" width="58" height="10" fill="#965423" stroke="#1f1006" stroke-width="1"/>
      <rect x="6" y="32" width="58" height="10" fill="#80471e" stroke="#1f1006" stroke-width="1"/>
      <rect x="6" y="42" width="58" height="10" fill="#693a18" stroke="#1f1006" stroke-width="1"/>
      <rect x="6" y="52" width="58" height="10" fill="#522d13" stroke="#1f1006" stroke-width="1"/>
      <rect x="6" y="62" width="58" height="12" fill="#3b200d" stroke="#1f1006" stroke-width="1"/>
      <line x1="6" y1="10" x2="6" y2="76" stroke="#d4af37" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="6" cy="10" r="2" fill="#fcd34d"/>
      <circle cx="6" cy="43" r="2" fill="#fcd34d"/>
      <circle cx="6" cy="76" r="2" fill="#fcd34d"/>
      <rect x="14" y="70" width="44" height="14" rx="3" fill="#101726" stroke="#d4af37" stroke-width="1.2"/>
      <text x="36" y="80" font-family="sans-serif" font-size="8" font-weight="800" fill="#f59e0b" text-anchor="middle">▲ 2F</text>
    </g>

    <!-- Kitchen Suite (Top-Left) -->
    <!-- Fridge -->
    <g id="obj-fridge" transform="translate(14, 44)" style="cursor:pointer;">
      <rect x="2" y="6" width="34" height="54" rx="5" fill="#000" opacity="0.3"/>
      <rect x="0" y="2" width="34" height="56" rx="4" fill="url(#fridgeGrad)" stroke="#64748b" stroke-width="1.8"/>
      <line x1="0" y1="22" x2="34" y2="22" stroke="#94a3b8" stroke-width="1.2"/>
      <rect x="3" y="10" width="2.5" height="8" rx="1" fill="#475569"/>
      <rect x="3" y="26" width="2.5" height="12" rx="1" fill="#475569"/>
      <circle cx="24" cy="12" r="3" fill="#f59e0b"/>
      <circle cx="24" cy="12" r="1.5" fill="#ef4444"/>
      <rect x="18" y="28" width="8" height="6" rx="1" fill="#38bdf8"/>
    </g>

    <!-- Kitchen Sink -->
    <g id="obj-sink" transform="translate(54, 52)" style="cursor:pointer;">
      <rect x="2" y="6" width="36" height="46" rx="3" fill="#000" opacity="0.25"/>
      <rect x="0" y="2" width="36" height="46" rx="2" fill="#6e4220" stroke="#36200e" stroke-width="1.8"/>
      <rect x="2" y="0" width="32" height="10" rx="1.5" fill="#d4af37" opacity="0.85"/>
      <rect x="6" y="14" width="24" height="14" rx="2" fill="#cbd5e1" stroke="#64748b" stroke-width="1.2"/>
      <path d="M18 10 L18 6 Q18 4 15 4" stroke="#94a3b8" stroke-width="2" fill="none"/>
      <circle cx="15" cy="5" r="1.2" fill="#475569"/>
      <line x1="2" y1="32" x2="34" y2="32" stroke="#36200e" stroke-width="1"/>
      <circle cx="18" cy="38" r="1.5" fill="#d4af37"/>
    </g>

    <!-- Kitchen Stove -->
    <g id="obj-stove" transform="translate(94, 52)" style="cursor:pointer;">
      <rect x="2" y="6" width="36" height="46" rx="3" fill="#000" opacity="0.25"/>
      <rect x="0" y="2" width="36" height="46" rx="2" fill="#6e4220" stroke="#36200e" stroke-width="1.8"/>
      <rect x="2" y="0" width="32" height="10" rx="1.5" fill="#1e293b"/>
      <ellipse cx="10" cy="5" rx="5" ry="2" fill="#334155"/>
      <ellipse cx="26" cy="5" rx="5" ry="2" fill="#334155"/>
      <rect x="6" y="-3" width="8" height="6" rx="1" fill="#e11d48"/>
      <rect x="22" y="-4" width="7" height="6" rx="1.5" fill="#f59e0b"/>
      <rect x="6" y="16" width="24" height="18" rx="2" fill="#0f172a" stroke="#475569" stroke-width="1.2"/>
      <circle cx="10" cy="40" r="1.5" fill="#94a3b8"/>
      <circle cx="18" cy="40" r="1.5" fill="#94a3b8"/>
      <circle cx="26" cy="40" r="1.5" fill="#94a3b8"/>
    </g>

    <!-- Retro TV Console (Top-Center) -->
    <g id="obj-tv" transform="translate(148, 48)" style="cursor:pointer;">
      <rect x="4" y="6" width="46" height="48" rx="4" fill="#000" opacity="0.32"/>
      <rect x="0" y="36" width="46" height="16" rx="2" fill="#523218" stroke="#2b1809" stroke-width="1.5"/>
      <line x1="23" y1="36" x2="23" y2="52" stroke="#2b1809" stroke-width="1"/>
      <rect x="4" y="6" width="38" height="32" rx="3" fill="#6e4220" stroke="#36200e" stroke-width="1.8"/>
      <rect x="7" y="9" width="24" height="20" rx="3" fill="url(#tvGlow)" stroke="#1e293b" stroke-width="1.2"/>
      <circle cx="19" cy="14" r="3" fill="#fff" opacity="0.85"/>
      <rect x="10" y="21" width="18" height="4" fill="#0f172a"/>
      <circle cx="13" cy="25" r="1.2" fill="#cbd5e1"/><circle cx="21" cy="25" r="1.2" fill="#cbd5e1"/>
      <line x1="7" y1="26" x2="31" y2="26" stroke="#94a3b8" stroke-width="0.8"/>
      <circle cx="35" cy="14" r="2" fill="#1e293b"/>
      <circle cx="35" cy="22" r="2" fill="#1e293b"/>
      <line x1="16" y1="6" x2="10" y2="-2" stroke="#94a3b8" stroke-width="1.2"/>
      <line x1="24" y1="6" x2="30" y2="-2" stroke="#94a3b8" stroke-width="1.2"/>
    </g>

    <!-- Grand Bookshelf -->
    <g id="obj-bookshelf-1f" transform="translate(212, 44)" style="cursor:pointer;">
      <rect x="3" y="6" width="44" height="54" rx="3" fill="#000" opacity="0.3"/>
      <rect x="0" y="2" width="44" height="56" rx="3" fill="#5c381c" stroke="#2b1809" stroke-width="2"/>
      <rect x="4" y="6" width="36" height="14" fill="#3b200d"/>
      <rect x="4" y="23" width="36" height="14" fill="#3b200d"/>
      <rect x="4" y="40" width="36" height="14" fill="#3b200d"/>
      <rect x="6" y="8" width="4" height="11" fill="#ef4444"/><rect x="11" y="7" width="5" height="12" fill="#3b82f6"/>
      <rect x="17" y="9" width="3" height="10" fill="#10b981"/><rect x="21" y="7" width="6" height="12" fill="#f59e0b"/>
      <rect x="28" y="8" width="5" height="11" fill="#8b5cf6"/><rect x="34" y="10" width="4" height="9" fill="#ec4899"/>
      <rect x="6" y="25" width="5" height="11" fill="#06b6d4"/><rect x="12" y="24" width="4" height="12" fill="#84cc16"/>
      <rect x="17" y="26" width="6" height="10" fill="#e11d48"/><rect x="24" y="24" width="5" height="12" fill="#d97706"/>
      <rect x="30" y="25" width="4" height="11" fill="#475569"/><rect x="35" y="27" width="3" height="9" fill="#10b981"/>
    </g>

    <!-- Ficus Plant in Corner -->
    <g transform="translate(274, 62)">
      <ellipse cx="14" cy="28" rx="8" ry="3" fill="#000" opacity="0.3"/>
      <path d="M7 20 L21 20 L19 28 L9 28 Z" fill="#9a3412" stroke="#431407" stroke-width="1.2"/>
      <ellipse cx="14" cy="20" rx="6" ry="2" fill="#451a03"/>
      <ellipse cx="14" cy="14" rx="7" ry="5" fill="#15803d"/>
      <ellipse cx="9" cy="11" rx="6" ry="4" fill="#16a34a"/>
      <ellipse cx="19" cy="11" rx="6" ry="4" fill="#16a34a"/>
      <ellipse cx="14" cy="6" rx="5" ry="4" fill="#22c55e"/>
    </g>

    <!-- Dining Area (Center-Left) -->
    <!-- Cozy Area Rug -->
    <ellipse cx="140" cy="190" rx="72" ry="44" fill="url(#rugGrad1F)" stroke="#d4af37" stroke-width="2.5"/>
    <ellipse cx="140" cy="190" rx="58" ry="32" fill="none" stroke="#fcd34d" stroke-width="1.2" stroke-dasharray="5,4"/>

    <!-- Left Chair -->
    <g transform="translate(74, 168)">
      <ellipse cx="10" cy="18" rx="8" ry="3" fill="#000" opacity="0.25"/>
      <rect x="2" y="6" width="16" height="14" rx="2" fill="#6e4220" stroke="#36200e" stroke-width="1.2"/>
      <rect x="2" y="0" width="16" height="6" rx="1.5" fill="#523218" stroke="#36200e" stroke-width="1"/>
    </g>

    <!-- Dining Table & Tea Party -->
    <g id="obj-table" transform="translate(100, 160)" style="cursor:pointer;">
      <ellipse cx="32" cy="30" rx="30" ry="12" fill="#000" opacity="0.35"/>
      <ellipse cx="32" cy="16" rx="28" ry="16" fill="#8a5327" stroke="#36200e" stroke-width="2"/>
      <ellipse cx="32" cy="16" rx="20" ry="11" fill="#fdfbf7" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="3,2"/>
      
      <!-- Teapot with steam -->
      <ellipse cx="32" cy="15" rx="5.5" ry="4.5" fill="#f8fafc" stroke="#475569" stroke-width="1"/>
      <ellipse cx="32" cy="12" rx="3" ry="1.5" fill="#f59e0b" stroke="#b45309" stroke-width="0.7"/>
      <circle cx="32" cy="10.5" r="1.2" fill="#fef3c7"/>
      <path d="M37 15 Q40 13 39 17" fill="none" stroke="#475569" stroke-width="1.2"/>
      <path d="M26.5 15 Q24 16 25 18" fill="none" stroke="#475569" stroke-width="1.2"/>
      <path d="M31 8 Q33 5 31 3" stroke="#94a3b8" stroke-width="0.8" fill="none" opacity="0.7"/>
      
      <!-- Neighbor's Teacup (Left) -->
      <ellipse cx="19" cy="17" rx="3.5" ry="2.2" fill="#f1f5f9" stroke="#64748b" stroke-width="0.8"/>
      <ellipse cx="19" cy="16.5" rx="2.5" ry="1.4" fill="#b45309"/>
      
      <!-- Mom's Teacup (Right) -->
      <ellipse cx="45" cy="17" rx="3.5" ry="2.2" fill="#f1f5f9" stroke="#64748b" stroke-width="0.8"/>
      <ellipse cx="45" cy="16.5" rx="2.5" ry="1.4" fill="#b45309"/>
      
      <!-- Plate with sweet treats -->
      <ellipse cx="32" cy="21" rx="5" ry="3" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
      <circle cx="30.5" cy="21" r="1.2" fill="#d97706"/>
      <circle cx="33.5" cy="21" r="1.2" fill="#ea580c"/>
    </g>

    <!-- Right Chair -->
    <g transform="translate(164, 168)">
      <ellipse cx="10" cy="18" rx="8" ry="3" fill="#000" opacity="0.25"/>
      <rect x="2" y="6" width="16" height="14" rx="2" fill="#6e4220" stroke="#36200e" stroke-width="1.2"/>
      <rect x="2" y="0" width="16" height="6" rx="1.5" fill="#523218" stroke="#36200e" stroke-width="1"/>
    </g>

    <!-- Front Doors (Bottom-Center) -->
    <g id="obj-front-door" transform="translate(172, 296)" style="cursor:pointer;">
      <!-- Welcome Mat -->
      <rect x="-8" y="26" width="72" height="18" rx="3" fill="#78350f" stroke="#451a03" stroke-width="1.5"/>
      <rect x="-4" y="28" width="64" height="14" rx="2" fill="#92400e"/>
      <text x="28" y="38" font-family="sans-serif" font-size="7.5" font-weight="800" fill="#fef3c7" text-anchor="middle" letter-spacing="1">WELCOME</text>
      <!-- Double Doors Frame -->
      <rect x="0" y="0" width="56" height="28" rx="2" fill="#36200e" stroke="#1f1006" stroke-width="2"/>
      <!-- Left Door Leaf -->
      <rect x="2" y="2" width="25" height="24" fill="#6e4220" stroke="#2b1809" stroke-width="1"/>
      <circle cx="23" cy="15" r="1.8" fill="#d4af37"/>
      <!-- Right Door Leaf -->
      <rect x="29" y="2" width="25" height="24" fill="#6e4220" stroke="#2b1809" stroke-width="1"/>
      <circle cx="33" cy="15" r="1.8" fill="#d4af37"/>
      <!-- Exit indicator -->
      <polygon points="28,26 23,20 33,20" fill="#f59e0b"/>
    </g>

    \${(py < 168) ? \`<g transform="translate(\${px}, \${py})">\${playerSvg}</g>\` : ''}

    <!-- Neighbor NPC (Sitting at table having tea with Mom) -->
    \${neighbor ? \`
    <g id="obj-neighbor" transform="translate(\${neighbor.x}, \${neighbor.y})" style="cursor:pointer;">
      \${neighborSvg}
      <g transform="translate(0, -6)">
        <polygon points="16,0 12,-6 20,-6" fill="#10b981"/>
      </g>
    </g>\` : ''}

    <!-- Mom NPC (Sitting at table having tea) -->
    <g id="obj-mom" transform="translate(\${mom.x}, \${mom.y})" style="cursor:pointer;">
      \${momSvg}
      \${momAlertActive ? \`
      <g id="mom-alert" transform="translate(16, -16)">
        <rect x="-10" y="-12" width="20" height="18" rx="4" fill="#ef4444" stroke="#ffffff" stroke-width="1.5"/>
        <polygon points="-4,6 4,6 0,11" fill="#ef4444"/>
        <text x="0" y="2" font-family="'Lilita One', Fredoka, sans-serif" font-size="14" font-weight="900" fill="#ffffff" text-anchor="middle">!</text>
      </g>\` : \`
      <g transform="translate(0, -6)">
        <polygon points="16,0 12,-6 20,-6" fill="#f59e0b"/>
      </g>\`}
    </g>

    \${(py >= 168) ? \`<g transform="translate(\${px}, \${py})">\${playerSvg}</g>\` : ''}
  </svg>\`;
};
`;

console.log('Vector art ready.');

// Helper function to build modern HTML
function buildHtml(includeEmbeddedRom) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="theme-color" content="#080b10">
  <title>Buddymon</title>
  <link rel="icon" type="image/png" href="icon-192.png">
  <link rel="apple-touch-icon" href="icon-192.png">
  <link rel="manifest" href="manifest.json">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Lilita+One&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #080b10;
      --surface: #0d121f;
      --surface-elevated: #161e33;
      --accent: #38bdf8;
      --accent-strong: #0284c7;
      --action-a: #f43f5e;
      --action-b: #f59e0b;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --gold: #ffc93c;
      --cream: #fff6dc;
      --ink: #0b1730;
      --navy: #10204f;
    }
    * {
      box-sizing: border-box;
      user-select: none;
      -webkit-user-select: none;
      -webkit-touch-callout: none;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100dvh;
      overflow: hidden;
      background: var(--bg);
      color: var(--text);
      font-family: 'Fredoka', system-ui, -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
    }

    /* Top App Status Bar */
    .app-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      padding: env(safe-area-inset-top, 6px) 12px 6px;
      background: var(--surface);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      flex-shrink: 0;
      z-index: 20;
    }
    .title-group {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }
    .hd-pill {
      background: linear-gradient(135deg, #38bdf8, #818cf8);
      color: #080b10;
      font-size: 0.72rem;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
      letter-spacing: 0.04em;
    }
    .game-title {
      font-weight: 700;
      font-size: 0.95rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #fff;
    }
    .bar-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: nowrap;
    }
    .chip-btn {
      background: var(--surface-elevated);
      color: var(--text);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 6px;
      padding: 5px 10px;
      font-size: 0.76rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .chip-btn:hover { background: #232d42; }
    .chip-btn.active {
      background: var(--accent);
      color: #080b10;
      border-color: var(--accent);
    }

    /* Viewport Workspace: Edge-to-Edge Stage + Bottom Touch Deck */
    .viewport-workspace {
      flex: 1 1 0;
      min-height: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      overflow: hidden;
      position: relative;
    }

    /* Edge-to-Edge HD Display Stage - ZERO black bars above or below! */
    .hd-screen-stage {
      width: 100%;
      flex: 1 1 0;
      min-height: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #000;
      position: relative;
      overflow: hidden;
    }

    /* Normal GBC Canvas */
    #mainCanvas {
      width: 100%;
      height: 100%;
      max-width: min(100vw, calc(100dvh * (160 / 144)));
      max-height: 100%;
      aspect-ratio: 160 / 144;
      object-fit: contain;
      display: none;
      image-rendering: pixelated;
    }
    body.hd-off #mainCanvas {
      display: block;
    }

    #hdPlayerOverlay {
      position: absolute;
      pointer-events: none;
      z-index: 10;
      display: none;
    }
    #hdPlayerOverlay svg {
      width: 100%;
      height: 100%;
      display: block;
    }

    /* Modern HD Container with container query support */
    #hd {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      container-type: size;
      overflow: hidden;
      display: block;
      color: var(--cream);
      background: #060a1e;
      user-select: none;
    }
    body.hd-off #hd {
      display: none !important;
    }

    #hd .scene {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    /* Intro Scene CSS */
    #hd .scene.intro {
      background: #060a1e;
    }
    #hd .act {
      --t: calc(var(--i) * 6s);
      position: absolute;
      inset: 0;
      overflow: hidden;
      opacity: 0;
      animation: ia-fade 6.4s linear var(--t) both;
    }
    #hd .act:last-of-type {
      animation-name: ia-last;
    }
    @keyframes ia-fade {
      0% { opacity: 0; }
      6% { opacity: 1; }
      93% { opacity: 1; }
      100% { opacity: 0; }
    }
    @keyframes ia-last {
      0% { opacity: 0; }
      6% { opacity: 1; }
      100% { opacity: 1; }
    }
    #hd .act .bgsvg, #hd .nightbg, #hd .nightbg .sky, #hd .burst {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }
    #hd .cap {
      position: absolute;
      left: 6%;
      right: 6%;
      bottom: 8%;
      margin: 0;
      padding: 2.6cqw 4.2cqw;
      text-align: center;
      font: 700 6.2cqw/1.2 'Fredoka', sans-serif;
      color: var(--cream);
      border-radius: 5cqw;
      background: rgba(10, 18, 50, 0.78);
      border: 0.6cqw solid rgba(255, 246, 220, 0.35);
      backdrop-filter: blur(4px);
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.45);
      opacity: 0;
      animation: ia-cap 0.7s calc(var(--t) + 0.5s) ease-out both;
      z-index: 10;
    }
    #hd .cap.big {
      font-size: 7.6cqw;
      color: var(--gold);
      border-color: var(--gold);
    }
    @keyframes ia-cap {
      from { opacity: 0; transform: translateY(4cqw); }
      to { opacity: 1; transform: none; }
    }
    #hd .skip {
      position: absolute;
      left: 0;
      right: 0;
      top: 3.5%;
      text-align: center;
      font-size: 3.8cqw;
      font-weight: 600;
      color: #fff;
      opacity: 0.85;
      letter-spacing: 0.08em;
      text-shadow: 0 2px 6px rgba(0,0,0,0.6);
      z-index: 15;
    }
    #hd .swim {
      position: absolute;
      left: 0;
      width: 32cqw;
      animation: ia-swim 6s linear var(--t) both;
      z-index: 5;
    }
    #hd .swim svg {
      display: block;
      width: 100%;
      animation: ia-bob 1.1s ease-in-out infinite alternate;
    }
    #hd .s1 { top: 16%; animation-duration: 6s; }
    #hd .s2 { top: 38%; width: 38cqw; animation-delay: calc(var(--t) + 0.6s); animation-duration: 5.6s; }
    #hd .s3 { top: 60%; width: 28cqw; animation-delay: calc(var(--t) + 1.2s); animation-duration: 5.2s; }
    @keyframes ia-swim {
      from { transform: translateX(-45cqw); }
      to { transform: translateX(125cqw); }
    }
    @keyframes ia-bob {
      from { transform: translateY(-2.5cqw) rotate(-4deg); }
      to { transform: translateY(2.5cqw) rotate(4deg); }
    }
    #hd .kelp {
      transform-box: fill-box;
      transform-origin: 50% 100%;
      animation: ia-sway 3s ease-in-out infinite alternate;
    }
    @keyframes ia-sway {
      from { transform: rotate(-5deg); }
      to { transform: rotate(5deg); }
    }
    #hd .bub {
      position: absolute;
      left: var(--x);
      bottom: 0;
      width: var(--s);
      height: var(--s);
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.75);
      animation: ia-bub 4s linear infinite var(--d);
      pointer-events: none;
    }
    @keyframes ia-bub {
      0% { transform: translateY(0); opacity: 0; }
      15% { opacity: 0.8; }
      100% { transform: translateY(-110cqh); opacity: 0; }
    }
    #hd .roll {
      position: absolute;
      left: 0;
      bottom: 22%;
      width: 30cqw;
      animation: ia-swim 5.5s linear calc(var(--t) + 0.4s) both;
    }
    #hd .roll div {
      animation: ia-spin 1.4s linear infinite;
    }
    @keyframes ia-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    #hd .pop {
      position: absolute;
      left: 36%;
      bottom: 18%;
      width: 32cqw;
      animation: ia-pop 5s ease-out calc(var(--t) + 0.5s) both;
    }
    @keyframes ia-pop {
      0% { transform: translateY(10cqw) scale(0.6); opacity: 0; }
      15% { transform: translateY(0) scale(1); opacity: 1; }
      85% { transform: translateY(0) scale(1); opacity: 1; }
      100% { transform: translateY(-4cqw); opacity: 0; }
    }
    #hd .ember {
      position: absolute;
      left: var(--x);
      bottom: 10%;
      width: 1.5cqw;
      height: 1.5cqw;
      border-radius: 50%;
      background: #ffc93c;
      box-shadow: 0 0 6px #ff7a3c;
      animation: ia-ember 3.5s ease-in infinite var(--d);
    }
    @keyframes ia-ember {
      0% { transform: translate(0, 0); opacity: 0; }
      20% { opacity: 1; }
      100% { transform: translate(6cqw, -80cqh); opacity: 0; }
    }
    #hd .burst {
      background: radial-gradient(circle at 50% 50%, #ffe98a 0%, #ff8a3a 40%, #0a1232 80%);
    }
    #hd .jump {
      position: absolute;
      bottom: 24%;
      width: 28cqw;
      animation: ia-jump 1.6s ease-in-out infinite alternate;
    }
    #hd .j1 { left: 8%; animation-delay: 0.1s; }
    #hd .j2 { left: 36%; bottom: 27%; width: 30cqw; animation-delay: 0.4s; }
    #hd .j3 { left: 64%; animation-delay: 0.7s; }
    @keyframes ia-jump {
      0% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-8cqw) scale(1.05); }
      100% { transform: translateY(0) scale(0.98, 1.02); }
    }

    /* Title Screen CSS */
    #hd .scene.title {
      background: radial-gradient(circle at 50% 30%, #1e3163 0%, #080f26 100%);
    }
    #hd .logo {
      position: absolute;
      left: 6%;
      right: 6%;
      top: 6%;
      filter: drop-shadow(0 1.6cqw 0 rgba(0, 0, 0, 0.35));
      animation: title-bob 4.5s ease-in-out infinite;
    }
    #hd .logo .logo-svg {
      width: 100%;
      display: block;
    }
    #hd .logo.small {
      left: 5%;
      right: auto;
      width: 54%;
      top: 4%;
      animation: none;
    }
    @keyframes title-bob {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-1.5cqw); }
    }
    #hd .trio {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 12%;
      height: 38%;
    }
    #hd .mon {
      position: absolute;
      bottom: 0;
      animation: mon-hop 2.8s ease-in-out infinite;
    }
    #hd .mon svg {
      width: 100%;
      height: 100%;
      display: block;
    }
    #hd .m1 { left: 8%; width: 27%; animation-delay: 0.2s; }
    #hd .m2 { left: 36%; width: 29%; bottom: 2%; animation-delay: 0.9s; }
    #hd .m3 { left: 65%; width: 27%; animation-delay: 1.5s; }
    @keyframes mon-hop {
      0%, 100% { transform: translateY(0); }
      45% { transform: translateY(-3.5cqw); }
      60% { transform: translateY(0) scale(1.03, 0.96); }
    }
    #hd .press {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 4%;
      text-align: center;
      font-weight: 700;
      font-size: 5.2cqw;
      letter-spacing: 0.08em;
      color: var(--cream);
      text-shadow: 0 0 1.8cqw rgba(255, 201, 60, 0.9), 0 0.5cqw 0 var(--ink);
      animation: title-blink 1.4s ease-in-out infinite;
      cursor: pointer;
    }
    @keyframes title-blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
    #hd .fly {
      position: absolute;
      width: 1.2cqw;
      height: 1.2cqw;
      border-radius: 50%;
      background: #ffe98a;
      box-shadow: 0 0 1.8cqw 0.7cqw rgba(255, 233, 138, 0.8);
      animation: fly-float 6s ease-in-out infinite;
      pointer-events: none;
    }
    @keyframes fly-float {
      0%, 100% { transform: translate(0, 0); opacity: 0.2; }
      50% { transform: translate(4cqw, -6cqw); opacity: 1; }
    }

    .sky-svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: block;
      object-fit: cover;
      pointer-events: none;
    }

    /* Menu Scene CSS */
    #hd .scene.menu {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-evenly;
      padding: 24px 16px;
      box-sizing: border-box;
      background: radial-gradient(circle at 50% 30%, #162447 0%, #070c1e 100%);
      width: 100%;
      height: 100%;
      position: relative;
    }
    #hd .scene.menu .logo {
      position: relative;
      left: auto;
      top: auto;
      width: 82%;
      max-width: 380px;
      margin: 0 auto;
    }
    #hd .menu-list {
      position: relative;
      left: auto;
      top: auto;
      width: 86%;
      max-width: 360px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
      list-style: none;
      padding: 0;
    }
    #hd .menu-list li {
      position: relative;
      margin: 0;
      padding: 14px 20px 14px 44px;
      font-size: 1.15rem;
      border-radius: 20px;
      box-sizing: border-box;
      background: rgba(10, 18, 50, 0.85);
      border: 1.5px solid rgba(255, 246, 220, 0.25);
      backdrop-filter: blur(5px);
      cursor: pointer;
      color: #fff;
      transition: transform 0.15s, border-color 0.15s;
    }
    #hd .menu-list li.sel {
      border-color: var(--gold);
      background: rgba(20, 36, 85, 0.95);
      transform: translateX(4px);
      box-shadow: 0 0 20px rgba(255, 201, 60, 0.45);
    }
    #hd .menu-list li b {
      position: absolute;
      left: 18px;
      top: 50%;
      width: 12px;
      height: 12px;
      margin-top: -6px;
      border-radius: 50%;
      background: transparent;
    }
    #hd .menu-list li.sel b {
      background: var(--gold);
      box-shadow: 0 0 8px var(--gold);
    }

    /* Options Scene CSS */
    #hd .scene.options {
      background: radial-gradient(circle at 50% 25%, #182852 0%, #080d22 100%);
      padding: 6cqw;
    }
    #hd .panel-header {
      font-size: 7.2cqw;
      font-weight: 800;
      letter-spacing: 0.06em;
      color: var(--gold);
      text-align: center;
      margin-top: 4cqw;
      margin-bottom: 5cqw;
      text-shadow: 0 3px 0 var(--ink);
    }
    #hd .options-container {
      display: flex;
      flex-direction: column;
      gap: 1.4cqw;
      max-width: 92%;
      margin: 0 auto;
    }
    #hd .opt-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.6cqw 3.6cqw;
      background: rgba(13, 22, 54, 0.85);
      border: 0.4cqw solid rgba(255, 246, 220, 0.22);
      border-radius: 2.5cqw;
      font-size: 3.8cqw;
      font-weight: 600;
      cursor: pointer;
      color: var(--cream);
      user-select: none;
    }
    #hd .opt-row.sel {
      border-color: var(--gold);
      background: rgba(22, 38, 90, 0.95);
      box-shadow: 0 0 10px rgba(255, 201, 60, 0.35);
    }
    #hd .opt-val {
      color: var(--gold);
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 1cqw;
    }
    #hd .opt-row.back-row {
      justify-content: center;
      text-align: center;
      background: rgba(245, 158, 11, 0.15);
      border: 0.4cqw solid var(--gold);
      color: var(--gold);
      font-weight: 700;
      margin-top: 1cqw;
    }

    /* Professor Oak / New Game Intro Scene */
    #hd .scene.prof {
      background: radial-gradient(120% 90% at 50% 100%, #1e295d 0%, #111a40 50%, #090e24 100%);
    }
    #hd .prof-portrait {
      position: absolute;
      left: 50%;
      top: 3%;
      bottom: 18cqw;
      transform: translateX(-50%);
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      z-index: 5;
    }
    #hd .prof-portrait img {
      max-width: 66cqw;
      max-height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 1cqw 2cqw rgba(0, 0, 0, 0.45));
      animation: floatProf 3s ease-in-out infinite;
    }
    @keyframes floatProf {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-1cqw); }
    }
    #hd .creature-spot {
      position: absolute;
      left: 50%;
      top: 6%;
      bottom: 20cqw;
      transform: translateX(-50%);
      width: 50cqw;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 5;
      filter: drop-shadow(0 1.5cqw 0 rgba(0, 0, 0, 0.3));
    }
    #hd .creature-spot svg {
      width: 100%;
      height: 100%;
      display: block;
    }
    #hd .gender-stage {
      position: absolute;
      left: 5%;
      right: 5%;
      top: 48%;
      transform: translateY(-50%);
      height: 50cqh;
      max-height: 350px;
      display: flex;
      gap: 3.5cqw;
      align-items: center;
      justify-content: center;
      z-index: 6;
    }
    #hd .gender-card {
      flex: 1;
      max-width: 44cqw;
      height: 100%;
      background: rgba(255, 255, 255, 0.08);
      border: 0.5cqw solid rgba(255, 255, 255, 0.22);
      border-radius: 3cqw;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5cqw;
      cursor: pointer;
      backdrop-filter: blur(4px);
      transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease;
    }
    #hd .gender-card:hover, #hd .gender-card.active {
      background: rgba(245, 158, 11, 0.22);
      border-color: var(--gold);
      box-shadow: 0 0 16px rgba(245, 158, 11, 0.5);
    }
    #hd .gender-card img {
      width: auto;
      max-width: 92%;
      height: 75%;
      max-height: 240px;
      object-fit: contain;
      filter: drop-shadow(0 1cqw 1.5cqw rgba(0, 0, 0, 0.4));
    }
    #hd .gender-label {
      margin-top: 1.5cqw;
      padding: 0.8cqw 4cqw;
      font-size: 3.6cqw;
      font-weight: 800;
      border-radius: 2cqw;
      background: linear-gradient(#ffe98a, #ffc93c);
      color: var(--ink);
      border: 0.4cqw solid var(--ink);
      box-shadow: 0 0.5cqw 1cqw rgba(0, 0, 0, 0.3);
    }
    #hd .hero-portrait {
      position: absolute;
      left: 50%;
      top: 3%;
      bottom: 18cqw;
      transform: translateX(-50%);
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 5;
      pointer-events: none;
    }
    #hd .hero-portrait img {
      max-width: 66cqw;
      max-height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 1cqw 2cqw rgba(0, 0, 0, 0.45));
      animation: floatProf 3s ease-in-out infinite;
    }

    /* Dialogue Box in Buddymon Style - Compact & Sleek */
    #hd .dlg {
      z-index: 10;
      position: absolute;
      left: 4%;
      right: 4%;
      bottom: 2%;
      min-height: 8.5cqw;
      padding: 1.2cqw 3.5cqw 1.2cqw 3cqw;
      border-radius: 2cqw;
      background: linear-gradient(180deg, rgba(16, 28, 72, 0.96) 0%, rgba(8, 14, 42, 0.98) 100%);
      border: 0.4cqw solid var(--gold);
      box-shadow: 0 0 0 0.3cqw var(--ink), 0 1cqw 3cqw rgba(0, 0, 0, 0.55);
      cursor: pointer;
    }
    #hd .dlg-tag {
      position: absolute;
      left: 3cqw;
      top: -2.4cqw;
      padding: 0.2cqw 2.4cqw;
      font-size: 2.8cqw;
      font-weight: 800;
      letter-spacing: 0.04em;
      color: var(--ink);
      background: linear-gradient(#ffe98a, #ffc93c);
      border: 0.35cqw solid var(--ink);
      border-radius: 1.6cqw;
    }
    #hd .dlg p {
      margin: 0;
      font-size: 3.8cqw;
      line-height: 1.3;
      font-weight: 600;
      color: var(--cream);
      text-shadow: 0 0.2cqw 0 rgba(0, 0, 0, 0.4);
    }
    #hd .dlg .more {
      position: absolute;
      right: 2.5cqw;
      bottom: 1cqw;
      font-size: 3.2cqw;
      color: var(--gold);
      animation: nudge 0.9s ease-in-out infinite;
    }
    @keyframes nudge {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(0.8cqw); }
    }
    #hd .choice-box {
      position: absolute;
      left: 4%;
      right: 4%;
      bottom: 15cqw;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2cqw;
      z-index: 12;
    }
    #hd .choice-btn {
      padding: 1.8cqw 1cqw;
      font-size: 3.6cqw;
      font-weight: 700;
      color: var(--cream);
      background: rgba(16, 28, 70, 0.95);
      border: 0.4cqw solid var(--gold);
      border-radius: 2cqw;
      cursor: pointer;
      text-align: center;
      box-shadow: 0 3px 12px rgba(0,0,0,0.5);
    }
    #hd .choice-btn:active, #hd .choice-btn.sel {
      background: var(--gold);
      color: var(--ink);
    }

    /* Buddymon Naming Screen (YOUR NAME?) */
    #hd .scene.naming {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-evenly;
      padding: 16px 12px;
      background: radial-gradient(circle at 50% 25%, #0e1a38 0%, #060a16 100%);
      color: #fff;
      overflow-y: auto;
      gap: 12px;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
    }
    #hd .naming-header-card {
      width: 94%;
      max-width: 440px;
      background: rgba(16, 26, 52, 0.95);
      border: 2px solid var(--gold);
      border-radius: 16px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.55);
      box-sizing: border-box;
    }
    #hd .naming-avatar {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      border: 2.5px solid var(--gold);
      overflow: hidden;
      background: #090e1d;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #hd .naming-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
    }
    #hd .naming-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    #hd .naming-title {
      font-size: 1.05rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: var(--gold);
    }
    #hd .naming-slots {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    #hd .naming-slot {
      width: 26px;
      height: 34px;
      border-bottom: 3.5px solid rgba(255, 255, 255, 0.35);
      font-size: 1.35rem;
      font-weight: 800;
      color: #fff;
      text-align: center;
      line-height: 30px;
      font-family: inherit;
    }
    #hd .naming-slot.active {
      border-bottom-color: var(--gold);
      animation: slot-pulse 0.8s infinite alternate;
    }
    @keyframes slot-pulse {
      0% { border-bottom-color: var(--gold); }
      100% { border-bottom-color: #fff; }
    }
    #hd .naming-grid-box {
      width: 94%;
      max-width: 440px;
      background: rgba(14, 22, 44, 0.95);
      border: 1px solid rgba(245, 158, 11, 0.4);
      border-radius: 16px;
      padding: 14px 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.55);
      box-sizing: border-box;
    }
    #hd .naming-row {
      display: flex;
      justify-content: space-between;
      gap: 6px;
      width: 100%;
    }
    #hd .name-key {
      flex: 1;
      height: 44px;
      background: #172442;
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 8px;
      color: #e2e8f0;
      font-size: 1.15rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      touch-action: none;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
      padding: 0;
      transition: background 0.1s, transform 0.05s, border-color 0.1s;
    }
    #hd .name-key:active, #hd .name-key.cursor {
      background: var(--gold);
      color: #080b10;
      border-color: #fff;
      transform: scale(1.08);
      box-shadow: 0 0 12px rgba(245, 158, 11, 0.7);
      z-index: 2;
    }
    #hd .name-key-action {
      flex: 3;
      aspect-ratio: auto;
      height: 46px;
      font-size: 0.95rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      border-radius: 10px;
    }
    #hd .name-key-case {
      background: #1e293b;
      color: var(--gold);
    }
    #hd .name-key-del {
      background: #331d25;
      color: #f43f5e;
      border-color: rgba(244, 63, 94, 0.4);
    }
    #hd .name-key-end {
      background: #0f372c;
      color: #10b981;
      border-color: rgba(16, 185, 129, 0.5);
    }
    #hd .naming-back-btn {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #cbd5e1;
      border-radius: 999px;
      padding: 10px 24px;
      font-size: 0.9rem;
      font-weight: 700;
      cursor: pointer;
      margin-top: 4px;
      transition: all 0.15s;
    }
    #hd .naming-back-btn:active {
      background: rgba(255, 255, 255, 0.16);
      color: #fff;
    }

    /* Buddymon HD Bedroom */
    #hd .scene.bedroom {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background: #0d1424;
      position: relative;
      overflow: hidden;
      box-sizing: border-box;
      padding: 0;
    }
    #hd .bedroom-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      max-width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #hd .bedroom-svg {
      width: 100%;
      height: 100%;
      display: block;
    }
    #hd .bedroom-dialogue {
      position: absolute;
      left: 14px;
      right: 14px;
      bottom: 14px;
      min-height: 60px;
      padding: 14px 18px 12px 18px;
      border-radius: 14px;
      background: linear-gradient(180deg, rgba(16, 28, 72, 0.96) 0%, rgba(8, 14, 42, 0.98) 100%);
      border: 2px solid var(--gold);
      box-shadow: 0 0 0 2px var(--ink), 0 8px 24px rgba(0, 0, 0, 0.65);
      z-index: 50;
      animation: dlg-in 0.15s ease-out;
      box-sizing: border-box;
      cursor: pointer;
    }
    #hd .bedroom-dialogue .dlg-tag {
      position: absolute;
      left: 14px;
      top: -12px;
      padding: 2px 12px;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      color: var(--ink) !important;
      background: linear-gradient(#ffe98a, #ffc93c);
      border: 1.5px solid var(--ink);
      border-radius: 10px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
      text-transform: uppercase;
    }
    #hd .bedroom-dialogue p {
      margin: 4px 0 0;
      font-size: 0.92rem;
      line-height: 1.35;
      color: var(--cream);
      font-weight: 600;
      text-shadow: 0 1px 0 rgba(0, 0, 0, 0.5);
    }
    #hd .bedroom-dialogue .more {
      position: absolute;
      right: 14px;
      bottom: 8px;
      font-size: 0.85rem;
      color: var(--gold);
      animation: nudge 0.9s ease-in-out infinite;
    }

    /* Smartphone Touch Controller Deck */
    .touch-deck {
      width: 100%;
      max-width: 680px;
      margin-top: auto;
      padding: 8px 16px calc(env(safe-area-inset-bottom, 12px) + 12px);
      background: linear-gradient(180deg, rgba(13, 18, 31, 0.98) 0%, #080b10 100%);
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      flex-direction: column;
      gap: 10px;
      flex-shrink: 0;
      z-index: 20;
      box-sizing: border-box;
    }
    .deck-primary {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      box-sizing: border-box;
    }
    /* Modern Ergonomic Cross D-Pad */
    .dpad {
      position: relative;
      width: 138px;
      height: 138px;
      flex-shrink: 0;
    }
    .dpad-btn {
      position: absolute;
      background: #161e33;
      border: 1px solid rgba(255, 255, 255, 0.16);
      color: #cbd5e1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.95rem;
      border-radius: 10px;
      cursor: pointer;
      touch-action: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45);
    }
    .dpad-btn:active, .dpad-btn.pressed {
      background: var(--accent);
      color: #080b10;
      border-color: var(--accent);
      transform: scale(0.94);
    }
    .dpad-up    { top: 0; left: 46px; width: 46px; height: 48px; }
    .dpad-down  { bottom: 0; left: 46px; width: 46px; height: 48px; }
    .dpad-left  { top: 46px; left: 0; width: 48px; height: 46px; }
    .dpad-right { top: 46px; right: 0; width: 48px; height: 46px; }

    /* Modern A / B Buttons on the right */
    .ab-pad {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 16px;
      transform: rotate(-18deg);
      margin-left: auto;
      padding-right: 8px;
      flex-shrink: 0;
    }
    .action-btn {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.25);
      color: #fff;
      font-weight: 800;
      font-size: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      touch-action: none;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.55);
    }
    .action-b {
      background: linear-gradient(145deg, #f59e0b, #d97706);
      margin-top: 18px;
    }
    .action-a {
      background: linear-gradient(145deg, #f43f5e, #e11d48);
      margin-bottom: 18px;
    }
    .action-btn:active, .action-btn.pressed {
      transform: scale(0.92);
      filter: brightness(1.25);
    }

    /* Select / Start / Quick Save Pill Row */
    .deck-secondary {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      flex-wrap: nowrap;
      width: 100%;
      box-sizing: border-box;
      margin-bottom: 4px;
    }
    .pill-btn {
      flex: 1;
      background: #161e33;
      color: #94a3b8;
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 999px;
      padding: 8px 4px;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-align: center;
      white-space: nowrap;
      cursor: pointer;
      touch-action: none;
    }
    .pill-btn:active, .pill-btn.pressed {
      background: var(--accent);
      color: #080b10;
    }
    .status-toast {
      font-size: 0.72rem;
      color: var(--text-muted);
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Landscape Smartphone / Wide Desktop */
    @media (min-aspect-ratio: 13/10) and (max-height: 600px) {
      .viewport-workspace {
        flex-direction: row;
      }
      .touch-deck {
        width: auto;
        background: transparent;
        border-top: none;
        padding: 8px 14px;
      }
    }

    /* Modal Dialog */
    dialog {
      background: var(--surface);
      color: var(--text);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 14px;
      padding: 18px 20px;
      max-width: 500px;
      width: calc(100% - 28px);
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.75);
    }
    dialog::backdrop {
      background-color: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(3px);
    }
    dialog h2 { margin: 0 0 10px; font-size: 1.05rem; }
    .modal-section {
      background: var(--surface-elevated);
      border-radius: 8px;
      padding: 10px 12px;
      margin-bottom: 10px;
      font-size: 0.8rem;
      line-height: 1.45;
    }
    .btn-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }
  </style>
</head>
<body class="hd-on">
  <header class="app-bar">
    <div class="title-group">
      <span class="hd-pill" id="hdBadge">Buddymon HD</span>
      <span class="game-title" id="gameTitleText">Buddymon</span>
    </div>
    <div class="bar-actions">
      <button class="chip-btn active" id="btnHdMode" type="button">HD: ON</button>
      <button class="chip-btn" id="btnSound" type="button">Audio: ON</button>
      <button class="chip-btn" id="btnMenu" type="button">Menu</button>
    </div>
  </header>

  <main class="viewport-workspace">
    <div class="hd-screen-stage" id="lcdContainer">
      <div id="hd"></div>
      <div class="game-viewport" id="gameViewport" style="position:relative; width:100%; height:100%; display:flex; align-items:center; justify-content:center;">
        <canvas id="mainCanvas" width="640" height="576"></canvas>
        <div id="hdPlayerOverlay" style="display:none; position:absolute; pointer-events:none; z-index:10;"></div>
      </div>
    </div>

    <section class="touch-deck" aria-label="Game Controls">
      <div class="deck-primary">
        <div class="dpad">
          <button class="dpad-btn dpad-up" data-gbkey="up" type="button" aria-label="Up">&#9650;</button>
          <button class="dpad-btn dpad-down" data-gbkey="down" type="button" aria-label="Down">&#9660;</button>
          <button class="dpad-btn dpad-left" data-gbkey="left" type="button" aria-label="Left">&#9664;</button>
          <button class="dpad-btn dpad-right" data-gbkey="right" type="button" aria-label="Right">&#9654;</button>
        </div>

        <div class="ab-pad">
          <button class="action-btn action-b" data-gbkey="b" type="button">B</button>
          <button class="action-btn action-a" data-gbkey="a" type="button">A</button>
        </div>
      </div>

      <div class="deck-secondary">
        <button class="pill-btn" data-gbkey="select" type="button">SELECT</button>
        <button class="pill-btn" data-gbkey="start" type="button">START</button>
        <button class="pill-btn" id="btnQuickSave" type="button">STATE SAVE</button>
        <button class="pill-btn" id="btnQuickLoad" type="button">STATE LOAD</button>
      </div>
    </section>
  </main>

  <dialog id="menuDialog" closedby="any" aria-labelledby="menuDialogTitle">
    <h2 id="menuDialogTitle">Buddymon Options &amp; Save Manager</h2>
    <div class="modal-section">
      <strong>Buddymon HD Mode:</strong><br>
      &bull; Custom Buddymon HD version with edge-to-edge smartphone display (no black bars).<br>
      &bull; Starters replaced with Bramblet, Bandit, and Chomplet in Elm's lab!<br>
      &bull; Use <strong>HD: ON / OFF</strong> in the top bar to toggle between HD Buddymon and Classic Normal Crystal mode.
    </div>
    <div class="modal-section">
      <strong>Battery Save (.SAV) &amp; Fullscreen:</strong>
      <div class="btn-row">
        <button class="chip-btn" id="btnExportSav" type="button">Export .SAV</button>
        <label class="chip-btn" style="cursor:pointer;">
          Import .SAV
          <input type="file" id="inputImportSav" accept=".sav,.ram" style="display:none;">
        </label>
        <button class="chip-btn" id="btnFullscreen" type="button">Fullscreen</button>
      </div>
    </div>
    <form method="dialog" style="display:flex;justify-content:flex-end;margin-top:10px;">
      <button class="chip-btn active" type="submit">Resume Game</button>
    </form>
  </dialog>

  <script>
    ${includeEmbeddedRom ? `window.__EMBEDDED_ROM_GZ_B64__ = "${romB64}";` : `window.__EMBEDDED_ROM_GZ_B64__ = null;`}
    window.__BEDROOM_STATE_GZ_B64__ = "${bedroomStateB64}";
    window.__HOUSE_1F_STATE_GZ_B64__ = "${house1FStateB64}";
    window.__NEW_BARK_TOWN_STATE_GZ_B64__ = "${newBarkTownStateB64}";
    window.__PROF_IMG__ = "data:image/png;base64,${profB64}";
    window.__BOY_IMG__ = "data:image/png;base64,${boyB64}";
    window.__GIRL_IMG__ = "data:image/png;base64,${girlB64}";
  </script>
  <script src="emulator.js"></script>
  <script>
    ${vectorArtJs}
  </script>
  <script>
    (function() {
      // 1. PWA Service Worker Registration
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
          navigator.serviceWorker.register('sw.js').catch(function(err) {
            console.warn('[PWA] Service worker registration failed:', err);
          });
        });
      }

      var canvas = document.getElementById('mainCanvas');
      var hdStage = document.getElementById('hd');
      var currentSpeed = 1;
      var loadedRomBinaryString = '';
      var loadedRomUint8 = null;
      var currentHdScene = 'intro'; // 'intro', 'title', 'menu', 'options', 'prof', 'game'
      var hdMenuIndex = 0;
      var hdOptionsIndex = 0;
      var hdNameChoiceIndex = 0;
      var profStep = 0;
      var playerName = 'CHRIS';
      var playerGender = 'BOY';

      function setStatus(msg) {
        console.log('[Buddymon]', msg);
      }

      // Light-dismiss dialog
      var menuDialog = document.getElementById('menuDialog');
      if (menuDialog && !('closedBy' in HTMLDialogElement.prototype)) {
        menuDialog.addEventListener('click', function(event) {
          if (event.target !== menuDialog) return;
          var rect = menuDialog.getBoundingClientRect();
          var inside = (
            rect.top <= event.clientY &&
            event.clientY <= rect.top + rect.height &&
            rect.left <= event.clientX &&
            event.clientX <= rect.left + rect.width
          );
          if (!inside) menuDialog.close();
        });
      }

      document.getElementById('btnMenu').addEventListener('click', function() {
        menuDialog.showModal();
      });

      // HD Mode Toggle
      var btnHdMode = document.getElementById('btnHdMode');
      var hdBadge = document.getElementById('hdBadge');
      window.__HD_MODE__ = 'on';

      function setHdMode(on) {
        if (on) {
          window.__HD_MODE__ = 'on';
          document.body.classList.remove('hd-off');
          document.body.classList.add('hd-on');
          btnHdMode.textContent = 'HD: ON';
          btnHdMode.classList.add('active');
          if (hdBadge) hdBadge.textContent = 'Buddymon HD';
          document.getElementById('gameTitleText').textContent = 'Buddymon';
          if (currentHdScene !== 'game') {
            hdStage.style.display = 'block';
            renderHdScene();
          } else {
            hdStage.style.display = 'none';
          }
          setStatus('Buddymon HD Mode Active (Pixel 9 Full Screen)');
        } else {
          window.__HD_MODE__ = 'off';
          document.body.classList.remove('hd-on');
          document.body.classList.add('hd-off');
          btnHdMode.textContent = 'HD: OFF (Normal)';
          btnHdMode.classList.remove('active');
          if (hdBadge) hdBadge.textContent = 'Buddymon Crystal';
          document.getElementById('gameTitleText').textContent = 'Buddymon Crystal';
          hdStage.style.display = 'none';
          canvas.style.display = 'block';
          if (GameBoyEmulatorInitialized() && window.__renderHDFrame) window.__renderHDFrame(gameboy);
          setStatus('Normal Graphics Mode (Default Buddymon Crystal 160x144)');
        }
      }

      btnHdMode.addEventListener('click', function() {
        setHdMode(window.__HD_MODE__ !== 'on');
      });

      // Sound toggle
      var btnSound = document.getElementById('btnSound');
      btnSound.addEventListener('click', function() {
        resumeWebAudioIfNeeded();
        settings[0] = !settings[0];
        if (GameBoyEmulatorInitialized()) gameboy.initSound();
        btnSound.textContent = settings[0] ? 'Audio: ON' : 'Audio: OFF';
      });

      // 2. Mobile Robust Storage (IndexedDB + localStorage fallback)
      var idbStore = (function() {
        var dbPromise = null;
        function getDB() {
          if (!dbPromise) {
            dbPromise = new Promise(function(resolve, reject) {
              if (!window.indexedDB) { resolve(null); return; }
              var req = indexedDB.open('buddymon_saves', 1);
              req.onupgradeneeded = function(e) {
                var db = e.target.result;
                if (!db.objectStoreNames.contains('states')) {
                  db.createObjectStore('states');
                }
              };
              req.onsuccess = function(e) { resolve(e.target.result); };
              req.onerror = function() { resolve(null); };
            });
          }
          return dbPromise;
        }

        return {
          set: async function(key, val) {
            try {
              if (window.localStorage) {
                try { localStorage.setItem(key, JSON.stringify(val)); } catch (_) {}
              }
              var db = await getDB();
              if (db) {
                return new Promise(function(resolve) {
                  var tx = db.transaction('states', 'readwrite');
                  tx.objectStore('states').put(val, key);
                  tx.oncomplete = function() { resolve(true); };
                  tx.onerror = function() { resolve(false); };
                });
              }
            } catch (_) {}
            return false;
          },
          get: async function(key) {
            try {
              var db = await getDB();
              if (db) {
                var res = await new Promise(function(resolve) {
                  var tx = db.transaction('states', 'readonly');
                  var req = tx.objectStore('states').get(key);
                  req.onsuccess = function() { resolve(req.result); };
                  req.onerror = function() { resolve(null); };
                });
                if (res !== undefined && res !== null) return res;
              }
              if (window.localStorage) {
                var item = localStorage.getItem(key);
                if (item) return JSON.parse(item);
              }
            } catch (_) {}
            return null;
          }
        };
      })();

      async function quickSaveState() {
        if (currentHdScene === 'bedroom') {
          saveBedroomProgress();
          setStatus('Room state saved successfully! (' + new Date().toLocaleTimeString() + ')');
          return;
        }
        if (currentHdScene === 'house1f') {
          save1FProgress();
          setStatus('House state saved successfully! (' + new Date().toLocaleTimeString() + ')');
          return;
        }
        if (!GameBoyEmulatorInitialized()) return;
        try {
          var st = gameboy.saveState();
          st[0] = [];
          var key = 'QUICK_STATE_' + (gameboy.name || 'buddymon');
          await idbStore.set(key, st);
          await idbStore.set('BUDDYMON_ACTIVE_STATE', st);
          localStorage.setItem('BUDDYMON_ACTIVE_SAVE', 'true');
          saveSRAM();
          setStatus('State saved successfully! (' + new Date().toLocaleTimeString() + ')');
        } catch (err) {
          setStatus('Save error: ' + err.message);
        }
      }

      async function quickLoadState() {
        var activeScene = localStorage.getItem('BUDDYMON_ACTIVE_SCENE') || 'bedroom';
        if (activeScene === 'bedroom' || activeScene === 'house1f') {
          handleContinueGame();
          return;
        }
        if (!loadedRomUint8) return;
        try {
          var key = 'QUICK_STATE_' + (gameboy ? gameboy.name : 'buddymon');
          var st = await idbStore.get(key);
          if (!st) {
            st = await idbStore.get('BUDDYMON_ACTIVE_STATE');
          }
          if (!st) { setStatus('No saved state found.'); return; }
          clearLastEmulation();
          st[0] = loadedRomUint8;
          gameboy = new GameBoyCore(canvas, loadedRomBinaryString);
          gameboy.openMBC = openSRAM;
          gameboy.openRTC = openRTC;
          gameboy.returnFromState(st);
          run();
          if (currentSpeed !== 1) gameboy.setSpeed(currentSpeed);
          currentHdScene = 'game';
          renderHdScene();
          setStatus('State loaded successfully!');
        } catch (err) {
          setStatus('Load error: ' + err.message);
        }
      }

      async function handleContinueGame() {
        window.__handleContinueGame = handleContinueGame;
        if (!loadedRomUint8) {
          setStatus('Engine not ready yet');
          return;
        }

        var savedGender = localStorage.getItem('BUDDYMON_PLAYER_GENDER');
        if (savedGender) playerGender = savedGender;
        var savedName = localStorage.getItem('BUDDYMON_PLAYER_NAME');
        if (savedName) playerName = savedName;

        var activeScene = localStorage.getItem('BUDDYMON_ACTIVE_SCENE') || 'bedroom';

        if (activeScene === 'bedroom') {
          currentHdScene = 'bedroom';
          try {
            var pos = JSON.parse(localStorage.getItem('BUDDYMON_BEDROOM_POS'));
            if (pos && typeof pos.x === 'number') {
              bedroomPlayer.x = pos.x;
              bedroomPlayer.y = pos.y;
              bedroomPlayer.dir = pos.dir || 'down';
            }
          } catch (_) {}
          bedroomDialog = null;
          renderHdScene();
          setStatus('Welcome back to your room, ' + playerName + '!');
          return;
        }

        if (activeScene === 'house1f') {
          currentHdScene = 'house1f';
          try {
            var pos1f = JSON.parse(localStorage.getItem('BUDDYMON_HOUSE1F_POS'));
            if (pos1f && typeof pos1f.x === 'number') {
              house1FPlayer.x = pos1f.x;
              house1FPlayer.y = pos1f.y;
              house1FPlayer.dir = pos1f.dir || 'down';
            }
          } catch (_) {}
          house1FDialog = null;
          renderHdScene();
          setStatus('Welcome home, ' + playerName + '!');
          return;
        }

        setStatus('Resuming Buddymon...');
        try {
          var key = 'QUICK_STATE_' + (gameboy ? gameboy.name : 'buddymon');
          var st = await idbStore.get(key);
          if (!st) {
            st = await idbStore.get('BUDDYMON_ACTIVE_STATE');
          }
          if (!st) {
            var rawJson = await decompressGzipText(window.__BEDROOM_STATE_GZ_B64__);
            st = JSON.parse(rawJson);
          }
          clearLastEmulation();
          st[0] = loadedRomUint8;
          gameboy = new GameBoyCore(canvas, loadedRomBinaryString);
          gameboy.openMBC = openSRAM;
          gameboy.openRTC = openRTC;
          gameboy.returnFromState(st);
          run();
          if (currentSpeed !== 1) gameboy.setSpeed(currentSpeed);
          currentHdScene = 'game';
          renderHdScene();
          setStatus('Buddymon resumed!');
        } catch (err) {
          console.error('Failed to continue game:', err);
          setStatus('Resume failed: ' + err.message);
        }
      }

      document.getElementById('btnQuickSave').addEventListener('click', quickSaveState);
      document.getElementById('btnQuickLoad').addEventListener('click', quickLoadState);

      // Fullscreen
      document.getElementById('btnFullscreen').addEventListener('click', function() {
        var el = document.documentElement;
        if (!document.fullscreenElement) {
          if (el.requestFullscreen) el.requestFullscreen();
        } else {
          if (document.exitFullscreen) document.exitFullscreen();
        }
      });

      // Export/Import .SAV
      document.getElementById('btnExportSav').addEventListener('click', function() {
        if (!GameBoyEmulatorInitialized()) return;
        saveSRAM();
        var sramArr = gameboy.saveSRAMState();
        if (!sramArr || !sramArr.length) { setStatus('No SRAM data yet.'); return; }
        var u8 = new Uint8Array(sramArr);
        var a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([u8], { type: 'application/octet-stream' }));
        a.download = (gameboy.name || 'buddymon') + '.sav';
        a.click();
      });

      document.getElementById('inputImportSav').addEventListener('change', function(e) {
        var file = e.target.files && e.target.files[0];
        if (!file || !GameBoyEmulatorInitialized()) return;
        var reader = new FileReader();
        reader.onload = function() {
          var u8 = new Uint8Array(reader.result);
          var arr = [];
          for (var i = 0; i < u8.length; i++) arr.push(u8[i]);
          setValue('B64_SRAM_' + gameboy.name, arrayToBase64(arr));
          bootRomBytes(loadedRomUint8);
          menuDialog.close();
          setStatus('Imported ' + file.name);
        };
        reader.readAsArrayBuffer(file);
      });

      // 3. Automatic Device Clock Setup (Bypasses "What time is it?" question!)
      function autoSetDeviceClock() {
        var now = new Date();
        var dayOfWeek = now.getDay(); // 0 = Sun .. 6 = Sat
        var hours = now.getHours();
        var minutes = now.getMinutes();
        var seconds = now.getSeconds();

        // Seed RTC in emulator
        if (GameBoyEmulatorInitialized() && gameboy.cTIMER) {
          try {
            gameboy.RTCSeconds = seconds;
            gameboy.RTCMinutes = minutes;
            gameboy.RTCHours = hours;
            gameboy.RTCDays = dayOfWeek;
            gameboy.latchedSeconds = seconds;
            gameboy.latchedMinutes = minutes;
            gameboy.latchedHours = hours;
            gameboy.latchedDays = dayOfWeek;
          } catch (_) {}
        }
        setValue("RTC_" + (gameboy ? gameboy.name : "buddymon"), [0, 0, seconds, minutes, hours, dayOfWeek, 0]);
      }

      // Buddymon Naming Screen (YOUR NAME?)
      var nameInputBuffer = '';
      var nameGridRow = 0;
      var nameGridCol = 0;
      var nameCaseUpper = true;

      var NAME_GRID_UPPER = [
        ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
        ['J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'],
        ['S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', ' '],
        ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
        ['lower', 'DEL', 'END']
      ];

      var NAME_GRID_LOWER = [
        ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'],
        ['j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r'],
        ['s', 't', 'u', 'v', 'w', 'x', 'y', 'z', ' '],
        ['0', '?', '!', '.', ',', '-', '/', '(', ')'],
        ['UPPER', 'DEL', 'END']
      ];

      function openNameDialog() {
        nameInputBuffer = '';
        nameGridRow = 0;
        nameGridCol = 0;
        nameCaseUpper = true;
        currentHdScene = 'naming';
        renderHdScene();
      }

      function confirmEnteredName() {
        var finalName = nameInputBuffer.trim().slice(0, 7);
        if (!finalName) {
          finalName = (playerGender === 'GIRL') ? 'KRIS' : 'CHRIS';
        }
        playerName = finalName;
        currentHdScene = 'prof';
        profStep = 11;
        renderHdScene();
      }

      function cancelNameEntry() {
        currentHdScene = 'prof';
        profStep = 10;
        hdNameChoiceIndex = 0;
        renderHdScene();
      }

      // Options Configuration
      var hdOptionsList = [
        { key: 'textSpeed', label: 'TEXT SPEED', values: ['FAST', 'MID', 'SLOW'], index: 0 },
        { key: 'battleScene', label: 'BATTLE SCENE', values: ['ON', 'OFF'], index: 0 },
        { key: 'battleStyle', label: 'BATTLE STYLE', values: ['SHIFT', 'SET'], index: 0 },
        { key: 'sound', label: 'SOUND', values: ['STEREO', 'MONO'], index: 0 },
        { key: 'print', label: 'PRINT', values: ['NORMAL', 'LIGHT', 'DARK'], index: 0 },
        { key: 'menuAccount', label: 'MENU ACCOUNT', values: ['ON', 'OFF'], index: 0 },
        { key: 'frame', label: 'FRAME', values: ['TYPE 1', 'TYPE 2', 'TYPE 3', 'TYPE 4', 'TYPE 5', 'TYPE 6', 'TYPE 7', 'TYPE 8'], index: 0 },
        { key: 'back', label: 'BACK TO MENU', values: [''], index: 0, isBack: true }
      ];

      function applyOptionChange(key, val) {
        if (key === 'sound') {
          settings[0] = (val === 'STEREO');
          if (GameBoyEmulatorInitialized()) gameboy.initSound();
          var btnSound = document.getElementById('btnSound');
          if (btnSound) btnSound.textContent = settings[0] ? 'Audio: ON' : 'Audio: OFF';
        }
      }

      // Gen 2 Name Encoding
      var GEN2_CHAR_MAP = {
        'A': 0x80, 'B': 0x81, 'C': 0x82, 'D': 0x83, 'E': 0x84, 'F': 0x85, 'G': 0x86, 'H': 0x87, 'I': 0x88, 'J': 0x89,
        'K': 0x8A, 'L': 0x8B, 'M': 0x8C, 'N': 0x8D, 'O': 0x8E, 'P': 0x8F, 'Q': 0x90, 'R': 0x91, 'S': 0x92, 'T': 0x93,
        'U': 0x94, 'V': 0x95, 'W': 0x96, 'X': 0x97, 'Y': 0x98, 'Z': 0x99,
        'a': 0xA0, 'b': 0xA1, 'c': 0xA2, 'd': 0xA3, 'e': 0xA4, 'f': 0xA5, 'g': 0xA6, 'h': 0xA7, 'i': 0xA8, 'j': 0xA9,
        'k': 0xAA, 'l': 0xAB, 'm': 0xAC, 'n': 0xAD, 'o': 0xAE, 'p': 0xAF, 'q': 0xB0, 'r': 0xB1, 's': 0xB2, 't': 0xB3,
        'u': 0xB4, 'v': 0xB5, 'w': 0xB6, 'x': 0xB7, 'y': 0xB8, 'z': 0xB9,
        '0': 0xF6, '1': 0xF7, '2': 0xF8, '3': 0xF9, '4': 0xFA, '5': 0xFB, '6': 0xFC, '7': 0xFD, '8': 0xFE, '9': 0xFF,
        ' ': 0x7F, '-': 0xE3, '.': 0xE8, ',': 0xF4, '!': 0xE7, '?': 0xE6
      };

      function encodeGen2Name(str) {
        var bytes = new Array(11);
        for (var i = 0; i < 11; i++) bytes[i] = 0x50;
        var s = (str || 'CHRIS').slice(0, 7);
        for (var k = 0; k < s.length; k++) {
          bytes[k] = GEN2_CHAR_MAP[s[k]] || 0x7F;
        }
        return bytes;
      }

      async function decompressGzipText(b64) {
        var bin = window.atob(b64);
        var bytes = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        var ds = new DecompressionStream('gzip');
        var writer = ds.writable.getWriter();
        writer.write(bytes);
        writer.close();
        var resp = new Response(ds.readable);
        return await resp.text();
      }

      // Buddymon HD Bedroom State & Logic
      var bedroomPlayer = {
        x: 170,
        y: 180,
        dir: 'down',
        step: 0
      };
      var bedroomDialog = null;
      var bedroomStepTimer = null;

      function canMoveTo(nx, ny) {
        // Tight boundaries directly touching baseboards (zero empty gap)
        if (nx < 4 || nx > 364) return false;
        if (ny < 96 || ny > 296) return false;

        // Bed: x: 4..86, y: 60..136 (player can walk right up to foot of bed at 138)
        if (nx <= 86 && ny < 138) return false;

        // Radio / Nightstand: x: 86..124, y: 60..98
        if (nx > 86 && nx < 124 && ny < 98) return false;

        // Desk & PC: x: 124..216, y: 60..98 (player walks right up to front of desk at 98)
        if (nx >= 124 && nx < 216 && ny < 98) return false;

        // Bookshelf against Left Wall: x: 4..24, y: 134..226 (player walks right up to side panel at 24)
        if (nx < 24 && ny >= 134 && ny <= 226) return false;

        // Monstera plant at bottom right: x >= 324, y >= 256
        if (nx >= 324 && ny >= 256) return false;

        return true;
      }

      function playChime(freq) {
        try {
          resumeWebAudioIfNeeded();
          if (!audioContextHandle) return;
          var osc = audioContextHandle.createOscillator();
          var gain = audioContextHandle.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, audioContextHandle.currentTime);
          osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audioContextHandle.currentTime + 0.15);
          gain.gain.setValueAtTime(0.12, audioContextHandle.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioContextHandle.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(audioContextHandle.destination);
          osc.start();
          osc.stop(audioContextHandle.currentTime + 0.36);
        } catch (_) {}
      }

      function saveBedroomProgress() {
        localStorage.setItem('BUDDYMON_ACTIVE_SCENE', currentHdScene);
        localStorage.setItem('BUDDYMON_BEDROOM_POS', JSON.stringify({
          x: bedroomPlayer.x,
          y: bedroomPlayer.y,
          dir: bedroomPlayer.dir
        }));
        localStorage.setItem('BUDDYMON_ACTIVE_SAVE', 'true');
        localStorage.setItem('BUDDYMON_PLAYER_GENDER', playerGender);
        localStorage.setItem('BUDDYMON_PLAYER_NAME', playerName);
      }

      var bedroomWalkFlip = 0;
      function moveBedroomPlayer(dir) {
        if (bedroomDialog) {
          bedroomDialog = null;
          renderHdScene();
          return;
        }

        var dx = 0, dy = 0;
        var STEP = 16;
        if (dir === 'up') dy = -STEP;
        else if (dir === 'down') dy = STEP;
        else if (dir === 'left') dx = -STEP;
        else if (dir === 'right') dx = STEP;

        bedroomPlayer.dir = dir;
        var nx = bedroomPlayer.x + dx;
        var ny = bedroomPlayer.y + dy;

        // Stepping into stairs (top right landing: x >= 316, y <= 96)
        if (nx >= 316 && ny <= 96) {
          bedroomPlayer.x = nx;
          bedroomPlayer.y = ny;
          renderHdScene();
          warpDownTo1F();
          return;
        }

        if (!canMoveTo(nx, ny)) {
          // Slide along obstacle if one axis is free
          if (dx !== 0 && canMoveTo(bedroomPlayer.x, ny)) {
            bedroomPlayer.y = ny;
          } else if (dy !== 0 && canMoveTo(nx, bedroomPlayer.y)) {
            bedroomPlayer.x = nx;
          } else {
            bedroomPlayer.step = 0;
            renderHdScene();
            return;
          }
        } else {
          bedroomPlayer.x = nx;
          bedroomPlayer.y = ny;
        }

        // Alternate both legs and both arms (1 -> 2 -> 1 -> 2)
        bedroomWalkFlip = 1 - bedroomWalkFlip;
        bedroomPlayer.step = bedroomWalkFlip + 1;
        renderHdScene();
        saveBedroomProgress();

        if (bedroomStepTimer) clearTimeout(bedroomStepTimer);
        bedroomStepTimer = setTimeout(function() {
          bedroomPlayer.step = 0;
          renderHdScene();
        }, 220);
      }

      function interactBedroom() {
        if (bedroomDialog) {
          bedroomDialog = null;
          renderHdScene();
          return;
        }

        var px = bedroomPlayer.x;
        var py = bedroomPlayer.y;
        var dir = bedroomPlayer.dir;

        // Stairs
        if (px >= 310 && py <= 104) {
          warpDownTo1F();
          return;
        }
        // Bed: near foot of bed facing up, or alongside bed facing left
        if ((dir === 'up' && px <= 90 && py <= 154) || (dir === 'left' && px <= 98 && py <= 140)) {
          playChime(660);
          bedroomDialog = { tag: 'BED', text: 'A warm, inviting bed! Took a quick power nap. You feel fully refreshed!' };
          saveBedroomProgress();
          renderHdScene();
          return;
        }
        // Radio: facing up near nightstand
        if (dir === 'up' && px >= 84 && px <= 126 && py <= 116) {
          playChime(440);
          bedroomDialog = { tag: 'RADIO', text: "♪ The radio is playing the New Bark Town melody! Oak's Buddymon Talk will air shortly." };
          renderHdScene();
          return;
        }
        // PC Desk: facing up right at the front of desk
        if (dir === 'up' && px >= 124 && px <= 220 && py <= 116) {
          playChime(520);
          bedroomDialog = { tag: 'BUDDYMON PC', text: 'Buddymon Storage System — Storage & Mail checked. 0 Buddymon stored. All systems online!' };
          renderHdScene();
          return;
        }
        // Bookshelf on left wall
        if (dir === 'left' && px <= 36 && py >= 130 && py <= 236) {
          bedroomDialog = { tag: 'BOOKSHELF', text: "A collection of adventure books: 'Buddymon Types & Habitats', and 'The Legend of the Golden Moon'." };
          renderHdScene();
          return;
        }
        // Potted plant
        if ((dir === 'right' && px >= 300 && py >= 240) || (dir === 'down' && px >= 310 && py >= 240)) {
          bedroomDialog = { tag: 'PLANT', text: 'A healthy Monstera plant. Its lush green leaves soak up the morning sunlight.' };
          renderHdScene();
          return;
        }
        // Window above desk
        if (dir === 'up' && px >= 130 && px <= 216 && py <= 100) {
          bedroomDialog = { tag: 'WINDOW', text: 'The morning sun warms the room. Down in the yard, wild Buddymon are playing happily.' };
          renderHdScene();
          return;
        }
        // Town map above bed
        if (dir === 'up' && px <= 88 && py <= 100) {
          bedroomDialog = { tag: 'TOWN MAP', text: 'A colorful map of the Johto region! So many towns, routes, and Buddymon to discover!' };
          renderHdScene();
          return;
        }
      }

      // Enter HD Bedroom Scene
      function startBedroomGame() {
        currentHdScene = 'bedroom';
        bedroomPlayer.x = 170;
        bedroomPlayer.y = 180;
        bedroomPlayer.dir = 'down';
        bedroomPlayer.step = 0;
        bedroomDialog = null;
        renderHdScene();
        saveBedroomProgress();
        setStatus('Welcome to your room, ' + playerName + '!');
      }

      window.__getHdScene = function() { return currentHdScene; };
      window.__getGameboy = function() { return gameboy; };
      window.__setHdScene = function(s) { currentHdScene = s; renderHdScene(); };
      window.__bedroomPlayer = bedroomPlayer;
      window.__moveBedroomPlayer = moveBedroomPlayer;
      window.__interactBedroom = interactBedroom;
      window.__startBedroomGame = startBedroomGame;
      window.__setGender = function(g) { playerGender = g; };
      window.__setName = function(n) { playerName = n; };

      // Buddymon HD House 1F State & Logic
      var house1FPlayer = {
        x: 320,
        y: 104,
        dir: 'down',
        step: 0
      };
      var momNpc = {
        x: 154,
        y: 172,
        dir: 'left',
        step: 0
      };
      var neighborNpc = {
        x: 74,
        y: 172,
        dir: 'right',
        step: 0
      };
      var momAlertActive = false;
      var hasReceivedBuddygear = (localStorage.getItem('BUDDYMON_GEAR_RECEIVED') === 'true');
      var momDialogueIndex = 0;
      var house1FDialog = null;
      var house1FStepTimer = null;
      var house1FWalkFlip = 0;

      window.__house1FPlayer = house1FPlayer;
      window.__momNpc = momNpc;
      window.__neighborNpc = neighborNpc;
      window.__moveHouse1FPlayer = moveHouse1FPlayer;
      window.__interactHouse1F = interactHouse1F;
      window.__interactHouse1FNeighbor = interactHouse1FNeighbor;
      window.__warpOutToTown = warpOutToTown;
      window.__switchScene = function(sc) { currentHdScene = sc; renderHdScene(); };
      window.__getCurrentHdScene = function() { return currentHdScene; };

      function canMoveTo1F(nx, ny) {
        if (nx < 8 || nx > 364) return false;
        if (ny < 84 || ny > 310) return false;

        // Top-left kitchen counter (Fridge, Sink, Stove): x: 8..136, y: 84..104
        if (nx <= 136 && ny < 104) return false;

        // TV console: x: 136..206, y: 84..104
        if (nx > 136 && nx < 206 && ny < 104) return false;

        // Bookshelf: x: 206..268, y: 84..104
        if (nx >= 206 && nx < 268 && ny < 104) return false;

        // Ficus corner plant: x: 268..310, y: 84..100
        if (nx >= 268 && nx < 310 && ny < 100) return false;

        // Dining Table & Chairs & Mom & Neighbor: x: 64..186, y: 148..206
        if (nx >= 64 && nx <= 186 && ny >= 148 && ny <= 206) return false;

        return true;
      }

      function save1FProgress() {
        localStorage.setItem('BUDDYMON_ACTIVE_SCENE', currentHdScene);
        localStorage.setItem('BUDDYMON_HOUSE1F_POS', JSON.stringify({
          x: house1FPlayer.x,
          y: house1FPlayer.y,
          dir: house1FPlayer.dir
        }));
        localStorage.setItem('BUDDYMON_ACTIVE_SAVE', 'true');
        localStorage.setItem('BUDDYMON_PLAYER_GENDER', playerGender);
        localStorage.setItem('BUDDYMON_PLAYER_NAME', playerName);
        if (hasReceivedBuddygear) {
          localStorage.setItem('BUDDYMON_GEAR_RECEIVED', 'true');
        }
      }

      function moveHouse1FPlayer(dir) {
        if (house1FDialog) {
          advanceHouse1FDialog();
          return;
        }

        var dx = 0, dy = 0;
        var STEP = 16;
        if (dir === 'up') dy = -STEP;
        else if (dir === 'down') dy = STEP;
        else if (dir === 'left') dx = -STEP;
        else if (dir === 'right') dx = STEP;

        house1FPlayer.dir = dir;
        var nx = house1FPlayer.x + dx;
        var ny = house1FPlayer.y + dy;

        // Stepping into stairs back up to 2F bedroom (top right: x >= 316, y <= 96)
        if (nx >= 316 && ny <= 96) {
          house1FPlayer.x = nx;
          house1FPlayer.y = ny;
          renderHdScene();
          warpUpTo2F();
          return;
        }

        // Stepping through front doors (bottom center: x: 170..230, y >= 300)
        if (nx >= 170 && nx <= 230 && ny >= 300) {
          house1FPlayer.x = nx;
          house1FPlayer.y = ny;
          renderHdScene();
          warpOutToTown();
          return;
        }

        // Automatic Mom Stop: If player hasn't received Buddygear, Mom intercepts them when walking past!
        if (!hasReceivedBuddygear && (ny >= 130 || nx <= 280)) {
          momNpc.dir = (house1FPlayer.x > momNpc.x) ? 'right' : 'left';
          momAlertActive = true;
          playChime(660);
          momDialogueIndex = 0;
          house1FDialog = getMomSequence()[0];
          renderHdScene();
          return;
        }

        if (!canMoveTo1F(nx, ny)) {
          if (dx !== 0 && canMoveTo1F(house1FPlayer.x, ny)) {
            house1FPlayer.y = ny;
          } else if (dy !== 0 && canMoveTo1F(nx, house1FPlayer.y)) {
            house1FPlayer.x = nx;
          } else {
            house1FPlayer.step = 0;
            renderHdScene();
            return;
          }
        } else {
          house1FPlayer.x = nx;
          house1FPlayer.y = ny;
        }

        house1FWalkFlip = 1 - house1FWalkFlip;
        house1FPlayer.step = house1FWalkFlip + 1;
        renderHdScene();
        save1FProgress();

        if (house1FStepTimer) clearTimeout(house1FStepTimer);
        house1FStepTimer = setTimeout(function() {
          house1FPlayer.step = 0;
          renderHdScene();
        }, 220);
      }

      function getMomSequence() {
        return [
          { tag: 'MOM', text: 'Oh, ' + playerName + '…! Our neighbor, PROF. ELM, was looking for you.', _momSequence: true },
          { tag: 'MOM', text: 'He said he wanted you to do something for him.', _momSequence: true },
          { tag: 'MOM', text: 'Oh! I almost forgot! Your BUDDYMON GEAR is back from the repair shop. Here you go!', _momSequence: true },
          { tag: 'BUDDYGEAR', text: '★ ' + playerName + ' received the BUDDYGEAR!', _momSequence: true },
          { tag: 'MOM', text: "BUDDYMON GEAR, or just BUDDYGEAR. It's essential if you want to be a good trainer.", _momSequence: true },
          { tag: 'MOM', text: "Oh, the day of the week isn't set. You mustn't forget that!", _momSequence: true },
          { tag: 'MOM', text: "Phone numbers are stored in memory. Just choose a name you want to call. Gee, isn't that convenient?", _momSequence: true }
        ];
      }

      function advanceHouse1FDialog() {
        if (house1FDialog && house1FDialog._momSequence) {
          momDialogueIndex++;
          var seq = getMomSequence();
          if (momDialogueIndex < seq.length) {
            house1FDialog = seq[momDialogueIndex];
            renderHdScene();
            return;
          } else {
            house1FDialog = null;
            momAlertActive = false;
            momNpc.dir = 'left';
            neighborNpc.dir = 'right';
            hasReceivedBuddygear = true;
            localStorage.setItem('BUDDYMON_GEAR_RECEIVED', 'true');
            save1FProgress();
            renderHdScene();
            return;
          }
        }
        if (house1FDialog && house1FDialog.tag === 'NEIGHBOR') {
          neighborNpc.dir = 'right';
        }
        house1FDialog = null;
        momAlertActive = false;
        renderHdScene();
      }

      var neighborTalkStep = 0;
      function interactHouse1FNeighbor() {
        if (house1FDialog) {
          advanceHouse1FDialog();
          return;
        }
        neighborNpc.dir = (house1FPlayer.x > neighborNpc.x) ? 'right' : 'left';
        playChime(540);
        if (neighborTalkStep === 0) {
          house1FDialog = {
            tag: 'NEIGHBOR',
            text: "Good morning, " + playerName + "! I'm visiting!"
          };
          neighborTalkStep = 1;
        } else {
          house1FDialog = {
            tag: 'NEIGHBOR',
            text: playerName + ", have you heard? My daughter is adamant about becoming PROF. ELM's assistant. She really loves BUDDYMON!"
          };
          neighborTalkStep = 0;
        }
        renderHdScene();
      }

      function interactHouse1F() {
        if (house1FDialog) {
          advanceHouse1FDialog();
          return;
        }

        var px = house1FPlayer.x;
        var py = house1FPlayer.y;
        var dir = house1FPlayer.dir;

        // Neighbor (at x: 74, y: 172)
        var distToNeighbor = Math.hypot(px - neighborNpc.x, py - neighborNpc.y);
        if (distToNeighbor <= 44) {
          interactHouse1FNeighbor();
          return;
        }

        // Mom (at x: 154, y: 172)
        var distToMom = Math.hypot(px - momNpc.x, py - momNpc.y);
        if (distToMom <= 44) {
          if (px > momNpc.x + 8) momNpc.dir = 'right';
          else if (px < momNpc.x - 8) momNpc.dir = 'left';
          else if (py > momNpc.y) momNpc.dir = 'down';
          else momNpc.dir = 'up';

          playChime(580);
          if (!hasReceivedBuddygear) {
            momAlertActive = true;
            momDialogueIndex = 0;
            house1FDialog = getMomSequence()[0];
          } else {
            house1FDialog = { tag: 'MOM', text: "PROF. ELM is waiting for you. Hurry up, baby!" };
          }
          renderHdScene();
          return;
        }

        // Stairs
        if (px >= 310 && py <= 104) {
          warpUpTo2F();
          return;
        }

        // Front Door
        if (px >= 170 && px <= 230 && py >= 288) {
          warpOutToTown();
          return;
        }

        // TV
        if (dir === 'up' && px >= 140 && px <= 206 && py <= 120) {
          playChime(440);
          house1FDialog = { tag: 'TV', text: "There's a movie on TV: Stars dot the sky as two boys ride on a train… I'd better get rolling too!" };
          renderHdScene();
          return;
        }

        // Fridge
        if ((dir === 'up' || dir === 'left') && px <= 54 && py <= 116) {
          playChime(520);
          house1FDialog = { tag: 'FRIDGE', text: "Let's see what's in the fridge… FRESH WATER and tasty LEMONADE!" };
          renderHdScene();
          return;
        }

        // Sink
        if (dir === 'up' && px >= 50 && px <= 94 && py <= 116) {
          house1FDialog = { tag: 'SINK', text: "The sink is spotless. Mom likes it clean." };
          renderHdScene();
          return;
        }

        // Stove
        if (dir === 'up' && px >= 90 && px <= 140 && py <= 116) {
          playChime(480);
          house1FDialog = { tag: 'STOVE', text: "Mom's specialty! CINNABAR VOLCANO BURGER!" };
          renderHdScene();
          return;
        }

        // Bookshelf
        if (dir === 'up' && px >= 204 && px <= 268 && py <= 116) {
          house1FDialog = { tag: 'BOOKSHELF', text: "A collection of cookbooks, home decor magazines, and Buddymon care guides." };
          renderHdScene();
          return;
        }

        // Table
        if (px >= 80 && px <= 140 && py >= 140 && py <= 200) {
          house1FDialog = { tag: 'DINING TABLE', text: "A cozy dining table with a freshly brewed pot of berry tea and two cups." };
          renderHdScene();
          return;
        }
      }

      function warpDownTo1F() {
        bedroomDialog = { tag: 'STAIRS', text: 'Heading downstairs to 1F...' };
        renderHdScene();

        setTimeout(function() {
          bedroomDialog = null;
          currentHdScene = 'house1f';
          house1FPlayer.x = 320;
          house1FPlayer.y = 104;
          house1FPlayer.dir = 'down';
          house1FPlayer.step = 0;
          renderHdScene();
          save1FProgress();
          setStatus('Downstairs living room');
        }, 300);
      }

      function warpUpTo2F() {
        house1FDialog = { tag: 'STAIRS', text: 'Heading upstairs to your bedroom...' };
        renderHdScene();

        setTimeout(function() {
          house1FDialog = null;
          currentHdScene = 'bedroom';
          bedroomPlayer.x = 320;
          bedroomPlayer.y = 104;
          bedroomPlayer.dir = 'down';
          bedroomPlayer.step = 0;
          renderHdScene();
          saveBedroomProgress();
          setStatus('Back in your room!');
        }, 300);
      }

      async function warpOutToTown() {
        if (!hasReceivedBuddygear) {
          momNpc.dir = (house1FPlayer.x > momNpc.x) ? 'right' : 'left';
          momAlertActive = true;
          house1FDialog = { tag: 'MOM', text: playerName + '! Wait! Come speak with me before you head out!' };
          renderHdScene();
          return;
        }

        house1FDialog = { tag: 'DOOR', text: 'Stepping outside into New Bark Town...' };
        renderHdScene();

        setTimeout(async function() {
          try {
            if (!loadedRomUint8) return;
            var rawJson = await decompressGzipText(window.__NEW_BARK_TOWN_STATE_GZ_B64__);
            var st = JSON.parse(rawJson);
            var isGirl = (playerGender === 'GIRL');
            if (st[23] && st[23].length > 1138) {
              st[23][1138] = isGirl ? 1 : 0;
            }
            var encodedName = encodeGen2Name(playerName);
            if (st[23] && st[23].length > 1159) {
              for (var i = 0; i < 11; i++) {
                st[23][1149 + i] = encodedName[i];
              }
            }
            clearLastEmulation();
            st[0] = loadedRomUint8;
            gameboy = new GameBoyCore(canvas, loadedRomBinaryString);
            gameboy.openMBC = openSRAM;
            gameboy.openRTC = openRTC;
            gameboy.returnFromState(st);
            run();
            if (currentSpeed !== 1) gameboy.setSpeed(currentSpeed);
            saveSRAM();

            hasBeenIn1F = true;
            upstairsWarpCooldown = Date.now() + 5000;
            currentHdScene = 'game';
            renderHdScene();
            localStorage.setItem('BUDDYMON_ACTIVE_SCENE', 'game');
            setStatus('New Bark Town');
          } catch (err) {
            console.error('Failed to exit house:', err);
          }
        }, 400);
      }

      // 4. Buddymon HD Scene Renderer
      var introTimer = null;
      function resetIntroTimer() {
        if (introTimer) { clearTimeout(introTimer); introTimer = null; }
        if (currentHdScene === 'intro') {
          introTimer = setTimeout(function() {
            if (currentHdScene === 'intro') {
              currentHdScene = 'title';
              renderHdScene();
            }
          }, 24500);
        }
      }

      function renderHdScene() {
        window.__renderHdScene = renderHdScene;
        if (window.__HD_MODE__ !== 'on') return;

        resetIntroTimer();

        if (currentHdScene !== 'game') {
          hdStage.style.display = 'block';
        }

        if (currentHdScene === 'intro') {
          hdStage.innerHTML = \`
            <div class="scene intro">
              <div class="act" style="--i:0">
                \${Art.introSea()}
                <div class="swim s1">\${Art.chomplet()}</div>
                <div class="swim s2">\${Art.chomplet()}</div>
                <div class="swim s3">\${Art.chomplet()}</div>
                \${Array.from({length: 14}, function(_, i) {
                  return '<i class="bub" style="--x:' + ((i * 71) % 96) + 'cqw;--d:' + ((i % 5) * 0.7) + 's;--s:' + (1.4 + (i % 4)) + 'cqw"></i>';
                }).join('')}
                <p class="cap">Out in the deep blue...</p>
              </div>
              <div class="act" style="--i:1">
                \${Art.introMeadow()}
                <div class="roll"><div>\${Art.bramblet()}</div></div>
                <p class="cap">...across the green meadows...</p>
              </div>
              <div class="act" style="--i:2">
                <div class="nightbg">\${Art.sky()}</div>
                <div class="pop">\${Art.bandit()}</div>
                \${Array.from({length: 18}, function(_, i) {
                  return '<i class="ember" style="--x:' + (30 + ((i * 23) % 40)) + 'cqw;--d:' + ((i % 6) * 0.45) + 's"></i>';
                }).join('')}
                <p class="cap">...under a golden moon...</p>
              </div>
              <div class="act" style="--i:3">
                <div class="burst"></div>
                <div class="jump j1">\${Art.bramblet()}</div>
                <div class="jump j2">\${Art.bandit()}</div>
                <div class="jump j3">\${Art.chomplet()}</div>
                <p class="cap big">...your adventure begins!</p>
              </div>
              <div class="skip">Tap screen or press START to skip</div>
            </div>
          \`;
        } else if (currentHdScene === 'title') {
          hdStage.innerHTML = \`
            <div class="scene title">
              \${Art.sky()}
              <div class="logo">\${Art.logo()}</div>
              <div class="trio">
                <div class="mon m1">\${Art.bramblet()}</div>
                <div class="mon m2">\${Art.bandit()}</div>
                <div class="mon m3">\${Art.chomplet()}</div>
              </div>
              <div class="press" id="btnPressStart">PRESS START</div>
              \${Array.from({length: 14}, function(_, i) {
                return '<i class="fly" style="left:' + ((i * 73) % 100) + '%;top:' + (48 + ((i * 37) % 40)) + '%;animation-delay:' + ((i * 0.7) % 5) + 's"></i>';
              }).join('')}
            </div>
          \`;
        } else if (currentHdScene === 'menu') {
          var hasSave = (localStorage.getItem('BUDDYMON_ACTIVE_SAVE') === 'true') ||
                        findValue('QUICK_STATE_' + (gameboy ? gameboy.name : 'buddymon')) ||
                        findValue('B64_SRAM_' + (gameboy ? gameboy.name : 'buddymon'));
          var items = hasSave ? ['CONTINUE', 'NEW GAME', 'OPTION'] : ['NEW GAME', 'OPTION'];
          if (hdMenuIndex >= items.length) hdMenuIndex = 0;

          hdStage.innerHTML = \`
            <div class="scene menu">
              \${Art.sky()}
              <div class="logo small">\${Art.logo()}</div>
              <ul class="menu-list">
                \${items.map(function(item, idx) {
                  return '<li class="' + (idx === hdMenuIndex ? 'sel' : '') + '" data-menu-idx="' + idx + '"><b></b>' + item + '</li>';
                }).join('')}
              </ul>
            </div>
          \`;
        } else if (currentHdScene === 'options') {
          hdStage.style.display = 'block';
          hdStage.innerHTML = \`
            <div class="scene options">
              <div class="panel-header">OPTION</div>
              <div class="options-container">
                \${hdOptionsList.map(function(o, idx) {
                  if (o.isBack) {
                    return '<div class="opt-row back-row ' + (idx === hdOptionsIndex ? 'sel' : '') + '" data-opt-idx="' + idx + '">' + o.label + '</div>';
                  }
                  return '<div class="opt-row ' + (idx === hdOptionsIndex ? 'sel' : '') + '" data-opt-idx="' + idx + '"><span>' + o.label + '</span><span class="opt-val">' + o.values[o.index] + '</span></div>';
                }).join('')}
              </div>
            </div>
          \`;
        } else if (currentHdScene === 'prof') {
          var speeches = [
            {
              tag: 'BUDDYMON',
              text: 'Are you a boy? Or are you a girl?',
              showGenderSelect: true
            },
            {
              tag: 'PROF. OAK',
              text: 'Hello! Sorry to keep you waiting!',
              showOak: true
            },
            {
              tag: 'PROF. OAK',
              text: 'Welcome to the world of BUDDYMON!',
              showOak: true
            },
            {
              tag: 'PROF. OAK',
              text: 'My name is OAK.<br>People call me the BUDDYMON PROF.',
              showOak: true
            },
            {
              tag: 'PROF. OAK',
              text: 'This world is inhabited by creatures that we call BUDDYMON.',
              showCreature: true
            },
            {
              tag: 'PROF. OAK',
              text: 'People and BUDDYMON live together by supporting each other.',
              showCreature: true
            },
            {
              tag: 'PROF. OAK',
              text: 'Some people play with BUDDYMON, some battle with them.',
              showCreature: true
            },
            {
              tag: 'PROF. OAK',
              text: "But we don't know everything about BUDDYMON yet.",
              showOak: true
            },
            {
              tag: 'PROF. OAK',
              text: "There are still many mysteries to solve.<br>That's why I study BUDDYMON every day.",
              showOak: true
            },
            {
              tag: 'PROF. OAK',
              text: 'Now, what did you say your name was?',
              showHero: true
            },
            {
              tag: 'PROF. OAK',
              text: 'All right. What is your name?',
              showNameSelect: true
            },
            {
              tag: 'PROF. OAK',
              text: '{NAME}, are you ready?',
              showHero: true
            },
            {
              tag: 'PROF. OAK',
              text: 'Your very own BUDDYMON story is about to unfold.',
              showHero: true
            },
            {
              tag: 'PROF. OAK',
              text: "You'll face fun times and tough challenges.",
              showHero: true
            },
            {
              tag: 'PROF. OAK',
              text: "A world of dreams and adventures with BUDDYMON awaits! Let's go!",
              showHero: true
            },
            {
              tag: 'PROF. OAK',
              text: "I'll be seeing you later!",
              showHero: true
            }
          ];

          var step = speeches[Math.min(profStep, speeches.length - 1)];
          var artHtml = '';
          if (step.showCreature) {
            artHtml = '<div class="creature-spot">' + Art.bandit() + '</div>';
          } else if (step.showGenderSelect) {
            artHtml = '<div class="gender-stage">' +
              '<div class="gender-card ' + (playerGender === 'BOY' ? 'active' : '') + '" data-gender="BOY">' +
                '<img src="' + window.__BOY_IMG__ + '" alt="Boy">' +
                '<div class="gender-label">BOY</div>' +
              '</div>' +
              '<div class="gender-card ' + (playerGender === 'GIRL' ? 'active' : '') + '" data-gender="GIRL">' +
                '<img src="' + window.__GIRL_IMG__ + '" alt="Girl">' +
                '<div class="gender-label">GIRL</div>' +
              '</div>' +
            '</div>';
          } else if (step.showNameSelect || step.showHero) {
            var heroImg = (playerGender === 'GIRL') ? window.__GIRL_IMG__ : window.__BOY_IMG__;
            artHtml = '<div class="hero-portrait"><img src="' + heroImg + '" alt="' + playerGender + '"></div>';
          } else if (step.showOak) {
            artHtml = '<div class="prof-portrait"><img src="' + window.__PROF_IMG__ + '" alt="Prof. Oak"></div>';
          }

          var choicesHtml = '';
          if (step.showNameSelect) {
            var nameChoices = ['NEW NAME', (playerGender === 'GIRL' ? 'KRIS' : 'CHRIS'), 'BUDDY', (playerGender === 'GIRL' ? 'LEAF' : 'ASH')];
            choicesHtml = '<div class="choice-box">' +
              nameChoices.map(function(n, idx) {
                return '<button type="button" class="choice-btn ' + (idx === hdNameChoiceIndex ? 'sel' : '') + '" data-name="' + n + '">' + n + '</button>';
              }).join('') + '</div>';
          }

          var stepText = step.text.replace('{NAME}', playerName);

          hdStage.innerHTML = \`
            <div class="scene prof">
              \${artHtml}
              \${choicesHtml}
              <div class="dlg" id="hdDialogueBox">
                <div class="dlg-tag">\${step.tag}</div>
                <p>\${stepText}</p>
                <span class="more">&#9660;</span>
              </div>
            </div>
          \`;
        } else if (currentHdScene === 'naming') {
          var heroImg = (playerGender === 'GIRL') ? window.__GIRL_IMG__ : window.__BOY_IMG__;
          var currentGrid = nameCaseUpper ? NAME_GRID_UPPER : NAME_GRID_LOWER;

          var slotsHtml = '';
          for (var s = 0; s < 7; s++) {
            var charInSlot = (s < nameInputBuffer.length) ? nameInputBuffer[s] : '&nbsp;';
            var isActiveSlot = (s === nameInputBuffer.length);
            slotsHtml += '<div class="naming-slot ' + (isActiveSlot ? 'active' : '') + '">' + charInSlot + '</div>';
          }

          var gridHtml = '';
          for (var r = 0; r < 4; r++) {
            gridHtml += '<div class="naming-row">';
            for (var c = 0; c < 9; c++) {
              var ch = currentGrid[r][c];
              var isCursor = (nameGridRow === r && nameGridCol === c);
              gridHtml += '<button type="button" class="name-key ' + (isCursor ? 'cursor' : '') + '" data-char="' + ch + '" data-r="' + r + '" data-c="' + c + '">' + (ch === ' ' ? '&blank;' : ch) + '</button>';
            }
            gridHtml += '</div>';
          }

          var caseLabel = nameCaseUpper ? 'lower' : 'UPPER';
          var isCaseCur = (nameGridRow === 4 && nameGridCol === 0);
          var isDelCur = (nameGridRow === 4 && nameGridCol === 1);
          var isEndCur = (nameGridRow === 4 && nameGridCol === 2);

          var actionRowHtml = '<div class="naming-row naming-row-actions">' +
            '<button type="button" class="name-key name-key-action name-key-case ' + (isCaseCur ? 'cursor' : '') + '" data-action="case" data-r="4" data-c="0">' + caseLabel + '</button>' +
            '<button type="button" class="name-key name-key-action name-key-del ' + (isDelCur ? 'cursor' : '') + '" data-action="del" data-r="4" data-c="1">DEL</button>' +
            '<button type="button" class="name-key name-key-action name-key-end ' + (isEndCur ? 'cursor' : '') + '" data-action="end" data-r="4" data-c="2">END</button>' +
          '</div>';

          hdStage.innerHTML = \`
            <div class="scene naming">
              <div class="naming-header-card">
                <div class="naming-avatar"><img src="\${heroImg}" alt="Player"></div>
                <div class="naming-info">
                  <div class="naming-title">YOUR NAME?</div>
                  <div class="naming-slots">\${slotsHtml}</div>
                </div>
              </div>
              <div class="naming-grid-box">
                \${gridHtml}
                \${actionRowHtml}
              </div>
              <button type="button" class="naming-back-btn" data-action="back">&larr; Back to Preset Names</button>
            </div>
          \`;
        } else if (currentHdScene === 'bedroom') {
          hdStage.style.display = 'block';
          canvas.style.display = 'none';

          var dialogHtml = '';
          if (bedroomDialog) {
            dialogHtml = '<div class="bedroom-dialogue" id="hdDialogueBox">' +
              '<div class="dlg-tag">' + bedroomDialog.tag + '</div>' +
              '<p>' + bedroomDialog.text + '</p>' +
              '<span class="more">&#9660;</span>' +
            '</div>';
          }

          var hdRect = hdStage.getBoundingClientRect();
          var aspect = (hdRect && hdRect.width > 0) ? (hdRect.height / hdRect.width) : 1.35;
          var roomSvg = Art.bedroomScene(playerGender, bedroomPlayer, aspect);

          hdStage.innerHTML = '<div class="scene bedroom">' +
            '<div class="bedroom-wrapper">' +
              roomSvg +
              dialogHtml +
            '</div>' +
          '</div>';
        } else if (currentHdScene === 'house1f') {
          hdStage.style.display = 'block';
          canvas.style.display = 'none';

          var dialogHtml = '';
          if (house1FDialog) {
            dialogHtml = '<div class="bedroom-dialogue" id="hdDialogueBox">' +
              '<div class="dlg-tag">' + house1FDialog.tag + '</div>' +
              '<p>' + house1FDialog.text + '</p>' +
              '<span class="more">&#9660;</span>' +
            '</div>';
          }

          var hdRect = hdStage.getBoundingClientRect();
          var aspect = (hdRect && hdRect.width > 0) ? (hdRect.height / hdRect.width) : 1.35;
          var roomSvg = Art.house1FScene(playerGender, house1FPlayer, momNpc, neighborNpc, aspect, momAlertActive);

          hdStage.innerHTML = '<div class="scene house1f">' +
            '<div class="bedroom-wrapper">' +
              roomSvg +
              dialogHtml +
            '</div>' +
          '</div>';
        } else if (currentHdScene === 'game') {
          // In the room! HD Canvas fills the stage
          hdStage.style.display = 'none';
          hdStage.innerHTML = '';
          canvas.style.display = 'block';
          canvas.style.aspectRatio = '160 / 144';
          canvas.style.width = '100%';
          canvas.style.height = '100%';
          canvas.style.maxWidth = '100%';
          canvas.style.maxHeight = '100%';
          canvas.style.margin = 'auto';
          canvas.style.objectFit = 'contain';
        }
      }

      // 5. HD Input & Interaction Handler
      function handleHdInput(key) {
        if (window.__HD_MODE__ !== 'on') return false;

        if (currentHdScene === 'intro') {
          // Any button skips to title
          if (key === 'start' || key === 'a' || key === 'b') {
            currentHdScene = 'title';
            renderHdScene();
            return true;
          }
        } else if (currentHdScene === 'title') {
          if (key === 'start' || key === 'a') {
            currentHdScene = 'menu';
            renderHdScene();
            return true;
          }
        } else if (currentHdScene === 'menu') {
          var hasSave = (localStorage.getItem('BUDDYMON_ACTIVE_SAVE') === 'true') ||
                        findValue('QUICK_STATE_' + (gameboy ? gameboy.name : 'buddymon')) ||
                        findValue('B64_SRAM_' + (gameboy ? gameboy.name : 'buddymon'));
          var items = hasSave ? ['CONTINUE', 'NEW GAME', 'OPTION'] : ['NEW GAME', 'OPTION'];

          if (key === 'up') {
            hdMenuIndex = (hdMenuIndex + items.length - 1) % items.length;
            renderHdScene();
            return true;
          }
          if (key === 'down') {
            hdMenuIndex = (hdMenuIndex + 1) % items.length;
            renderHdScene();
            return true;
          }
          if (key === 'a' || key === 'start') {
            var selected = items[hdMenuIndex];
            if (selected === 'CONTINUE') {
              handleContinueGame();
            } else if (selected === 'NEW GAME') {
              autoSetDeviceClock();
              currentHdScene = 'prof';
              profStep = 0;
              hdNameChoiceIndex = 0;
              renderHdScene();
            } else if (selected === 'OPTION') {
              currentHdScene = 'options';
              hdOptionsIndex = 0;
              renderHdScene();
            }
            return true;
          }
        } else if (currentHdScene === 'options') {
          var optCount = hdOptionsList.length;
          if (key === 'up') {
            hdOptionsIndex = (hdOptionsIndex + optCount - 1) % optCount;
            renderHdScene();
            return true;
          }
          if (key === 'down') {
            hdOptionsIndex = (hdOptionsIndex + 1) % optCount;
            renderHdScene();
            return true;
          }
          if (key === 'left') {
            var cur = hdOptionsList[hdOptionsIndex];
            if (!cur.isBack && cur.values.length > 1) {
              cur.index = (cur.index + cur.values.length - 1) % cur.values.length;
              applyOptionChange(cur.key, cur.values[cur.index]);
              renderHdScene();
            }
            return true;
          }
          if (key === 'right') {
            var cur = hdOptionsList[hdOptionsIndex];
            if (!cur.isBack && cur.values.length > 1) {
              cur.index = (cur.index + 1) % cur.values.length;
              applyOptionChange(cur.key, cur.values[cur.index]);
              renderHdScene();
            }
            return true;
          }
          if (key === 'a') {
            var cur = hdOptionsList[hdOptionsIndex];
            if (cur.isBack) {
              currentHdScene = 'menu';
              renderHdScene();
            } else if (cur.values.length > 1) {
              cur.index = (cur.index + 1) % cur.values.length;
              applyOptionChange(cur.key, cur.values[cur.index]);
              renderHdScene();
            }
            return true;
          }
          if (key === 'b' || key === 'start') {
            currentHdScene = 'menu';
            renderHdScene();
            return true;
          }
        } else if (currentHdScene === 'prof') {
          if (profStep === 0) {
            // Gender choice with Left/Right/Up/Down
            if (key === 'left' || key === 'up') {
              playerGender = 'BOY';
              playerName = 'CHRIS';
              renderHdScene();
              return true;
            }
            if (key === 'right' || key === 'down') {
              playerGender = 'GIRL';
              playerName = 'KRIS';
              renderHdScene();
              return true;
            }
            if (key === 'a' || key === 'start') {
              profStep = 1;
              renderHdScene();
              return true;
            }
            if (key === 'b') {
              currentHdScene = 'menu';
              renderHdScene();
              return true;
            }
            return true;
          }
          if (profStep === 10) {
            // Name choice with Left/Right/Up/Down
            var nameChoices = ['NEW NAME', (playerGender === 'GIRL' ? 'KRIS' : 'CHRIS'), 'BUDDY', (playerGender === 'GIRL' ? 'LEAF' : 'ASH')];
            if (key === 'left' || key === 'up') {
              hdNameChoiceIndex = (hdNameChoiceIndex + nameChoices.length - 1) % nameChoices.length;
              renderHdScene();
              return true;
            }
            if (key === 'right' || key === 'down') {
              hdNameChoiceIndex = (hdNameChoiceIndex + 1) % nameChoices.length;
              renderHdScene();
              return true;
            }
            if (key === 'a' || key === 'start') {
              if (hdNameChoiceIndex === 0) {
                openNameDialog();
              } else {
                playerName = nameChoices[hdNameChoiceIndex];
                profStep = 11;
                renderHdScene();
              }
              return true;
            }
            if (key === 'b') {
              profStep = 9;
              renderHdScene();
              return true;
            }
            return true;
          }
          if (key === 'a' || key === 'start') {
            advanceProfSpeech();
            return true;
          }
          if (key === 'b') {
            if (profStep > 0 && profStep !== 0 && profStep !== 10) {
              profStep--;
              renderHdScene();
            }
            return true;
          }
        } else if (currentHdScene === 'naming') {
          if (key === 'up') {
            if (nameGridRow === 0) {
              nameGridRow = 4;
              if (nameGridCol < 3) nameGridCol = 0;
              else if (nameGridCol < 6) nameGridCol = 1;
              else nameGridCol = 2;
            } else if (nameGridRow === 4) {
              nameGridRow = 3;
              if (nameGridCol === 0) nameGridCol = 1;
              else if (nameGridCol === 1) nameGridCol = 4;
              else nameGridCol = 7;
            } else {
              nameGridRow--;
            }
            renderHdScene();
            return true;
          }
          if (key === 'down') {
            if (nameGridRow === 3) {
              nameGridRow = 4;
              if (nameGridCol < 3) nameGridCol = 0;
              else if (nameGridCol < 6) nameGridCol = 1;
              else nameGridCol = 2;
            } else if (nameGridRow === 4) {
              nameGridRow = 0;
              if (nameGridCol === 0) nameGridCol = 1;
              else if (nameGridCol === 1) nameGridCol = 4;
              else nameGridCol = 7;
            } else {
              nameGridRow++;
            }
            renderHdScene();
            return true;
          }
          if (key === 'left') {
            var maxC = (nameGridRow === 4) ? 3 : 9;
            nameGridCol = (nameGridCol + maxC - 1) % maxC;
            renderHdScene();
            return true;
          }
          if (key === 'right') {
            var maxC = (nameGridRow === 4) ? 3 : 9;
            nameGridCol = (nameGridCol + 1) % maxC;
            renderHdScene();
            return true;
          }
          if (key === 'a') {
            var curGrid = nameCaseUpper ? NAME_GRID_UPPER : NAME_GRID_LOWER;
            if (nameGridRow < 4) {
              var ch = curGrid[nameGridRow][nameGridCol];
              if (nameInputBuffer.length < 7) {
                nameInputBuffer += ch;
                renderHdScene();
              }
            } else {
              if (nameGridCol === 0) {
                nameCaseUpper = !nameCaseUpper;
                renderHdScene();
              } else if (nameGridCol === 1) {
                if (nameInputBuffer.length > 0) {
                  nameInputBuffer = nameInputBuffer.slice(0, -1);
                  renderHdScene();
                }
              } else if (nameGridCol === 2) {
                confirmEnteredName();
              }
            }
            return true;
          }
          if (key === 'b') {
            if (nameInputBuffer.length > 0) {
              nameInputBuffer = nameInputBuffer.slice(0, -1);
              renderHdScene();
            } else {
              cancelNameEntry();
            }
            return true;
          }
          if (key === 'start') {
            confirmEnteredName();
            return true;
          }
          if (key === 'select') {
            nameCaseUpper = !nameCaseUpper;
            renderHdScene();
            return true;
          }
          return true;
        } else if (currentHdScene === 'bedroom') {
          if (key === 'up' || key === 'down' || key === 'left' || key === 'right') {
            moveBedroomPlayer(key);
            return true;
          }
          if (key === 'a' || key === 'start') {
            interactBedroom();
            return true;
          }
          if (key === 'b') {
            if (bedroomDialog) {
              bedroomDialog = null;
              renderHdScene();
              return true;
            }
          }
          return true;
        } else if (currentHdScene === 'house1f') {
          if (key === 'up' || key === 'down' || key === 'left' || key === 'right') {
            moveHouse1FPlayer(key);
            return true;
          }
          if (key === 'a' || key === 'start') {
            interactHouse1F();
            return true;
          }
          if (key === 'b') {
            if (house1FDialog) {
              house1FDialog = null;
              renderHdScene();
              return true;
            }
          }
          return true;
        }

        return false;
      }

      function advanceProfSpeech() {
        if (profStep === 0 || profStep === 10) {
          // Waiting for choice
          return;
        }
        profStep++;
        if (profStep >= 16) {
          startBedroomGame();
        } else {
          renderHdScene();
        }
      }

      // Pointer / Click delegation on HD Stage
      hdStage.addEventListener('click', function(e) {
        if (currentHdScene === 'intro') {
          if (introTimer) { clearTimeout(introTimer); introTimer = null; }
          currentHdScene = 'title';
          renderHdScene();
          return;
        }
        if (currentHdScene === 'title') {
          currentHdScene = 'menu';
          renderHdScene();
          return;
        }
        var menuItem = e.target.closest('[data-menu-idx]');
        if (menuItem) {
          hdMenuIndex = parseInt(menuItem.dataset.menuIdx, 10);
          handleHdInput('a');
          return;
        }
        var optRow = e.target.closest('[data-opt-idx]');
        if (optRow) {
          var idx = parseInt(optRow.dataset.optIdx, 10);
          hdOptionsIndex = idx;
          var item = hdOptionsList[idx];
          if (item.isBack) {
            currentHdScene = 'menu';
            renderHdScene();
          } else {
            item.index = (item.index + 1) % item.values.length;
            applyOptionChange(item.key, item.values[item.index]);
            renderHdScene();
          }
          return;
        }
        var genderBtn = e.target.closest('[data-gender]');
        if (genderBtn) {
          playerGender = genderBtn.dataset.gender;
          if (playerGender === 'GIRL') {
            playerName = 'KRIS';
          } else {
            playerName = 'CHRIS';
          }
          profStep = 1;
          renderHdScene();
          return;
        }
        var nameBtn = e.target.closest('[data-name]');
        if (nameBtn) {
          var chosen = nameBtn.dataset.name;
          if (chosen === 'NEW NAME') {
            openNameDialog();
          } else {
            playerName = chosen;
            profStep = 11;
            renderHdScene();
          }
          return;
        }
        if (currentHdScene === 'naming') {
          var charBtn = e.target.closest('[data-char]');
          if (charBtn) {
            var charVal = charBtn.getAttribute('data-char');
            if (charBtn.dataset.r !== undefined) nameGridRow = parseInt(charBtn.dataset.r, 10);
            if (charBtn.dataset.c !== undefined) nameGridCol = parseInt(charBtn.dataset.c, 10);
            if (nameInputBuffer.length < 7) {
              nameInputBuffer += charVal;
              renderHdScene();
            }
            return;
          }
          var actBtn = e.target.closest('[data-action]');
          if (actBtn) {
            var action = actBtn.getAttribute('data-action');
            if (action === 'case') {
              nameCaseUpper = !nameCaseUpper;
              nameGridRow = 4;
              nameGridCol = 0;
              renderHdScene();
            } else if (action === 'del') {
              nameGridRow = 4;
              nameGridCol = 1;
              if (nameInputBuffer.length > 0) {
                nameInputBuffer = nameInputBuffer.slice(0, -1);
                renderHdScene();
              }
            } else if (action === 'end') {
              confirmEnteredName();
            } else if (action === 'back') {
              cancelNameEntry();
            }
            return;
          }
          return;
        }
        if (currentHdScene === 'bedroom') {
          if (bedroomDialog) {
            bedroomDialog = null;
            renderHdScene();
            return;
          }
          var bedObj = e.target.closest('#obj-bed');
          if (bedObj) {
            bedroomPlayer.dir = 'up';
            interactBedroomTarget(1, 2);
            return;
          }
          var radioObj = e.target.closest('#obj-radio');
          if (radioObj) {
            bedroomPlayer.dir = 'up';
            interactBedroomTarget(2, 2);
            return;
          }
          var pcObj = e.target.closest('#obj-pc');
          if (pcObj) {
            bedroomPlayer.dir = 'up';
            interactBedroomTarget(4, 2);
            return;
          }
          var bookshelfObj = e.target.closest('#obj-bookshelf');
          if (bookshelfObj) {
            bedroomPlayer.dir = 'left';
            interactBedroomTarget(0, 4);
            return;
          }
          var plantObj = e.target.closest('#obj-plant');
          if (plantObj) {
            bedroomPlayer.dir = 'down';
            interactBedroomTarget(8, 6);
            return;
          }
          var stairsObj = e.target.closest('#obj-stairs');
          if (stairsObj) {
            warpDownTo1F();
            return;
          }
          var rect = hdStage.getBoundingClientRect();
          var clickX = (e.clientX - rect.left) / rect.width;
          var clickY = (e.clientY - rect.top) / rect.height;
          var targetTileX = Math.max(1, Math.min(8, Math.round(clickX * 9)));
          var targetTileY = Math.max(2, Math.min(6, Math.round(clickY * 7)));
          if (targetTileX > bedroomPlayer.x) moveBedroomPlayer('right');
          else if (targetTileX < bedroomPlayer.x) moveBedroomPlayer('left');
          else if (targetTileY > bedroomPlayer.y) moveBedroomPlayer('down');
          else if (targetTileY < bedroomPlayer.y) moveBedroomPlayer('up');
          return;
        }
        if (currentHdScene === 'house1f') {
          if (house1FDialog) {
            advanceHouse1FDialog();
            return;
          }
          var momObj = e.target.closest('#obj-mom');
          if (momObj) {
            interactHouse1F();
            return;
          }
          var neighborObj = e.target.closest('#obj-neighbor');
          if (neighborObj) {
            interactHouse1FNeighbor();
            return;
          }
          var stairs1FObj = e.target.closest('#obj-stairs-1f');
          if (stairs1FObj) {
            warpUpTo2F();
            return;
          }
          var doorObj = e.target.closest('#obj-front-door');
          if (doorObj) {
            warpOutToTown();
            return;
          }
          var tvObj = e.target.closest('#obj-tv');
          if (tvObj) {
            playChime(440);
            house1FDialog = { tag: 'TV', text: "There's a movie on TV: Stars dot the sky as two friends ride on a train... I'd better get rolling too!" };
            renderHdScene();
            return;
          }
          var fridgeObj = e.target.closest('#obj-fridge');
          if (fridgeObj) {
            playChime(520);
            house1FDialog = { tag: 'FRIDGE', text: "Let's see what's in the fridge... Fresh Water and tasty Lemonade!" };
            renderHdScene();
            return;
          }
          var sinkObj = e.target.closest('#obj-sink');
          if (sinkObj) {
            house1FDialog = { tag: 'SINK', text: "The sink is spotless and shining clean." };
            renderHdScene();
            return;
          }
          var stoveObj = e.target.closest('#obj-stove');
          if (stoveObj) {
            playChime(480);
            house1FDialog = { tag: 'STOVE', text: "Mom's specialty soup is simmering gently on the stove. Smells delicious!" };
            renderHdScene();
            return;
          }
          var book1FObj = e.target.closest('#obj-bookshelf-1f');
          if (book1FObj) {
            house1FDialog = { tag: 'BOOKSHELF', text: "A collection of cookbooks, home decor magazines, and Buddymon care guides." };
            renderHdScene();
            return;
          }
          var tableObj = e.target.closest('#obj-table');
          if (tableObj) {
            house1FDialog = { tag: 'DINING TABLE', text: "A cozy dining table with a freshly brewed pot of berry tea and two cups." };
            renderHdScene();
            return;
          }

          var rect = hdStage.getBoundingClientRect();
          var clickX = (e.clientX - rect.left) / rect.width;
          var clickY = (e.clientY - rect.top) / rect.height;
          var targetTileX = Math.round(clickX * 400);
          var targetTileY = Math.round(clickY * 340);
          if (targetTileX > house1FPlayer.x + 8) moveHouse1FPlayer('right');
          else if (targetTileX < house1FPlayer.x - 8) moveHouse1FPlayer('left');
          else if (targetTileY > house1FPlayer.y + 8) moveHouse1FPlayer('down');
          else if (targetTileY < house1FPlayer.y - 8) moveHouse1FPlayer('up');
          return;
        }
        if (currentHdScene === 'prof') {
          advanceProfSpeech();
          return;
        }
      });

      // 6. GBC ROM Boot & Emulator Interface
      function uint8ToBinaryString(u8) {
        var chunks = [];
        var chunkSize = 0x8000;
        for (var i = 0; i < u8.length; i += chunkSize) {
          chunks.push(String.fromCharCode.apply(null, u8.subarray(i, i + chunkSize)));
        }
        return chunks.join('');
      }

      async function decompressGzipBase64(b64) {
        var bin = window.atob(b64);
        var bytes = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        var ds = new DecompressionStream('gzip');
        var writer = ds.writable.getWriter();
        writer.write(bytes);
        writer.close();
        var buf = await new Response(ds.readable).arrayBuffer();
        return new Uint8Array(buf);
      }

      async function loadRomBytes() {
        if (window.__EMBEDDED_ROM_GZ_B64__) {
          return await decompressGzipBase64(window.__EMBEDDED_ROM_GZ_B64__);
        }
        var resp = await fetch('rom.gbc');
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        return new Uint8Array(await resp.arrayBuffer());
      }

      function bootRomBytes(u8) {
        loadedRomUint8 = u8;
        loadedRomBinaryString = uint8ToBinaryString(u8);
        settings[0] = true;
        settings[1] = false;
        settings[13] = false;
        // Do NOT start emulation here; wait until game scene starts or continues
        renderHdScene();
        setStatus('Buddymon HD Engine Ready');
      }

      var keyMap = {
        'ArrowUp': 'up', 'KeyW': 'up',
        'ArrowDown': 'down', 'KeyS': 'down',
        'ArrowLeft': 'left', 'KeyA': 'left',
        'ArrowRight': 'right', 'KeyD': 'right',
        'KeyZ': 'a', 'KeyJ': 'a', 'Space': 'a',
        'KeyX': 'b', 'KeyK': 'b', 'Backspace': 'b',
        'Enter': 'start',
        'ShiftLeft': 'select', 'ShiftRight': 'select', 'Tab': 'select'
      };

      window.addEventListener('keydown', function(e) {
        if (menuDialog && menuDialog.open) return;
        if (e.code === 'F5') { e.preventDefault(); quickSaveState(); return; }
        if (e.code === 'F8') { e.preventDefault(); quickLoadState(); return; }

        if (currentHdScene === 'naming') {
          if (e.key === 'Backspace') {
            e.preventDefault();
            if (nameInputBuffer.length > 0) {
              nameInputBuffer = nameInputBuffer.slice(0, -1);
              renderHdScene();
            }
            return;
          }
          if (e.key === 'Enter') {
            e.preventDefault();
            confirmEnteredName();
            return;
          }
          if (e.key === 'Escape') {
            e.preventDefault();
            cancelNameEntry();
            return;
          }
          if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
            if (/^[A-Za-z0-9 \.?,!\-\/]$/.test(e.key)) {
              e.preventDefault();
              if (nameInputBuffer.length < 7) {
                nameInputBuffer += e.key;
                renderHdScene();
              }
              return;
            }
          }
        }

        var mapped = keyMap[e.code];
        if (mapped) {
          e.preventDefault();
          if (handleHdInput(mapped)) return;
          GameBoyKeyDown(mapped);
          var btn = document.querySelector('[data-gbkey="' + mapped + '"]');
          if (btn) btn.classList.add('pressed');
        }
      });

      window.addEventListener('keyup', function(e) {
        var mapped = keyMap[e.code];
        if (mapped) {
          e.preventDefault();
          GameBoyKeyUp(mapped);
          var btn = document.querySelector('[data-gbkey="' + mapped + '"]');
          if (btn) btn.classList.remove('pressed');
        }
      });

      // Touch Controls below game
      document.querySelectorAll('[data-gbkey]').forEach(function(btn) {
        var k = btn.getAttribute('data-gbkey');

        function startPress(e) {
          e.preventDefault();
          try { btn.setPointerCapture(e.pointerId); } catch (_) {}
          resumeWebAudioIfNeeded();
          if (navigator.vibrate) { try { navigator.vibrate(8); } catch (_) {} }
          btn.classList.add('pressed');

          if (handleHdInput(k)) return;

          // For GameBoy emulator: ensure direction keys remain held for at least 220ms
          // so even a quick tap on mobile executes a full 1-tile step
          GameBoyKeyDown(k);
          btn._pressedAt = Date.now();
        }

        function endPress(e) {
          e.preventDefault();
          btn.classList.remove('pressed');

          var isDpad = (k === 'up' || k === 'down' || k === 'left' || k === 'right');
          if (isDpad) {
            var elapsed = Date.now() - (btn._pressedAt || 0);
            var minDuration = 220; // 220ms ensures a full 1-tile step in GameBoy engine
            if (elapsed < minDuration) {
              setTimeout(function() {
                GameBoyKeyUp(k);
              }, minDuration - elapsed);
              return;
            }
          }
          GameBoyKeyUp(k);
        }

        btn.addEventListener('pointerdown', startPress);
        btn.addEventListener('pointerup', endPress);
        btn.addEventListener('pointercancel', endPress);
      });

      // HD Player Sprite Overlay across the entire game (1F downstairs, New Bark Town, etc.)
      function updateHdPlayerOverlay() {
        var ov = document.getElementById('hdPlayerOverlay');
        if (window.__HD_MODE__ !== 'on' || currentHdScene !== 'game' || !GameBoyEmulatorInitialized() || !GameBoyEmulatorPlaying()) {
          if (ov) ov.style.display = 'none';
          return;
        }

        if (!gameboy || !gameboy.memory) return;
        var oamY = gameboy.memory[0xFE00];
        var oamX = gameboy.memory[0xFE01];
        var tile = gameboy.memory[0xFE02];
        var attr = gameboy.memory[0xFE03];

        var canvas = document.getElementById('mainCanvas');
        var vp = document.getElementById('gameViewport');
        if (!ov || !canvas || !vp) return;

        if (oamY <= 0 || oamY >= 160 || oamX <= 0 || oamX >= 168) {
          ov.style.display = 'none';
          return;
        }

        var cRect = canvas.getBoundingClientRect();
        var vRect = vp.getBoundingClientRect();
        if (cRect.width === 0 || cRect.height === 0) return;

        var gx = oamX - 8;
        var gy = oamY - 16;
        var scaleX = cRect.width / 160;
        var scaleY = cRect.height / 144;

        var dir = 'down';
        var step = 0;
        if (tile >= 0 && tile <= 3) {
          dir = 'down';
          step = (tile === 0 || tile === 1) ? 0 : (tile === 2 ? 1 : 2);
        } else if (tile >= 4 && tile <= 7) {
          dir = 'up';
          step = (tile === 4 || tile === 5) ? 0 : (tile === 6 ? 1 : 2);
        } else {
          dir = (attr & 0x20) ? 'right' : 'left';
          step = (tile === 8) ? 0 : ((Math.floor(Date.now() / 160) % 2) + 1);
        }

        // Match exact 16x16 pixel size of original Crystal sprites
        var spriteW = 16 * scaleX;
        var spriteH = 16 * scaleY;
        var leftPx = (cRect.left - vRect.left) + gx * scaleX;
        var topPx = (cRect.top - vRect.top) + gy * scaleY;

        ov.style.display = 'block';
        ov.style.left = leftPx + 'px';
        ov.style.top = topPx + 'px';
        ov.style.width = spriteW + 'px';
        ov.style.height = spriteH + 'px';

        var svg = (playerGender === 'GIRL') ? Art.girlSprite(dir, step) : Art.boySprite(dir, step);
        if (ov._lastSvgKey !== (playerGender + dir + step)) {
          ov._lastSvgKey = playerGender + dir + step;
          ov.innerHTML = svg;
        }
      }

      function checkWarpUpstairs() {
        if (currentHdScene !== 'game' || window.__HD_MODE__ !== 'on' || !GameBoyEmulatorInitialized() || !GameBoyEmulatorPlaying()) return;
        if (!gameboy) return;
        if (Date.now() < upstairsWarpCooldown) return;
        try {
          var is2F = false;
          var mg = 0, mn = 0;
          if (gameboy.GBCMemory) {
            mg = gameboy.GBCMemory[3253];
            mn = gameboy.GBCMemory[3254];
          } else if (gameboy.memoryReader) {
            mg = gameboy.memoryReader[0xDCB5](gameboy, 0xDCB5);
            mn = gameboy.memoryReader[0xDCB6](gameboy, 0xDCB6);
          }

          // Entering Player's House 1F (Map Group 24, Map Number 6) from New Bark Town
          if (mg === 24 && mn === 6) {
            hasBeenIn1F = true;
            upstairsWarpCooldown = Date.now() + 4000;
            if (gameboy) gameboy.stopEmulator = 1;
            currentHdScene = 'house1f';
            house1FPlayer.x = 200;
            house1FPlayer.y = 280;
            house1FPlayer.dir = 'up';
            house1FPlayer.step = 0;
            house1FDialog = null;
            renderHdScene();
            save1FProgress();
            setStatus('Back inside your house!');
            return;
          }

          if (hasBeenIn1F && mg === 24 && mn === 7) {
            is2F = true;
          }

          if (is2F) {
            hasBeenIn1F = false;
            upstairsWarpCooldown = Date.now() + 4000;
            try {
              if (isValid1FState(live1FState)) {
                idbStore.set('BUDDYMON_ACTIVE_STATE', live1FState);
              }
              localStorage.setItem('BUDDYMON_ACTIVE_SAVE', 'true');
              saveSRAM();
            } catch (_) {}

            if (gameboy) gameboy.stopEmulator = 1;

            currentHdScene = 'bedroom';
            bedroomPlayer.x = 320;
            bedroomPlayer.y = 104;
            bedroomPlayer.dir = 'down';
            bedroomPlayer.step = 0;
            bedroomDialog = null;
            renderHdScene();
            saveBedroomProgress();
            setStatus('Back in your room!');
          }
        } catch (_) {}
      }

      function hdOverlayLoop() {
        updateHdPlayerOverlay();
        checkWarpUpstairs();
        requestAnimationFrame(hdOverlayLoop);
      }
      requestAnimationFrame(hdOverlayLoop);

      // Auto periodic state & SRAM save during gameplay
      setInterval(async function() {
        if (currentHdScene === 'game' && GameBoyEmulatorInitialized() && GameBoyEmulatorPlaying()) {
          try {
            var liveSt = gameboy.saveState();
            liveSt[0] = [];
            await idbStore.set('BUDDYMON_ACTIVE_STATE', liveSt);
            localStorage.setItem('BUDDYMON_ACTIVE_SAVE', 'true');
            saveSRAM();
          } catch (_) {}
        }
      }, 5000);

      window.addEventListener('pagehide', function() {
        if (currentHdScene === 'game' && GameBoyEmulatorInitialized() && GameBoyEmulatorPlaying()) {
          try {
            var liveSt = gameboy.saveState();
            liveSt[0] = [];
            idbStore.set('BUDDYMON_ACTIVE_STATE', liveSt);
            localStorage.setItem('BUDDYMON_ACTIVE_SAVE', 'true');
            saveSRAM();
          } catch (_) {}
        }
      });

      // Start engine
      loadRomBytes().then(bootRomBytes).catch(function(err) {
        setStatus('Load error: ' + err.message);
      });
    })();
  </script>
</body>
</html>`;
}

// 1. Write standalone index.html (with embedded ROM)
console.log('Writing index.html...');
const standaloneHtml = buildHtml(true);
fs.writeFileSync('index.html', standaloneHtml, 'utf8');

// 2. Build worker HTML (without embedded ROM so it loads /rom.gbc dynamically)
console.log('Building worker.js...');
const workerHtml = buildHtml(false);

// Compress emulator.js with GZIP for Cloudflare Worker
const emuGz = zlib.gzipSync(Buffer.from(emulatorJs, 'utf8'));
const emuGzB64 = emuGz.toString('base64');

// Escape HTML for worker.js template
function escapeForTemplateLiteral(str) {
  return JSON.stringify(str);
}

const workerJsContent = `// ============================================================================
// Cloudflare Worker - Buddymon HD Smartphone Remaster
// ============================================================================

const INDEX_HTML = ${escapeForTemplateLiteral(workerHtml)};
const MANIFEST_JSON = ${escapeForTemplateLiteral(manifestJson)};
const SW_JS = ${escapeForTemplateLiteral(swJs)};
const EMULATOR_GZ_B64 = "${emuGzB64}";
const ROM_GZ_B64 = "${romB64}";
const ICON_192_B64 = "${icon192B64}";
const ICON_512_B64 = "${icon512B64}";
const PROF_PNG_B64 = "${profB64}";
const BOY_PNG_B64 = "${boyB64}";
const GIRL_PNG_B64 = "${girlB64}";

let cachedEmulatorJs = null;
let cachedRomBytes = null;

function base64ToUint8Array(b64) {
  const bin = atob(b64);
  const len = bin.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}

async function decompressGzip(bytes) {
  const ds = new DecompressionStream("gzip");
  const writer = ds.writable.getWriter();
  writer.write(bytes);
  writer.close();
  const resp = new Response(ds.readable);
  return new Uint8Array(await resp.arrayBuffer());
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    const securityHeaders = {
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "Access-Control-Allow-Origin": "*",
    };

    if (path === "/" || path === "/index.html") {
      return new Response(INDEX_HTML, {
        status: 200,
        headers: {
          ...securityHeaders,
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    }

    if (path === "/sw.js") {
      return new Response(SW_JS, {
        status: 200,
        headers: {
          ...securityHeaders,
          "Content-Type": "application/javascript; charset=utf-8",
          "Service-Worker-Allowed": "/",
        },
      });
    }

    if (path === "/manifest.json") {
      return new Response(MANIFEST_JSON, {
        status: 200,
        headers: {
          ...securityHeaders,
          "Content-Type": "application/manifest+json; charset=utf-8",
        },
      });
    }

    if (path === "/icon-192.png" || path === "/assets/images/icons/icon-192.png") {
      return new Response(base64ToUint8Array(ICON_192_B64), {
        status: 200,
        headers: {
          ...securityHeaders,
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    if (path === "/icon-512.png" || path === "/assets/images/icons/icon-512.png") {
      return new Response(base64ToUint8Array(ICON_512_B64), {
        status: 200,
        headers: {
          ...securityHeaders,
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    if (path === "/professor.png" || path === "/assets/images/professor.png" || path === "/assets/images/trainers/professor.png" || path === "/assets/images/trainers/oak.png") {
      return new Response(base64ToUint8Array(PROF_PNG_B64), {
        status: 200,
        headers: {
          ...securityHeaders,
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    if (path === "/boy.png" || path === "/assets/images/boy.png" || path === "/assets/images/player/boy.png" || path === "/assets/images/player/chris.png") {
      return new Response(base64ToUint8Array(BOY_PNG_B64), {
        status: 200,
        headers: {
          ...securityHeaders,
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    if (path === "/girl.png" || path === "/assets/images/girl.png" || path === "/assets/images/player/girl.png" || path === "/assets/images/player/kris.png") {
      return new Response(base64ToUint8Array(GIRL_PNG_B64), {
        status: 200,
        headers: {
          ...securityHeaders,
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    if (path === "/emulator.js") {
      if (!cachedEmulatorJs) {
        cachedEmulatorJs = await decompressGzip(base64ToUint8Array(EMULATOR_GZ_B64));
      }
      return new Response(cachedEmulatorJs, {
        status: 200,
        headers: {
          ...securityHeaders,
          "Content-Type": "application/javascript; charset=utf-8",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    if (path === "/rom.gbc") {
      if (!cachedRomBytes) {
        cachedRomBytes = await decompressGzip(base64ToUint8Array(ROM_GZ_B64));
      }
      return new Response(cachedRomBytes, {
        status: 200,
        headers: {
          ...securityHeaders,
          "Content-Type": "application/octet-stream",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    if (path === "/health") {
      return new Response(JSON.stringify({
        ok: true,
        title: "Buddymon",
        mode: "Buddymon HD Smartphone Remaster",
        starters: ["BRAMBLET", "BANDIT", "CHOMPLET"],
        pwa: true,
        offline: true,
      }), {
        status: 200,
        headers: {
          ...securityHeaders,
          "Content-Type": "application/json; charset=utf-8",
        },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
};
`;

fs.writeFileSync('worker.js', workerJsContent, 'utf8');
console.log('Successfully generated index.html and worker.js!');
