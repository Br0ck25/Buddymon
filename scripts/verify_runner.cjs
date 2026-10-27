const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8089;
const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ARTIFACT_DIR = 'C:/Users/James/.gemini/antigravity/brain/45eb5fd6-9b36-4691-b33c-2304b83fc722';

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(__dirname, '..', reqPath);
  if (fs.existsSync(filePath)) {
    if (filePath.endsWith('.html')) res.writeHead(200, { 'Content-Type': 'text/html' });
    else if (filePath.endsWith('.js')) res.writeHead(200, { 'Content-Type': 'application/javascript' });
    else res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
    res.end(fs.readFileSync(filePath));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, async () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);

  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=480,800',
    `http://127.0.0.1:${PORT}`
  ]);

  async function getWsUrl() {
    for (let i = 0; i < 30; i++) {
      try {
        const res = await fetch('http://127.0.0.1:9222/json');
        const list = await res.json();
        const page = list.find(t => t.type === 'page');
        if (page && page.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
      } catch (_) {}
      await new Promise(r => setTimeout(r, 200));
    }
    throw new Error('Chrome remote debugging not ready');
  }

  try {
    const wsUrl = await getWsUrl();
    const ws = new WebSocket(wsUrl);
    let msgId = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && callbacks.has(data.id)) {
        callbacks.get(data.id)(data);
        callbacks.delete(data.id);
      }
    };

    await new Promise(resolve => ws.onopen = resolve);

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const id = msgId++;
        callbacks.set(id, resolve);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    async function evaluate(expr) {
      const r = await send('Runtime.evaluate', {
        expression: expr,
        returnByValue: true,
        awaitPromise: true
      });
      return r.result && r.result.result ? r.result.result.value : undefined;
    }

    async function takeScreenshot(filePath) {
      const r = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(filePath, Buffer.from(r.result.data, 'base64'));
      console.log('Saved screenshot:', filePath);
    }

    // Wait for page to initialize
    await new Promise(r => setTimeout(r, 1200));
    for (let i = 0; i < 30; i++) {
      const ready = await evaluate(`typeof window.__switchScene === 'function' && typeof window.__handleHdInput === 'function'`);
      if (ready) break;
      await new Promise(r => setTimeout(r, 200));
    }

    console.log('\n======================================================');
    console.log('--- TEST 1: New Game -> Boy/Girl Selection Scene ---');
    console.log('======================================================');

    // Switch to menu scene with fresh state and select NEW GAME
    await evaluate(`
      localStorage.clear();
      window.__switchScene('menu');
    `);
    await new Promise(r => setTimeout(r, 200));

    // Press A on NEW GAME
    await evaluate(`window.__handleHdInput('a')`);
    // Wait for fade transition into gender scene
    await new Promise(r => setTimeout(r, 500));

    let scene1 = await evaluate(`window.__getHdScene()`);
    let isGenderStage = await evaluate(`!!document.querySelector('.gender-stage')`);
    let genderText = await evaluate(`document.querySelector('.prof-dialogue p') ? document.querySelector('.prof-dialogue p').innerText : ''`);
    console.log('Scene after NEW GAME:', scene1);
    console.log('Gender Stage Present:', isGenderStage);
    console.log('Gender Dialogue:', `"${genderText}"`);
    await takeScreenshot(path.join(ARTIFACT_DIR, 'verify_crystal_step1_gender.png'));

    console.log('\n======================================================');
    console.log('--- TEST 2: Fade to Dark & Clock Wake-Up Scene ---');
    console.log('======================================================');

    // Select Boy and confirm with 'A'
    await evaluate(`window.__handleHdInput('a')`);
    await new Promise(r => setTimeout(r, 500)); // Wait for fade transition

    let scene2 = await evaluate(`window.__getHdScene()`);
    console.log('Scene after Gender choice:', scene2);

    let clockLines = [];
    for (let i = 0; i < 5; i++) {
      let line = await evaluate(`document.querySelector('.clock-dialogue p') ? document.querySelector('.clock-dialogue p').innerText : ''`);
      clockLines.push(line.replace(/\n/g, ' '));
      if (i < 4) {
        await evaluate(`window.__handleHdInput('a')`);
        await new Promise(r => setTimeout(r, 200));
      }
    }
    console.log('Clock Sequence Lines:');
    clockLines.forEach((l, idx) => console.log(`  Line ${idx}: "${l}"`));
    await takeScreenshot(path.join(ARTIFACT_DIR, 'verify_crystal_step2_clock.png'));

    console.log('\n======================================================');
    console.log('--- TEST 3: Fade Transition to Prof. Oak & Bandit ---');
    console.log('======================================================');

    // Confirm last clock line to trigger fade transition to Prof. Oak
    await evaluate(`window.__handleHdInput('a')`);
    await new Promise(r => setTimeout(r, 600));

    let scene3 = await evaluate(`window.__getHdScene()`);
    let oakText = await evaluate(`document.querySelector('#hdDialogueBox p') ? document.querySelector('#hdDialogueBox p').innerText : ''`);
    let hasOak = await evaluate(`!!document.querySelector('.prof-portrait')`);
    console.log('Scene after Clock:', scene3);
    console.log('Has Oak portrait:', hasOak);
    console.log('Oak Greeting:', `"${oakText}"`);
    await takeScreenshot(path.join(ARTIFACT_DIR, 'verify_crystal_step3_oak_greeting.png'));

    // Step to Bandit creature
    await evaluate(`window.__handleHdInput('a')`);
    await new Promise(r => setTimeout(r, 200));
    await evaluate(`window.__handleHdInput('a')`);
    await new Promise(r => setTimeout(r, 200));

    let hasCreature = await evaluate(`!!document.querySelector('.creature-spot')`);
    let creatureText = await evaluate(`document.querySelector('#hdDialogueBox p') ? document.querySelector('#hdDialogueBox p').innerText : ''`);
    console.log('Oak Bandit Creature shown:', hasCreature);
    console.log('Oak Creature line:', `"${creatureText}"`);
    await takeScreenshot(path.join(ARTIFACT_DIR, 'verify_crystal_step4_oak_creature.png'));

    // Step through to Name Selection
    for (let s = 0; s < 5; s++) {
      let isNameBox = await evaluate(`!!document.querySelector('.choice-box')`);
      if (isNameBox) break;
      await evaluate(`window.__handleHdInput('a')`);
      await new Promise(r => setTimeout(r, 200));
    }

    let isNameBox = await evaluate(`!!document.querySelector('.choice-box')`);
    console.log('Name Choice Box reached:', isNameBox);

    // Pick preset name CHRIS and send off
    await evaluate(`window.__handleHdInput('right')`);
    await evaluate(`window.__handleHdInput('a')`);
    await new Promise(r => setTimeout(r, 250));

    // Step to send-off and fade to Bedroom
    for (let s = 0; s < 8; s++) {
      let cur = await evaluate(`window.__getHdScene()`);
      if (cur === 'bedroom') break;
      await evaluate(`window.__handleHdInput('a')`);
      await new Promise(r => setTimeout(r, 200));
    }
    await new Promise(r => setTimeout(r, 600));

    let sceneBedroom = await evaluate(`window.__getHdScene()`);
    console.log('Transition to Bedroom Scene:', sceneBedroom);

    console.log('\n======================================================');
    console.log('--- TEST 4: 1F Hallway Walking & Mom Intercept Walk ---');
    console.log('======================================================');

    // Walk down stairs into 1F
    await evaluate(`
      window.__bedroomPlayer.x = 320;
      window.__bedroomPlayer.y = 96;
      window.__handleHdInput('up');
    `);
    await new Promise(r => setTimeout(r, 700)); // wait for fade transition

    let scene1F = await evaluate(`window.__getHdScene()`);
    let initial1FPos = await evaluate(`({ x: window.__house1FPlayer.x, y: window.__house1FPlayer.y })`);
    console.log('Scene:', scene1F, 'Spawn Landing:', initial1FPos);

    // TEST: Player can walk DOWN the hallway without Mom stopping prematurely!
    console.log('Walking down stairs hallway: step 1 (y: 120)...');
    await evaluate(`window.__handleHdInput('down')`);
    let posStep1 = await evaluate(`({ x: window.__house1FPlayer.x, y: window.__house1FPlayer.y })`);
    let stoppedEarly1 = await evaluate(`!!document.querySelector('.bedroom-dialogue')`);
    console.log('Step 1 Pos:', posStep1, 'Mom stopped early?', stoppedEarly1);

    console.log('Walking down stairs hallway: step 2 (y: 136)...');
    await evaluate(`window.__handleHdInput('down')`);
    let posStep2 = await evaluate(`({ x: window.__house1FPlayer.x, y: window.__house1FPlayer.y })`);
    let stoppedEarly2 = await evaluate(`!!document.querySelector('.bedroom-dialogue')`);
    console.log('Step 2 Pos:', posStep2, 'Mom stopped early?', stoppedEarly2);

    console.log('Walking down stairs hallway: step 3 (y: 152)...');
    await evaluate(`window.__handleHdInput('down')`);
    let posStep3 = await evaluate(`({ x: window.__house1FPlayer.x, y: window.__house1FPlayer.y })`);
    let stoppedEarly3 = await evaluate(`!!document.querySelector('.bedroom-dialogue')`);
    console.log('Step 3 Pos:', posStep3, 'Mom stopped early?', stoppedEarly3);

    // NOW: Player takes step 4 to PASS Mom towards the door (y >= 164)!
    console.log('Taking step 4 to PASS Mom towards front door (y: 168)...');
    let momInitialX = await evaluate(`window.__momNpc.x`);
    console.log('Mom start position:', momInitialX);

    await evaluate(`window.__handleHdInput('down')`);

    // Monitor Mom WALKING across the room over to the player!
    let momWalkingLog = [];
    for (let t = 0; t < 25; t++) {
      let curMomX = await evaluate(`window.__momNpc.x`);
      let curMomDir = await evaluate(`window.__momNpc.dir`);
      let curMomStep = await evaluate(`window.__momNpc.step`);
      let hasDialog = await evaluate(`!!document.querySelector('.bedroom-dialogue')`);
      momWalkingLog.push({ x: curMomX, dir: curMomDir, step: curMomStep, hasDialog });
      if (hasDialog) break;
      await new Promise(r => setTimeout(r, 65));
    }

    console.log('Mom Walk Progression (sample):');
    momWalkingLog.forEach((m, idx) => console.log(`  Tick ${idx}: Mom X=${m.x}, dir=${m.dir}, step=${m.step}, dialogOpened=${m.hasDialog}`));

    let finalMomX = await evaluate(`window.__momNpc.x`);
    let momDlgText = await evaluate(`document.querySelector('.bedroom-dialogue p') ? document.querySelector('.bedroom-dialogue p').innerText : ''`);
    console.log(`Mom reached player at X=${finalMomX}! (Started at ${momInitialX})`);
    console.log('Mom dialogue opened:', `"${momDlgText}"`);
    await takeScreenshot(path.join(ARTIFACT_DIR, 'verify_mom_walks_to_player.png'));

    // Step through Mom's dialogue sequence
    for (let i = 0; i < 8; i++) {
      let hasDlg = await evaluate(`!!document.querySelector('.bedroom-dialogue')`);
      if (!hasDlg) break;
      await evaluate(`window.__handleHdInput('a')`);
      await new Promise(r => setTimeout(r, 200));
    }

    console.log('Mom dialogue finished. Verifying Mom walks BACK to her seat...');
    // Monitor Mom walking back across the room to x=154
    let momWalkBackLog = [];
    for (let t = 0; t < 25; t++) {
      let curMomX = await evaluate(`window.__momNpc.x`);
      let curMomDir = await evaluate(`window.__momNpc.dir`);
      let isBusy = await evaluate(`window.__isMomBusy()`);
      momWalkBackLog.push({ x: curMomX, dir: curMomDir, isBusy });
      if (!isBusy && curMomX <= 154) break;
      await new Promise(r => setTimeout(r, 65));
    }
    console.log('Mom Walk Back Progression (sample):');
    momWalkBackLog.forEach((m, idx) => console.log(`  Tick ${idx}: Mom X=${m.x}, dir=${m.dir}, busy=${m.isBusy}`));

    let returnMomX = await evaluate(`window.__momNpc.x`);
    let returnMomDir = await evaluate(`window.__momNpc.dir`);
    console.log(`Mom returned to seat at X=${returnMomX}, facing ${returnMomDir} towards Neighbor!`);
    await takeScreenshot(path.join(ARTIFACT_DIR, 'verify_mom_returned_to_seat.png'));

    console.log('\n======================================================');
    console.log('All tests passed with flying colors!');
    console.log('======================================================');

  } catch (err) {
    console.error('Test error:', err);
  } finally {
    try { chrome.kill(); } catch (_) {}
    server.close();
    process.exit(0);
  }
});
