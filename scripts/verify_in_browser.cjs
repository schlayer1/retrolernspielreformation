const { spawn } = require('child_process');
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ARTIFACT_DIR = path.resolve(__dirname, '..', 'artifacts');
const CONV_DIR = '/Users/nicolekeller/.gemini/antigravity/brain/f30679f4-6f30-4f17-ad2d-ab40dd2c3e8a';
const PORT = 4187;

if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
if (!fs.existsSync(CONV_DIR)) fs.mkdirSync(CONV_DIR, { recursive: true });

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function saveScreenshot(page, filename) {
  const p1 = path.join(ARTIFACT_DIR, filename);
  const p2 = path.join(CONV_DIR, filename);
  await page.screenshot({ path: p1 });
  try {
    fs.copyFileSync(p1, p2);
  } catch {}
  console.log(`✅ Captured: ${filename}`);
}

async function main() {
  console.log(`🚀 Starting Vite preview server on port ${PORT}...`);
  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'pipe',
  });

  await sleep(2200);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const errors = [];
  const failedUrls = [];
  const assertFailures = [];

  function assertCond(cond, msg) {
    if (!cond) {
      console.error('❌ ASSERT FAILED:', msg);
      assertFailures.push(msg);
    } else {
      console.log('  ✓ ASSERT OK:', msg);
    }
  }

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

    // 1. Desktop Start Screen (1280x800)
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0' });
    await sleep(1400);
    const desktopOverflow = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      iw: window.innerWidth,
    }));
    assertCond(desktopOverflow.sw <= desktopOverflow.iw + 1, `Desktop StartScreen no horizontal overflow (${desktopOverflow.sw} <= ${desktopOverflow.iw})`);
    await saveScreenshot(page, 'verify_1_desktop_start.png');

    // 2. Mobile Landscape Start Screen (844x390)
    await page.setViewport({ width: 844, height: 390, deviceScaleFactor: 2 });
    await sleep(500);
    const mobileOverflow = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      iw: window.innerWidth,
    }));
    assertCond(mobileOverflow.sw <= mobileOverflow.iw + 1, `Mobile Landscape StartScreen no horizontal overflow (${mobileOverflow.sw} <= ${mobileOverflow.iw})`);
    await saveScreenshot(page, 'verify_2_mobile_start.png');

    // 3. Female Character Selected on Start Screen (1280x800)
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
    await sleep(300);
    await page.evaluate(() => {
      const femBtn = document.getElementById('btn-gender-female');
      if (femBtn) femBtn.click();
    });
    await sleep(350);
    await saveScreenshot(page, 'verify_3_start_female.png');

    // Switch back to male Lucas and Launch Chapter 1
    await page.evaluate(() => {
      document.getElementById('btn-gender-male')?.click();
      document.getElementById('btn-start-game')?.click();
    });
    await sleep(900);

    // 4. Ch1 Overworld + Assert HUD & Quest Tracker Visible
    const hudVis = await page.evaluate(() => {
      const top = document.getElementById('hud-top-bar');
      const bot = document.getElementById('quest-tracker-box');
      return {
        topW: top ? top.offsetWidth : 0,
        topH: top ? top.offsetHeight : 0,
        botW: bot ? bot.offsetWidth : 0,
        botH: bot ? bot.offsetHeight : 0,
      };
    });
    assertCond(hudVis.topW > 0 && hudVis.topH > 0, `Top HUD visible on launch (${hudVis.topW}x${hudVis.topH})`);
    assertCond(hudVis.botW > 0 && hudVis.botH > 0, `Bottom Hotbar/Quest visible on launch (${hudVis.botW}x${hudVis.botH})`);
    await saveScreenshot(page, 'verify_4_ch1_overworld.png');

    // PHYSICS COLLISION TEST: Try walking directly east into Wittenberg Fountain (wittenberg_brunnen at 26*16, 24*16)
    await page.evaluate(() => {
      const w = window.__WORLD__;
      w.player.setPosition(24 * 16 + 4, 24 * 16 - 4);
    });
    await sleep(100);
    await page.keyboard.down('KeyD');
    await sleep(650);
    await page.keyboard.up('KeyD');
    const fountainTest = await page.evaluate(() => ({
      px: window.__WORLD__.player.x,
      wellX: 26 * 16,
    }));
    assertCond(fountainTest.px < fountainTest.wellX + 4, `Physics collision stops player at Wittenberg fountain (px=${Math.round(fountainTest.px)}, wellX=${fountainTest.wellX})`);

    // Reset back to Wittenberg Ch1 spawn
    await page.evaluate(() => {
      window.__teleportToChapter?.(1);
    });
    await sleep(300);

    // 5. Elbe River, Smooth Water, Bridge, Reeds & Flora
    await page.evaluate(() => {
      const w = window.__WORLD__;
      w.player.setPosition(47 * 16, 24 * 16);
      w.cameras.main.centerOn(48 * 16, 24 * 16);
    });
    await sleep(700);
    await saveScreenshot(page, 'verify_5_river_and_flora.png');

    // 6. Wartburg 3D Plateau Cliffs & Two Stairs
    await page.evaluate(() => {
      const w = window.__WORLD__;
      w.player.setPosition(15.5 * 16, 65 * 16);
      w.cameras.main.centerOn(22 * 16, 67 * 16);
    });
    await sleep(700);
    await saveScreenshot(page, 'verify_6_wartburg_cliffs.png');

    // Restore to Wittenberg spawn
    await page.evaluate(() => {
      window.__teleportToChapter?.(1);
    });
    await sleep(300);

    // 7. Crafting & Gutenberg Modal ([C])
    await page.keyboard.press('KeyC');
    await sleep(450);
    await saveScreenshot(page, 'verify_7_crafting_modal.png');
    await page.evaluate(() => window.__closeModal?.());
    await sleep(250);

    // 8. Lexicon Modal ([L]) + MODAL FREEZE TEST
    await page.keyboard.press('KeyL');
    await sleep(400);
    const beforeModalX = await page.evaluate(() => window.__WORLD__.player.x);
    await page.keyboard.down('KeyD');
    await sleep(350);
    await page.keyboard.up('KeyD');
    const afterModalX = await page.evaluate(() => window.__WORLD__.player.x);
    assertCond(Math.abs(afterModalX - beforeModalX) < 0.5, `Modal freezes player movement (before=${beforeModalX}, after=${afterModalX})`);
    await saveScreenshot(page, 'verify_8_lexicon_modal.png');
    await page.evaluate(() => window.__closeModal?.());
    await sleep(250);

    // 9. Interactive Didactic Station (Warm-Parchment StationModal)
    await page.evaluate(() => window.__openStation?.('station_ablass'));
    await sleep(450);
    await saveScreenshot(page, 'verify_9_interactive_station.png');
    await page.evaluate(() => window.__closeModal?.());
    await sleep(250);

    // 10. 360° Artifact Inspector Modal (Warm-Parchment 95 Thesen)
    await page.evaluate(() => window.__openArtifactInspector?.('thesen_95'));
    await sleep(450);
    await saveScreenshot(page, 'verify_10_artifact_inspector.png');
    await page.evaluate(() => window.__closeModal?.());
    await sleep(250);

    // 11. 7-Tile Pause Dashboard ([P])
    await page.keyboard.press('KeyP');
    await sleep(450);
    await saveScreenshot(page, 'verify_11_pause_dashboard.png');
    await page.evaluate(() => window.__closeModal?.());
    await sleep(250);

    // 12. Authentic Tiled InteriorScene
    await page.evaluate(() => window.__enterSampleInterior?.());
    await sleep(850);
    const interiorActive = await page.evaluate(() => Boolean(window.__activeInterior));
    assertCond(interiorActive, 'InteriorScene registered __activeInterior bridge');
    await saveScreenshot(page, 'verify_12_interior_scene.png');

    // Exit interior cleanly back to WorldScene
    await page.evaluate(() => window.__activeInterior?.exit?.());
    await sleep(500);

    // CH1 END-TO-END PROGRESSION TEST: Complete all 4 Ch1 objectives -> Mentor Quiz -> Advance to Ch2
    await page.evaluate(() => {
      window.__STATE__.completeObjective(1, 0);
      window.__STATE__.completeObjective(1, 1);
      window.__STATE__.completeObjective(1, 2);
      window.__STATE__.completeObjective(1, 3);
      window.__openMentorDialog?.(1);
    });
    await sleep(350);
    // Test opening Disputation Quiz inside mentor dialog, answering Q1, then returning & advancing to Ch2
    await page.evaluate(() => {
      document.getElementById('btn-start-quiz')?.click();
    });
    await sleep(250);
    await page.evaluate(() => {
      document.querySelector('.dialog-quiz-opt[data-idx="0"]')?.click();
    });
    await sleep(200);
    const quizFeedbackVisible = await page.evaluate(() => {
      const fb = document.getElementById('dialog-quiz-fb');
      return Boolean(fb && fb.style.display !== 'none' && fb.textContent?.includes('Richtig'));
    });
    assertCond(quizFeedbackVisible, 'Disputation Q1 feedback displays cleanly');
    await page.evaluate(() => {
      document.getElementById('btn-quiz-back')?.click();
    });
    await sleep(250);
    await page.evaluate(() => document.getElementById('btn-advance-ch')?.click());
    await sleep(650);
    const chAfterAdvance = await page.evaluate(() => window.__STATE__.chapter);
    assertCond(chAfterAdvance === 2, `Chapter 1 completes and advances to Chapter 2 (chapter=${chAfterAdvance})`);

    // EXTENDED SWEEP 1: Verify all 8 Chapter Spawns (in bounds + 0 obstacle overlaps)
    for (let ch = 1; ch <= 8; ch++) {
      const chCheck = await page.evaluate((chNum) => {
        window.__teleportToChapter?.(chNum);
        const w = window.__WORLD__;
        const p = w.player;
        const pb = p.body;
        const obs = w.obstacles ? w.obstacles.getChildren() : [];
        const overlapping = [];
        for (const o of obs) {
          const ob = o.body;
          if (!ob) continue;
          if (pb.left < ob.right && pb.right > ob.left && pb.top < ob.bottom && pb.bottom > ob.top) {
            overlapping.push({ x: Math.round(o.x), y: Math.round(o.y) });
          }
        }
        return {
          px: Math.round(p.x),
          py: Math.round(p.y),
          inBounds: p.x > 32 && p.x < 96 * 16 - 32 && p.y > 32 && p.y < 88 * 16 - 32,
          overlapping,
        };
      }, ch);
      assertCond(chCheck.inBounds && chCheck.overlapping.length === 0, `Ch${ch} spawn valid & clear (${chCheck.px},${chCheck.py}, overlaps=${chCheck.overlapping.length})`);
    }

    // EXTENDED SWEEP 2: Verify all 8 Interiors + capture Wartburg & Worms scratch views
    const scratchDir = path.join(CONV_DIR, 'scratch');
    try {
      if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });
    } catch {}
    await page.evaluate(() => window.__teleportToChapter?.(1));
    await sleep(200);
    const allRooms = [
      { id: 'schlosskirche_portal', expectedMentor: 'Luther' },
      { id: 'cranach_werkstatt_druckerei', expectedMentor: 'Cranach' },
      { id: 'fuggerpalais_augsburg', expectedMentor: 'Cajetan' },
      { id: 'reichstagssaal_worms', expectedMentor: 'Karl V.' },
      { id: 'wartburg_stube', expectedMentor: 'Junker Jörg' },
      { id: 'lutherstube_wittenberg', expectedMentor: 'Katharina' },
      { id: 'bauernrat_stube', expectedMentor: 'Bauernsprecher Jörg' },
      { id: 'rathaus_friedenssaal', expectedMentor: 'Friedrich' },
    ];
    for (const rm of allRooms) {
      await page.evaluate((id) => {
        const w = window.__WORLD__;
        w.scene.pause('WorldScene');
        w.scene.launch('InteriorScene', { roomId: id, returnX: w.player.x, returnY: w.player.y });
      }, rm.id);
      await sleep(450);

      const intInfo = await page.evaluate(() => {
        const active = Boolean(window.__activeInterior);
        const scene = window.__WORLD__?.scene.get('InteriorScene');
        const p = scene?.player;
        const pb = p?.body;
        const obs = scene?.solidColliders ? scene.solidColliders.getChildren() : [];
        const overlaps = [];
        if (pb) {
          for (const o of obs) {
            const ob = o.body;
            if (!ob) continue;
            if (pb.left < ob.right && pb.right > ob.left && pb.top < ob.bottom && pb.bottom > ob.top) {
              overlaps.push({ x: Math.round(o.x), y: Math.round(o.y) });
            }
          }
        }
        const intNp = document.getElementById('interior-mentor-nameplate');
        const worldNps = document.getElementById('floating-nameplates-layer');
        const exitBadge = document.getElementById('interior-exit-badge');
        const intNpZ = intNp ? parseInt(getComputedStyle(intNp).zIndex || '0', 10) : 0;
        return {
          active,
          overlaps,
          intNpVisible: Boolean(intNp && intNp.style.display !== 'none' && intNpZ >= 6),
          intNpText: intNp ? intNp.textContent : '',
          worldNpsHidden: !worldNps || worldNps.style.display === 'none',
          exitBadgeVisible: Boolean(exitBadge && exitBadge.style.display !== 'none'),
        };
      });
      assertCond(
        intInfo.active && intInfo.overlaps.length === 0 && intInfo.intNpVisible && intInfo.intNpText.includes(rm.expectedMentor) && intInfo.worldNpsHidden && intInfo.exitBadgeVisible,
        `Interior '${rm.id}' clean (mentor='${rm.expectedMentor}', overlaps=${intInfo.overlaps.length})`
      );

      if (rm.id === 'wartburg_stube') {
        const pArt = path.join(ARTIFACT_DIR, 'verify_wartburg_fixed.png');
        await page.screenshot({ path: pArt });
        try { fs.copyFileSync(pArt, path.join(scratchDir, 'verify_wartburg_fixed.png')); } catch {}
      } else if (rm.id === 'reichstagssaal_worms') {
        const pArt = path.join(ARTIFACT_DIR, 'verify_worms_fixed.png');
        await page.screenshot({ path: pArt });
        try { fs.copyFileSync(pArt, path.join(scratchDir, 'verify_worms_fixed.png')); } catch {}
      }

      await page.evaluate(() => window.__activeInterior?.exit?.());
      await sleep(300);
      const exited = await page.evaluate(() => !window.__activeInterior);
      assertCond(exited, `Interior '${rm.id}' exited cleanly`);
    }

    // EXTENDED SWEEP 3: Inventory [I] + eatFood, Dilemma [H], Timeline [Z], Certificate [U] + Hefter-Code + PrintSheet
    await page.keyboard.press('KeyI');
    await sleep(300);
    const invInfo = await page.evaluate(() => {
      const m = document.getElementById('modal-overlay');
      const slots = document.querySelectorAll('.inv-item-slot').length;
      window.__STATE__.piety = 40;
      window.__eatFood?.();
      return { open: m?.style.display !== 'none', slots, pietyAfterEat: window.__STATE__.piety };
    });
    assertCond(invInfo.open && invInfo.slots > 0 && invInfo.pietyAfterEat > 40, `Inventory [I] + eatFood boosts piety (${invInfo.slots} slots, piety=${invInfo.pietyAfterEat})`);
    await page.evaluate(() => window.__closeModal?.());
    await sleep(200);

    await page.keyboard.press('KeyH');
    await sleep(300);
    await page.evaluate(() => {
      const firstOpt = document.querySelector('#dilemma-modal .dilemma-opt-btn');
      if (firstOpt) firstOpt.click();
    });
    await sleep(250);
    await page.evaluate(() => {
      const closeBtn = document.querySelector('#dilemma-modal .outcome-close-btn');
      if (closeBtn) closeBtn.click();
    });
    await sleep(200);
    const dilSummary = await page.evaluate(() => window.__STATE__.dilemmaSummary || '');
    assertCond(dilSummary.length > 0, `Dilemma [H] 2-step flow populates dilemmaSummary ('${dilSummary.slice(0, 42)}')`);

    await page.keyboard.press('KeyZ');
    await sleep(250);
    const tlOpen = await page.evaluate(() => {
      const el = document.getElementById('timeline-modal');
      return Boolean(el && el.style.display !== 'none');
    });
    assertCond(tlOpen, 'Timeline modal [Z] opens cleanly');
    await page.evaluate(() => window.__closeModal?.());
    await sleep(200);

    await page.keyboard.press('KeyU');
    await sleep(250);
    const certRes = await page.evaluate(() => {
      const m = document.getElementById('modal-overlay');
      const code = window.__STATE__.generateHefterCode();
      const loaded = window.__STATE__.loadFromHefterCode(code);
      const origPrint = window.print;
      window.print = () => {};
      window.__triggerPrintSheet?.();
      window.print = origPrint;
      const sheet = document.getElementById('hefter-print-sheet');
      const html = sheet ? sheet.innerHTML : '';
      return {
        open: Boolean(m && m.style.display !== 'none'),
        code,
        loaded,
        hasCode: html.includes(code),
        hasSummary: window.__STATE__.dilemmaSummary ? html.includes(window.__STATE__.dilemmaSummary) : false,
        hasForbiddenGrading: /Gesehen|Fachlehrer|Zensur|Note:/i.test(html),
      };
    });
    assertCond(certRes.open && certRes.loaded && certRes.hasCode && certRes.hasSummary && !certRes.hasForbiddenGrading, `Certificate [U] + Hefter-Code (${certRes.code}) + ink-safe PrintSheet verified`);
    await page.evaluate(() => window.__closeModal?.());
    await sleep(150);

    console.log('\n=== VERIFICATION SUMMARY ===');
    console.log('Console/Page Errors:', errors.length);
    console.log('Failed URLs (HTTP>=400):', failedUrls.length);
    console.log('Assertion Failures:', assertFailures.length);

    if (errors.length > 0 || failedUrls.length > 0 || assertFailures.length > 0) {
      if (errors.length) console.error('Errors:', errors);
      if (failedUrls.length) console.error('Failed URLs:', failedUrls);
      if (assertFailures.length) console.error('Assertions:', assertFailures);
      process.exitCode = 1;
    } else {
      console.log('🏆 ALL 12 SCREENSHOTS & ALL FUNCTIONAL ASSERTIONS PASSED WITH 0 ERRORS!');
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
