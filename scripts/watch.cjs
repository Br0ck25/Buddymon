/**
 * Buddymon File Watcher & Auto-Builder
 * Automatically watches source files and rebuilds index.html & worker.js on any changes.
 */
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const WATCH_TARGETS = [
  path.join(ROOT_DIR, 'build_buddymon.cjs'),
  path.join(ROOT_DIR, 'sw.js'),
  path.join(ROOT_DIR, 'manifest.json'),
  path.join(ROOT_DIR, 'assets')
];

let isBuilding = false;
let pendingBuild = false;
let debounceTimer = null;

function runAutoBuild(changedFile) {
  if (isBuilding) {
    pendingBuild = true;
    return;
  }

  isBuilding = true;
  const changedName = path.basename(changedFile || 'source');
  const now = new Date().toLocaleTimeString();
  console.log(`[${now}] Change detected in "${changedName}". Auto-building index.html & worker.js...`);

  const startTime = Date.now();
  exec('node scripts/build.cjs', { cwd: ROOT_DIR }, (err, stdout, stderr) => {
    isBuilding = false;
    const elapsed = Date.now() - startTime;

    if (err) {
      console.error(`❌ [${new Date().toLocaleTimeString()}] Auto-build failed in ${elapsed}ms:`, err.message);
      if (stderr) console.error(stderr);
    } else {
      console.log(`✓ [${new Date().toLocaleTimeString()}] Auto-rebuilt index.html & worker.js in ${elapsed}ms`);
    }

    if (pendingBuild) {
      pendingBuild = false;
      triggerBuild('queued change');
    }
  });
}

function triggerBuild(filePath) {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => runAutoBuild(filePath), 200);
}

console.log('==================================================');
console.log('   Buddymon Live Auto-Builder Watcher            ');
console.log('   Watching for changes to auto-build worker.js   ');
console.log('==================================================\n');

// Initial build check
runAutoBuild('initial startup');

WATCH_TARGETS.forEach(target => {
  if (!fs.existsSync(target)) return;
  const isDir = fs.statSync(target).isDirectory();
  fs.watch(target, { recursive: isDir }, (eventType, filename) => {
    if (filename && (filename.includes('index.html') || filename.includes('worker.js') || filename.endsWith('.tmp'))) {
      return; // Ignore generated output files to prevent infinite loop
    }
    triggerBuild(filename || target);
  });
  console.log(`Watching: ${path.relative(ROOT_DIR, target)}`);
});

console.log('\n[Auto-Builder Active] Press Ctrl+C to stop.\n');
