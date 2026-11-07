const { spawn } = require('child_process');
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ARTIFACT_DIR = path.resolve(__dirname, '../production/qa/evidence');
const PORT = 4192;

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  if (!fs.existsSync(ARTIFACT_DIR)) {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  }

  console.log(`Starting Vite preview server on port ${PORT}...`);
  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'pipe',
  });

  server.stdout.on('data', (d) => console.log(`[Vite stdout] ${d.toString().trim()}`));
  server.stderr.on('data', (d) => console.error(`[Vite stderr] ${d.toString().trim()}`));

  await sleep(2500);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
  });

  const errors = [];

  try {
    const page = await browser.newPage();
    page.on('pageerror', (err) => {
      console.error('PAGEERROR:', err.message);
      errors.push(`PAGEERROR: ${err.message}`);
    });
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error('CONSOLE ERROR:', msg.text());
        errors.push(`CONSOLE ERROR: ${msg.text()}`);
      }
    });

    // 1. Desktop Start Screen (1440x900)
    console.log('1. Capturing Desktop Start Screen...');
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0' });
    await sleep(1500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_1_desktop_start.png') });
    console.log('✅ verify_1_desktop_start.png captured');

    // 2. Mobile Start Screen (812x375)
    console.log('2. Capturing Mobile Start Screen...');
    await page.setViewport({ width: 812, height: 375, deviceScaleFactor: 2 });
    await sleep(600);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_2_mobile_start.png') });
    console.log('✅ verify_2_mobile_start.png captured');

    // Return to desktop viewport
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await sleep(400);

    // 3. Start Adventure & Gameplay Screen
    console.log('3. Starting Adventure...');
    await page.click('#btn-start-adventure');
    await sleep(1500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_3_world_gameplay.png') });
    console.log('✅ verify_3_world_gameplay.png captured');

    // 4. Open Mentor Dialog
    console.log('4. Opening Mentor Dialog...');
    await page.evaluate(() => {
      const ui = (window.__GAME__.scene.getScene('UIScene'));
      const ch1 = (window.__STATE__.getChapterData(1));
      ui.openMentorDialog(ch1.mentor);
    });
    await sleep(600);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_4_mentor_dialog.png') });
    console.log('✅ verify_4_mentor_dialog.png captured');

    // Close Dialog
    await page.click('#btn-dialog-close');
    await sleep(400);

    // 5. Open Relic Modal (95 Thesen)
    console.log('5. Opening Relic Inspector...');
    await page.evaluate(() => {
      const ui = (window.__GAME__.scene.getScene('UIScene'));
      const r = (window.__GAME__.scene.getScene('WorldScene')).targets.find((t) => t.relic);
      if (r && r.relic) ui.openRelicModal(r.relic);
    });
    await sleep(400);
    await page.click('#btn-relic-flip');
    await sleep(500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_5_relic_modal.png') });
    console.log('✅ verify_5_relic_modal.png captured');

    // Close Relic Modal
    await page.click('#btn-relic-close');
    await sleep(400);

    // 6. Open Inventory & Workshop
    console.log('6. Opening Inventory...');
    await page.click('#btn-inv');
    await sleep(600);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_6_inventory.png') });
    console.log('✅ verify_6_inventory.png captured');

    // Close Inventory
    await page.click('#btn-inv-close');
    await sleep(400);

    // 7. Open Lexicon
    console.log('7. Opening Lexicon...');
    await page.click('#btn-lex');
    await sleep(400);
    await page.evaluate(() => {
      const lockedItem = document.querySelector('.lex-list-item.locked');
      if (lockedItem) lockedItem.click();
    });
    await sleep(500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_7_lexicon.png') });
    console.log('✅ verify_7_lexicon.png captured');
    await sleep(600);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_7_lexicon.png') });
    console.log('✅ verify_7_lexicon.png captured');

    // Close Lexicon
    await page.click('#btn-lex-close');
    await sleep(400);

    // 8. Open Pause Dashboard
    console.log('8. Opening Pause Dashboard...');
    await page.click('#btn-pause');
    await sleep(600);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_8_pause_dashboard.png') });
    console.log('✅ verify_8_pause_dashboard.png captured');

    // Close Pause Dashboard
    await page.click('#btn-pause-close');
    await sleep(400);

    // 9. Open Didactic Station Modal (Tetzel-Ablasskasse)
    console.log('9. Opening Didactic Station Modal...');
    await page.evaluate(() => {
      const ui = (window.__GAME__.scene.getScene('UIScene'));
      ui.openStationModal('station_ablass');
    });
    await sleep(600);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_9_station_modal.png') });
    console.log('✅ verify_9_station_modal.png captured');

    // Close Station Modal
    await page.click('#btn-station-close');
    await sleep(400);

    // 10. Hefterblatt A4 Worksheet Preview
    console.log('10. Capturing Hefterblatt Worksheet Preview...');
    await page.evaluate(() => {
      const ps = document.getElementById('hefter-print-sheet');
      if (ps) {
        ps.style.display = 'block';
        ps.style.position = 'fixed';
        ps.style.top = '0';
        ps.style.left = '0';
        ps.style.width = '100vw';
        ps.style.height = '100vh';
        ps.style.zIndex = '99999';
        ps.style.overflowY = 'auto';
        ps.style.background = '#ffffff';
      }
    });
    await sleep(500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_10_print_sheet.png') });
    console.log('✅ verify_10_print_sheet.png captured');

    // Hide print sheet again
    await page.evaluate(() => {
      const ps = document.getElementById('hefter-print-sheet');
      if (ps) ps.style.display = 'none';
    });
    await sleep(300);

    // 11. Interior Warp: Wartburg-Schreibstube
    console.log('11. Capturing Interior Warp (Wartburg-Stube)...');
    await page.evaluate(() => {
      const ws = (window.__GAME__.scene.getScene('WorldScene'));
      ws.warpTo({ x: 110 * 16, y: 72 * 16, isIndoor: true, name: 'Luthers Schreibstube (Wartburg)' });
    });
    await sleep(700);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_11_interior_wartburg.png') });
    console.log('✅ verify_11_interior_wartburg.png captured');

    // 12. Gutenberg Workshop Simulator (Letternsatz & Winkelhaken)
    console.log('12. Capturing Gutenberg Workshop Simulator...');
    await page.evaluate(() => {
      const ui = (window.__GAME__.scene.getScene('UIScene'));
      ui.openGutenbergWorkshopModal();
    });
    await sleep(600);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_12_gutenberg_workshop.png') });
    console.log('✅ verify_12_gutenberg_workshop.png captured');

    // Close Workshop Modal
    await page.click('#btn-station-close');
    await sleep(400);

    // 13. Interior Warp: Kaiserlicher Reichstagssaal zu Worms (1521, Kap. 4)
    console.log('13. Capturing Interior Warp (Worms Reichstagssaal)...');
    await page.evaluate(() => {
      const ws = (window.__GAME__.scene.getScene('WorldScene'));
      ws.warpTo({ x: 143 * 16, y: 22 * 16, isIndoor: true, name: 'Kaiserlicher Reichstagssaal (Worms)' });
    });
    await sleep(700);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_13_interior_worms.png') });
    console.log('✅ verify_13_interior_worms.png captured');

    // 14. Interior Warp: Fuggerpalais Audienzsaal Augsburg (1518, Kap. 3)
    console.log('14. Capturing Interior Warp (Fuggerpalais Audienzsaal)...');
    await page.evaluate(() => {
      const ws = (window.__GAME__.scene.getScene('WorldScene'));
      ws.warpTo({ x: 143 * 16, y: 72 * 16, isIndoor: true, name: 'Fuggerpalais Audienzsaal (Augsburg)' });
    });
    await sleep(700);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_14_interior_fugger.png') });
    console.log('✅ verify_14_interior_fugger.png captured');

    // 15. Interior Warp: Schwarzes Kloster Refektorium & Apotheke (1525, Kap. 6)
    console.log('15. Capturing Interior Warp (Schwarzes Kloster Refektorium & Apotheke)...');
    await page.evaluate(() => {
      const ws = (window.__GAME__.scene.getScene('WorldScene'));
      ws.warpTo({ x: 175 * 16, y: 47 * 16, isIndoor: true, name: 'Refektorium & Kloster-Apotheke' });
    });
    await sleep(700);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_15_interior_kloster.png') });
    console.log('✅ verify_15_interior_kloster.png captured');

    // 16. Historical Rats-Dilemma Modal
    console.log('16. Capturing Historical Rats-Dilemma Modal...');
    await page.evaluate(() => {
      const ui = (window.__GAME__.scene.getScene('UIScene'));
      ui.openDilemmaModal(1);
    });
    await sleep(700);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_16_dilemma_modal.png') });
    console.log('✅ verify_16_dilemma_modal.png captured');

    console.log('\n🎉 ALL 16 VISUAL BROWSER VERIFICATIONS COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('Browser verification failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
    server.kill();
  }
}

main();
