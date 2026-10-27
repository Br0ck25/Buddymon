/**
 * Buddymon Automated Build Runner
 * Compiles HD vector assets, runtime logic, index.html, and worker.js automatically.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('==================================================');
console.log('   Buddymon Auto-Build Pipeline                  ');
console.log('==================================================');

const startTime = Date.now();

try {
  // Execute the main compiler
  const buildOutput = execSync('node build_buddymon.cjs', { encoding: 'utf8' });
  console.log(buildOutput.trim());

  // Verify built artifacts
  const htmlPath = path.join(__dirname, '..', 'index.html');
  const workerPath = path.join(__dirname, '..', 'worker.js');

  const htmlSize = fs.existsSync(htmlPath) ? (fs.statSync(htmlPath).size / 1024).toFixed(1) + ' KB' : 'MISSING';
  const workerSize = fs.existsSync(workerPath) ? (fs.statSync(workerPath).size / 1024).toFixed(1) + ' KB' : 'MISSING';

  const elapsed = Date.now() - startTime;
  console.log('--------------------------------------------------');
  console.log(`✓ index.html: ${htmlSize}`);
  console.log(`✓ worker.js:  ${workerSize}`);
  console.log(`✓ Successfully compiled in ${elapsed}ms`);
  console.log('==================================================\n');
} catch (err) {
  console.error('\n❌ Build failed:', err.message);
  if (err.stdout) console.error(err.stdout);
  if (err.stderr) console.error(err.stderr);
  process.exit(1);
}
