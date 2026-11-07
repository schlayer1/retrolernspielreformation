const { spawn } = require('child_process');
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ARTIFACT_DIR = path.resolve(__dirname, '..', 'artifacts');
const CONV_DIR = '/Users/nicolekeller/.gemini/antigravity/brain/f30679f4-6f30-4f17-ad2d-ab40dd2c3e8a';
const PORT = 4187;

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}
if (!fs.existsSync(CONV_DIR)) {
  fs.mkdirSync(CONV_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function saveScreenshot(page, filename) {
  const p1 = path.join(ARTIFACT_DIR, filename);
  const p2 = path.join(CONV_DIR, filename);
  await page.screenshot({ path: p1 });
  try {
    fs.copyFileSync(p1, p2);
  } catch (e) {}
  console.log(`✅ Captured: ${filename}`);
}

async function main() {
  console.log(`🚀 Starting Vite preview server on port ${PORT}...`);
  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'pipe',
  });

  server.stdout.on('data', (d) => console.log(`[Vite] ${d.toString().trim()}`));
  server.stderr.on('data', (d) => console.error(`[Vite Err] ${d.toString().trim()}`));

  await sleep(2500);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const errors = [];
  const failedUrls = [];

  try {
    const page = await browser.newPage();

    page.on('pageerror', (err) => {
      console.error('PAGE ERROR:', err.message);
      errors.push(`PAGEERROR: ${err.message}`);
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error('CONSOLE ERROR:', msg.text());
        errors.push(`CONSOLE: ${msg.text()}`);
      }
    });

    page.on('response', (res) => {
      if (res.status() >= 400) {
        console.warn(`FAILED RESOURCE [${res.status()}]: ${res.url()}`);
        failedUrls.push(`${res.status()} ${res.url()}`);
      }
    });

    // 1. Desktop Start Screen (1440x900)
    console.log(`Navigating to http://localhost:${PORT}/ ...`);
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0' });
    await sleep(1500);
    await saveScreenshot(page, 'verify_1_desktop_start.png');

    // 2. Mobile Landscape Start Screen (844x390, iPhone Querformat)
    await page.setViewport({ width: 844, height: 390, deviceScaleFactor: 2 });
    await sleep(600);
    await saveScreenshot(page, 'verify_2_mobile_start.png');

    // 3. Switch back to Desktop 1440x900 & Launch Chapter 1 Dialog
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await sleep(400);
    await page.evaluate(() => {
      const b = document.querySelector('#btn-start-game, #btn-start-adventure');
      if (b) b.click();
    });
    await sleep(800);

    // Open mentor dialog if not already open
    await page.evaluate(() => {
      const win = window;
      if (win.__openMentorDialog && win.__CHAPTERS__) {
        win.__openMentorDialog(win.__CHAPTERS__[0]);
      }
    });
    await sleep(600);
    await saveScreenshot(page, 'verify_3_ch1_dialog.png');

    // 4. Close dialog -> Chapter 1 Overworld + Steinzeit Top-HUD + Hotbar
    await page.evaluate(() => {
      const btn = document.querySelector('#btn-dialog-close');
      if (btn) btn.click();
      else if (window.__closeModal) window.__closeModal();
    });
    await sleep(800);
    await saveScreenshot(page, 'verify_4_ch1_overworld.png');

    // 4a-d. Test & verify 4-direction turning with character movement
    // Walk Right
    await page.keyboard.down('KeyD');
    await sleep(400);
    await page.keyboard.up('KeyD');
    await sleep(150);
    await saveScreenshot(page, 'verify_4a_facing_right.png');

    // Walk Left
    await page.keyboard.down('KeyA');
    await sleep(500);
    await page.keyboard.up('KeyA');
    await sleep(150);
    await saveScreenshot(page, 'verify_4b_facing_left.png');

    // Walk Up
    await page.keyboard.down('KeyW');
    await sleep(400);
    await page.keyboard.up('KeyW');
    await sleep(150);
    await saveScreenshot(page, 'verify_4c_facing_up.png');

    // Walk Down
    await page.keyboard.down('KeyS');
    await sleep(400);
    await page.keyboard.up('KeyS');
    await sleep(150);
    await saveScreenshot(page, 'verify_4d_facing_down.png');

    // 5. River & Flora exploration
    await page.evaluate(() => {
      const win = window;
      const game = win.__GAME__;
      if (game) {
        const world = game.scene.getScene('WorldScene');
        if (world && world.player) {
          world.player.setPosition(42 * 16, 64 * 16);
          world.cameras.main.centerOn(42 * 16, 64 * 16);
        }
      }
    });
    await sleep(1000);
    await saveScreenshot(page, 'verify_5_river_and_flora.png');

    // 6. Crafting / Workshop Modal ([C])
    await page.keyboard.press('KeyC');
    await sleep(600);
    await saveScreenshot(page, 'verify_6_crafting_modal.png');
    await page.evaluate(() => { if (window.__closeModal) window.__closeModal(); });
    await sleep(400);

    // 7. Progressive 2-Column Lexicon Modal ([L] - 27 entries)
    await page.keyboard.press('KeyL');
    await sleep(600);
    await saveScreenshot(page, 'verify_7_lexicon_modal.png');
    await page.evaluate(() => { if (window.__closeModal) window.__closeModal(); });
    await sleep(400);

    // 8. Interactive Didactic Station (Ablasshandel)
    await page.evaluate(() => {
      if (typeof window.__openStation === 'function') {
        window.__openStation('station_ablass');
      }
    });
    await sleep(650);
    await saveScreenshot(page, 'verify_8_interactive_station.png');
    await page.evaluate(() => {
      const el = document.getElementById('station-modal');
      if (el) el.remove();
    });
    await sleep(400);

    // 9. 360° Artifact Inspector Modal (95 Thesen)
    await page.evaluate(() => {
      if (typeof window.__openArtifactInspector === 'function') {
        window.__openArtifactInspector('thesen_95');
      }
    });
    await sleep(650);
    await saveScreenshot(page, 'verify_9_artifact_inspector.png');
    await page.evaluate(() => {
      const el = document.getElementById('artifact-inspector-modal');
      if (el) el.remove();
    });
    await sleep(400);

    // 10. 7-Tile Pause Dashboard ([P])
    await page.keyboard.press('KeyP');
    await sleep(600);
    await saveScreenshot(page, 'verify_10_pause_dashboard.png');
    await page.evaluate(() => { if (window.__closeModal) window.__closeModal(); });
    await sleep(400);

    // 11. Walkable Reformation Interior Scene (Lutherstube Wittenberg)
    await page.evaluate(() => {
      if (typeof window.__enterSampleInterior === 'function') {
        window.__enterSampleInterior();
      }
    });
    await sleep(900);
    await saveScreenshot(page, 'verify_11_interior_scene.png');

    console.log('Errors:', errors.length);
    if (errors.length > 0) console.error(errors);
    console.log('Failed URLs:', failedUrls.length);
    if (failedUrls.length > 0) console.error(failedUrls);

    if (errors.length > 0 || failedUrls.length > 0) {
      process.exitCode = 1;
    } else {
      console.log('🏆 ALL 11 BROWSER VERIFICATION SCREENSHOTS CAPTURED WITH 0 ERRORS!');
    }
  } finally {
    await browser.close();
    server.kill();
  }
}

main().catch((err) => {
  console.error('Verification script failed:', err);
  process.exit(1);
});
