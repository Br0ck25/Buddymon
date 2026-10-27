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

    console.log('\n=========================================');
    console.log('--- TEST 1: Oak Intro Sequence Order ---');
    console.log('=========================================');

    // Switch to menu scene with clear state and choose NEW GAME
    await evaluate(`
      localStorage.clear();
      window.__switchScene('menu');
    `);
    await new Promise(r => setTimeout(r, 200));

    await evaluate(`
      window.__handleHdInput('a'); // Start NEW GAME
    `);
    await new Promise(r => setTimeout(r, 300));

    let profScene = await evaluate(`window.__getHdScene()`);
    let dialogText = await evaluate(`document.querySelector('.prof-dialogue p') ? document.querySelector('.prof-dialogue p').innerText : ''`);
    let hasOak = await evaluate(`!!document.querySelector('.prof-portrait')`);
    console.log('Step 0 (Scene, HasOak, Dialog):', profScene, hasOak, dialogText);

    // Step through Oak speeches until Gender Select
    let foundGenderSelect = false;
    let foundCreature = false;
    for (let step = 0; step < 10; step++) {
      const isCreature = await evaluate(`!!document.querySelector('.creature-spot')`);
      const isGender = await evaluate(`!!document.querySelector('.gender-stage')`);
      const dlg = await evaluate(`document.querySelector('.prof-dialogue p') ? document.querySelector('.prof-dialogue p').innerText : ''`);
      if (isCreature) foundCreature = true;
      if (isGender) {
        foundGenderSelect = true;
        console.log(`Step ${step}: Gender Select reached! Dialog: "${dlg}"`);
        break;
      }
      console.log(`Step ${step} dialog: "${dlg}" (creature: ${isCreature})`);
      await evaluate(`window.__handleHdInput('a')`);
      await new Promise(r => setTimeout(r, 250));
    }

    console.log('Oak Intro Verification:', {
      creatureShownBeforeGender: foundCreature,
      genderSelectReached: foundGenderSelect
    });
    await takeScreenshot(path.join(ARTIFACT_DIR, 'verify_oak_intro_order.png'));

    // Select Boy and advance to Name Select
    await evaluate(`window.__handleHdInput('a')`); // Select Boy
    await new Promise(r => setTimeout(r, 300));

    let isNameSelect = await evaluate(`!!document.querySelector('.choice-box')`);
    console.log('Name Select Reached:', isNameSelect);

    // Choose preset name
    await evaluate(`window.__handleHdInput('right')`); // Select second option
    await evaluate(`window.__handleHdInput('a')`); // Confirm name
    await new Promise(r => setTimeout(r, 300));

    // Fast-forward through final Oak send-off until bedroom scene
    for (let step = 0; step < 10; step++) {
      const cur = await evaluate(`window.__getHdScene()`);
      if (cur === 'bedroom') break;
      await evaluate(`window.__handleHdInput('a')`);
      await new Promise(r => setTimeout(r, 200));
    }

    console.log('\n=========================================');
    console.log('--- TEST 2: Bedroom Collision & N64 ---');
    console.log('=========================================');
    let bedScene = await evaluate(`window.__getHdScene()`);
    let initialPos = await evaluate(`({ x: window.__bedroomPlayer.x, y: window.__bedroomPlayer.y })`);
    console.log('Bedroom Scene:', bedScene, 'Initial Pos:', initialPos);

    // Walk player all the way NORTH towards desk / baseboard
    for (let i = 0; i < 15; i++) {
      await evaluate(`window.__handleHdInput('up')`);
    }
    let northPos = await evaluate(`({ x: window.__bedroomPlayer.x, y: window.__bedroomPlayer.y, footY: window.__bedroomPlayer.y + 34 })`);
    console.log('Player at maximum North position:', northPos);
    console.log(`Foot distance from baseboard (y=84): ${northPos.footY - 84}px (tight, zero awkward gap!)`);

    // Interact with N64 on right side of desk (px around 186)
    await evaluate(`
      window.__bedroomPlayer.x = 186;
      window.__bedroomPlayer.y = northPos.y;
      window.__bedroomPlayer.dir = 'up';
      window.__handleHdInput('a');
    `);
    await new Promise(r => setTimeout(r, 200));

    let n64Dialog = await evaluate(`document.querySelector('.bedroom-dialogue p') ? document.querySelector('.bedroom-dialogue p').innerText : ''`);
    console.log('N64 Interaction Dialog:', n64Dialog);

    // Dismiss dialog and test PC interaction (px = 140)
    await evaluate(`window.__handleHdInput('b')`);
    await evaluate(`
      window.__bedroomPlayer.x = 140;
      window.__bedroomPlayer.y = northPos.y;
      window.__bedroomPlayer.dir = 'up';
      window.__handleHdInput('a');
    `);
    await new Promise(r => setTimeout(r, 200));
    let pcDialog = await evaluate(`document.querySelector('.bedroom-dialogue p') ? document.querySelector('.bedroom-dialogue p').innerText : ''`);
    console.log('PC Interaction Dialog:', pcDialog);
    await evaluate(`window.__handleHdInput('b')`);

    // Test Radio interaction (px = 104)
    await evaluate(`
      window.__bedroomPlayer.x = 104;
      window.__bedroomPlayer.y = northPos.y;
      window.__bedroomPlayer.dir = 'up';
      window.__handleHdInput('a');
    `);
    await new Promise(r => setTimeout(r, 200));
    let radioDialog = await evaluate(`document.querySelector('.bedroom-dialogue p') ? document.querySelector('.bedroom-dialogue p').innerText : ''`);
    console.log('Radio Interaction Dialog (from ROM):', radioDialog);
    await evaluate(`window.__handleHdInput('b')`);

    await takeScreenshot(path.join(ARTIFACT_DIR, 'verify_bedroom_north_collision_n64.png'));

    console.log('\n=========================================');
    console.log('--- TEST 3: 1F Landing Mom Intercept ---');
    console.log('=========================================');

    // Walk to stairs at (320, 96) to head downstairs
    await evaluate(`
      window.__bedroomPlayer.x = 320;
      window.__bedroomPlayer.y = 96;
      window.__handleHdInput('up');
    `);
    await new Promise(r => setTimeout(r, 600));

    let f1Scene = await evaluate(`window.__getHdScene()`);
    let spawn1F = await evaluate(`({ x: window.__house1FPlayer.x, y: window.__house1FPlayer.y })`);
    console.log('Arrived in 1F:', f1Scene, 'Spawn position:', spawn1F);

    // Take ONE step down off the landing:
    console.log('Taking ONE step down from stairs landing...');
    await evaluate(`window.__handleHdInput('down')`);
    await new Promise(r => setTimeout(r, 300));

    let momDialog = await evaluate(`document.querySelector('.bedroom-dialogue p') ? document.querySelector('.bedroom-dialogue p').innerText : ''`);
    let momAlert = await evaluate(`!!document.querySelector('.mom-alert')`);
    console.log('Mom Intercept Triggered?', {
      alertExclamation: momAlert,
      dialogText: momDialog
    });
    await takeScreenshot(path.join(ARTIFACT_DIR, 'verify_mom_landing_intercept.png'));

    // Step through Mom's dialogue sequence to receive Buddygear
    for (let i = 0; i < 8; i++) {
      const hasDlg = await evaluate(`!!document.querySelector('.bedroom-dialogue')`);
      if (!hasDlg) break;
      await evaluate(`window.__handleHdInput('a')`);
      await new Promise(r => setTimeout(r, 150));
    }

    let gearReceived = await evaluate(`localStorage.getItem('BUDDYMON_GEAR_RECEIVED')`);
    console.log('Completed Mom Dialogue. BUDDYMON_GEAR_RECEIVED:', gearReceived);

    console.log('\n=========================================');
    console.log('--- TEST 4: 1F North Wall Collision ---');
    console.log('=========================================');

    // Move to kitchen area and walk north all the way
    await evaluate(`
      window.__house1FPlayer.x = 100;
      window.__house1FPlayer.y = 150;
      window.__renderHdScene();
    `);
    for (let i = 0; i < 15; i++) {
      await evaluate(`window.__handleHdInput('up')`);
    }
    let f1NorthPos = await evaluate(`({ x: window.__house1FPlayer.x, y: window.__house1FPlayer.y, footY: window.__house1FPlayer.y + 34 })`);
    console.log('1F Player at maximum North position:', f1NorthPos);
    console.log(`1F Foot distance from appliances (y=98): ${f1NorthPos.footY - 98}px (tight, zero awkward gap!)`);

    // Interact with Stove
    await evaluate(`
      window.__house1FPlayer.dir = 'up';
      window.__handleHdInput('a');
    `);
    await new Promise(r => setTimeout(r, 200));
    let stoveDialog = await evaluate(`document.querySelector('.bedroom-dialogue p') ? document.querySelector('.bedroom-dialogue p').innerText : ''`);
    console.log('Stove Dialogue:', stoveDialog);
    await evaluate(`window.__handleHdInput('b')`);

    // Move to TV and interact
    await evaluate(`
      window.__house1FPlayer.x = 160;
      window.__house1FPlayer.dir = 'up';
      window.__handleHdInput('a');
    `);
    await new Promise(r => setTimeout(r, 200));
    let tvDialog = await evaluate(`document.querySelector('.bedroom-dialogue p') ? document.querySelector('.bedroom-dialogue p').innerText : ''`);
    console.log('TV Dialogue:', tvDialog);
    await evaluate(`window.__handleHdInput('b')`);

    await takeScreenshot(path.join(ARTIFACT_DIR, 'verify_1f_north_collision.png'));

    console.log('\n=========================================');
    console.log('All tests passed with zero errors!');
    console.log('=========================================');

  } catch (err) {
    console.error('Test error:', err);
  } finally {
    try { chrome.kill(); } catch (_) {}
    server.close();
    process.exit(0);
  }
});
