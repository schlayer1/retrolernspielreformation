const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const atlasJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/assets/world/world_atlas.json'), 'utf8'));
const frames = atlasJson.frames;

function getPngDims(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  } catch {
    return null;
  }
}

const propDims = {
  relic_marker_glow: { w: 32, h: 32 },
  npc: { w: 16, h: 32 },
  character: { w: 16, h: 32 },
};

const propsDir = path.join(ROOT, 'public/assets/props');
if (fs.existsSync(propsDir)) {
  for (const f of fs.readdirSync(propsDir)) {
    if (f.endsWith('.png')) {
      const dims = getPngDims(path.join(propsDir, f));
      if (dims) propDims[f.replace('.png', '')] = dims;
    }
  }
}

const items = [];
const outOfBoundsCoords = [];

function checkBound(label, tx, ty) {
  if (tx < 0 || tx >= 96 || ty < 0 || ty >= 88) {
    outOfBoundsCoords.push(`${label} out of 96x88 bounds: (${tx}, ${ty})`);
  }
}

function addBox(label, x, y, w, h, scale = 1, originX = 0.5, originY = 0.9, shrink = 0.9) {
  const sw = w * scale * shrink;
  const sh = h * scale * shrink;
  const cx = x + (0.5 - originX) * (w * scale);
  const cy = y + (0.5 - originY) * (h * scale);
  items.push({
    label,
    x: Math.round(x),
    y: Math.round(y),
    w: Math.round(w * scale),
    h: Math.round(h * scale),
    left: cx - sw / 2,
    right: cx + sw / 2,
    top: cy - sh / 2,
    bottom: cy + sh / 2,
  });
}

// 1. Parse REFORMATION_DECOR & RESOURCE_NODES from decor.ts
if (fs.existsSync(path.join(ROOT, 'src/data/decor.ts'))) {
  const decorCode = fs.readFileSync(path.join(ROOT, 'src/data/decor.ts'), 'utf8');
  const decorBlock = (decorCode.match(/export const REFORMATION_DECOR: DecorObject\[\] = \[([\s\S]*?)\];/) || [])[1] || '';
  const decorRegex = /\{\s*id:\s*'([^']+)'[\s\S]*?x:\s*(\d+)\s*\*\s*16[\s\S]*?y:\s*(\d+)\s*\*\s*16[\s\S]*?spriteKey:\s*'([^']+)'(?:[\s\S]*?scale:\s*([0-9.]+))?[^\}]*\}/g;
  let m;
  while ((m = decorRegex.exec(decorBlock)) !== null) {
    const [, id, txS, tyS, key, scS] = m;
    const tx = parseFloat(txS);
    const ty = parseFloat(tyS);
    checkBound(`decor:${id}`, tx, ty);
    const scale = scS ? parseFloat(scS) : 1.0;
    const d = propDims[key] || frames[key]?.frame || { w: 48, h: 48 };
    addBox(`decor:${id}(${tx},${ty})`, tx * 16, ty * 16, d.w, d.h, scale);
  }

  const nodeBlock = (decorCode.match(/export const RESOURCE_NODES: ResourceNode\[\] = \[([\s\S]*?)\];/) || [])[1] || '';
  const nodeRegex = /\{\s*id:\s*'([^']+)'[\s\S]*?x:\s*(\d+)\s*\*\s*16[\s\S]*?y:\s*(\d+)\s*\*\s*16[\s\S]*?spriteKey:\s*'([^']+)'/g;
  while ((m = nodeRegex.exec(nodeBlock)) !== null) {
    const [, id, txS, tyS, key] = m;
    const tx = parseFloat(txS);
    const ty = parseFloat(tyS);
    checkBound(`resource:${id}`, tx, ty);
    const d = propDims[key] || frames[key]?.frame || { w: 32, h: 32 };
    addBox(`resource:${id}(${tx},${ty})`, tx * 16, ty * 16, d.w, d.h, 0.85);
  }
}

// 2. Parse REFORMATION_RELICS from relics.ts
if (fs.existsSync(path.join(ROOT, 'src/data/relics.ts'))) {
  const relicsCode = fs.readFileSync(path.join(ROOT, 'src/data/relics.ts'), 'utf8');
  const relicRegex = /id:\s*'([^']+)'[\s\S]*?x:\s*(\d+)\s*\*\s*16\s*,\s*y:\s*(\d+)\s*\*\s*16/g;
  let m;
  while ((m = relicRegex.exec(relicsCode)) !== null) {
    const [, id, txS, tyS] = m;
    const tx = parseFloat(txS);
    const ty = parseFloat(tyS);
    checkBound(`relic:${id}`, tx, ty);
    addBox(`relic:${id}(${tx},${ty})`, tx * 16, ty * 16, 28, 28, 0.7, 0.5, 0.5);
  }
}

// 3. Parse Chapter Mentors & Spawns from chapters.ts
if (fs.existsSync(path.join(ROOT, 'src/data/chapters.ts'))) {
  const chaptersCode = fs.readFileSync(path.join(ROOT, 'src/data/chapters.ts'), 'utf8');
  const mentorRegex = /mentor:\s*\{[\s\S]*?name:\s*'([^']+)'[\s\S]*?x:\s*(\d+)\s*\*\s*16\s*,\s*y:\s*(\d+)\s*\*\s*16/g;
  let m;
  while ((m = mentorRegex.exec(chaptersCode)) !== null) {
    const [, name, txS, tyS] = m;
    const tx = parseFloat(txS);
    const ty = parseFloat(tyS);
    checkBound(`mentor:${name}`, tx, ty);
    addBox(`mentor:${name}(${tx},${ty})`, tx * 16, ty * 16, 16, 32, 1.0, 0.5, 0.9);
  }
  const spawnRegex = /spawn:\s*\{\s*x:\s*(\d+)\s*\*\s*16\s*,\s*y:\s*(\d+)\s*\*\s*16/g;
  let sIdx = 1;
  while ((m = spawnRegex.exec(chaptersCode)) !== null) {
    const tx = parseFloat(m[1]);
    const ty = parseFloat(m[2]);
    checkBound(`spawn:Ch${sIdx}`, tx, ty);
    addBox(`spawn:Ch${sIdx}(${tx},${ty})`, tx * 16, ty * 16, 14, 24, 1.0, 0.5, 0.85);
    sIdx++;
  }
}

// 4. Parse Didactic Stations from stations.ts
if (fs.existsSync(path.join(ROOT, 'src/data/stations.ts'))) {
  const stationsCode = fs.readFileSync(path.join(ROOT, 'src/data/stations.ts'), 'utf8');
  const stationRegex = /id:\s*'([^']+)'[\s\S]*?x:\s*(\d+)\s*\*\s*16\s*,\s*y:\s*(\d+)\s*\*\s*16/g;
  let m;
  while ((m = stationRegex.exec(stationsCode)) !== null) {
    const [, id, txS, tyS] = m;
    const tx = parseFloat(txS);
    const ty = parseFloat(tyS);
    checkBound(`station:${id}`, tx, ty);
    addBox(`station:${id}(${tx},${ty})`, tx * 16, ty * 16, 28, 28, 0.85, 0.5, 0.5);
  }
}

// 5. Bounds & Overlap Check
if (outOfBoundsCoords.length > 0) {
  console.error('❌ OUT-OF-BOUNDS COORDINATES (>= 96x88):');
  outOfBoundsCoords.forEach((e) => console.error('  - ' + e));
  process.exit(1);
}

let overlaps = 0;
for (let i = 0; i < items.length; i++) {
  for (let j = i + 1; j < items.length; j++) {
    const a = items[i];
    const b = items[j];
    const ix = Math.min(a.right, b.right) - Math.max(a.left, b.left);
    const iy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    if (ix > 2 && iy > 2) {
      overlaps++;
      console.error(
        `❌ OVERLAP #${overlaps}: ${a.label} [${a.w}x${a.h} at (${a.x},${a.y})] <-> ${b.label} [${b.w}x${b.h} at (${b.x},${b.y})] by ${Math.round(ix)}x${Math.round(iy)}px`
      );
    }
  }
}

if (overlaps > 0) {
  console.error(`\nFAILED: ${overlaps} visual bounding-box overlap(s) detected across ${items.length} placed objects!`);
  process.exit(1);
} else {
  console.log(`✅ Layout Check: ${items.length} placed objects within 96x88 verified with 0 bounding-box overlaps!`);
}

// 6. Comprehensive Asset, Spritesheet & Engine Integrity Gates
const gateErrors = [];
function checkGate(name, condition, errorMsg) {
  if (!condition) gateErrors.push(`❌ GATE FAILED: ${name} -> ${errorMsg}`);
  else console.log(`  ✅ ${name}: PASSED`);
}

// Verify all static /assets/... URLs in src/ exist in public/
const missingAssets = [];
function walkSrc(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkSrc(full);
    else if (/\.(ts|tsx)$/.test(entry.name)) {
      const code = fs.readFileSync(full, 'utf8');
      const assetMatches = code.matchAll(/['"`](\/assets\/[^'"`$\{]+)['"`]/g);
      for (const m of assetMatches) {
        const assetPath = path.join(ROOT, 'public', m[1]);
        if (!fs.existsSync(assetPath)) {
          missingAssets.push(`${path.relative(ROOT, full)} -> ${m[1]}`);
        }
      }
    }
  }
}
walkSrc(path.join(ROOT, 'src'));
checkGate('Asset Cross-Check (zero 404 paths)', missingAssets.length === 0, `Missing files:\n${missingAssets.join('\n')}`);

// Verify BootScene spritesheet dimensions & exact integer frame divisors
const bootCode = fs.readFileSync(path.join(ROOT, 'src/scenes/BootScene.ts'), 'utf8');
const ssRegex = /this\.load\.spritesheet\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*\{\s*frameWidth:\s*(\d+)\s*,\s*frameHeight:\s*(\d+)/g;
const ssFrameCounts = {};
const ssErrors = [];
let sm;
while ((sm = ssRegex.exec(bootCode)) !== null) {
  const [, key, url, fwS, fhS] = sm;
  const fw = parseInt(fwS, 10);
  const fh = parseInt(fhS, 10);
  const fullPath = path.join(ROOT, 'public', url);
  const dims = getPngDims(fullPath);
  if (!dims) {
    ssErrors.push(`Missing spritesheet file ${url} (${key})`);
    continue;
  }
  if (dims.w % fw !== 0 || dims.h % fh !== 0) {
    ssErrors.push(`${key} (${dims.w}x${dims.h}) is not evenly divisible by frame ${fw}x${fh}`);
  }
  ssFrameCounts[key] = (dims.w / fw) * (dims.h / fh);
}
checkGate('Spritesheet Frame Divisors', ssErrors.length === 0, ssErrors.join('; '));

// Quality Gates A-L
const mainCode = fs.readFileSync(path.join(ROOT, 'src/main.ts'), 'utf8');
checkGate('Gate A (Native 480x270 FIT)', mainCode.includes('GAME_W = 480') && mainCode.includes('GAME_H = 270') && mainCode.includes('Phaser.Scale.FIT'), 'main.ts must use 480x270 Phaser.Scale.FIT');

const lexCode = fs.readFileSync(path.join(ROOT, 'src/data/lexicon.ts'), 'utf8');
checkGate('Gate B (27 Lexicon Entries)', (lexCode.match(/id:\s*'[^']+'/g) || []).length === 27, 'Expected 27 lexicon entries');

const chCode = fs.readFileSync(path.join(ROOT, 'src/data/chapters.ts'), 'utf8');
checkGate('Gate C (8 Chapters + Quiz + Spawn)', (chCode.match(/mentor:\s*\{/g) || []).length === 8 && (chCode.match(/quiz:\s*\[/g) || []).length === 8 && (chCode.match(/spawn:\s*\{/g) || []).length >= 8, 'chapters.ts must define 8 chapters with spawn, mentor & quiz');

const stCode = fs.readFileSync(path.join(ROOT, 'src/data/stations.ts'), 'utf8');
checkGate('Gate D (5 Interactive Stations)', (stCode.match(/id:\s*'station_/g) || []).length === 5, 'stations.ts must define 5 stations');

const relCode = fs.readFileSync(path.join(ROOT, 'src/data/relics.ts'), 'utf8');
const relMatches = (relCode.match(/id:\s*'[a-z0-9_]+'/g) || []).filter((m) => !m.includes("'string'"));
checkGate('Gate E (5 Reformation Relics)', relMatches.length === 5, 'relics.ts must define 5 relics');

const intCode = fs.readFileSync(path.join(ROOT, 'src/scenes/InteriorScene.ts'), 'utf8');
checkGate(
  'Gate F (Tiled InteriorScene, zero fillRect/fillCircle)',
  intCode.includes('walls_and_floors') &&
    intCode.includes('lutherstube_wittenberg') &&
    intCode.includes('cranach_werkstatt_druckerei') &&
    intCode.includes('wartburg_stube') &&
    intCode.includes('schlosskirche_portal') &&
    intCode.includes('exitInterior') &&
    !intCode.includes('fillRect(') &&
    !intCode.includes('fillCircle('),
  'InteriorScene must use walls_and_floors tiles with 0 fillRect(/fillCircle( calls'
);

const worldCode = fs.readFileSync(path.join(ROOT, 'src/scenes/WorldScene.ts'), 'utf8');
checkGate(
  'Gate G (Arcade Physics, Smooth Water 48,112, Plateau Cliffs)',
  worldCode.includes('physics.add.sprite') &&
    worldCode.includes('buildPlateauCliffs') &&
    worldCode.includes('this.addStaticBox') &&
    worldCode.includes('sy = 112 + v') &&
    !worldCode.includes('ROOMS') &&
    worldCode.includes('scatterGroundFlora'),
  'WorldScene must use Arcade Physics, cliffs, scatterGroundFlora, water (48,112) and no ROOMS array'
);

const uiCode = fs.readFileSync(path.join(ROOT, 'src/scenes/UIScene.ts'), 'utf8');
checkGate(
  'Gate H (Top-HUD & 10 Key Badges & Hotbar)',
  uiCode.includes('hud-quest-box') &&
    uiCode.includes('hud-bars-card') &&
    uiCode.includes('hud-btn-row') &&
    uiCode.includes('hud-hotbar') &&
    (uiCode.match(/class="key-badge"/g) || []).length >= 10,
  'UIScene must render Top-HUD, 10 key-badges, and hotbar'
);

const printCode = fs.readFileSync(path.join(ROOT, 'src/ui/PrintSheet.ts'), 'utf8');
checkGate(
  'Gate I (PrintSheet without Teacher Grading Field)',
  !printCode.includes('Fachlehrer') && !printCode.includes('Note:'),
  'PrintSheet must not contain teacher grading/signature fields per SKILL.md §1.18 #6'
);

if (gateErrors.length > 0) {
  console.error('\n❌ QUALITY GATES FAILED:');
  console.error(gateErrors.join('\n'));
  process.exit(1);
}

console.log('\n🎉 ALL LAYOUT, ASSET & ARCHITECTURE GATES PASSED!');
