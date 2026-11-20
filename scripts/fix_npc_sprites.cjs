#!/usr/bin/env node
/**
 * Generates clean 64x128 16x32-per-frame Reformation NPC spritesheets
 * directly from public/assets/gfx/character.png (top-left 64x128 walk block).
 * Protects all face/skin pixels (ly = 10..18) and dark outlines (#171717) so no NPC
 * ever suffers face corruption or detached floating hat pixels.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.resolve(__dirname, '..');
const CHAR_PATH = path.join(ROOT, 'public/assets/gfx/character.png');
const OUT_DIR = path.join(ROOT, 'public/assets/gfx/npcs');

function readPng(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf.toString('ascii', 1, 4) !== 'PNG') throw new Error('Not PNG: ' + filePath);
  let pos = 8;
  let width = 0, height = 0, bitDepth = 0, colorType = 0;
  const idatChunks = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    } else if (type === 'IEND') {
      break;
    }
    pos += 12 + len;
  }
  if (bitDepth !== 8 || (colorType !== 6 && colorType !== 2)) {
    throw new Error(`Unsupported PNG format bitDepth=${bitDepth}, colorType=${colorType}`);
  }
  const bpp = colorType === 6 ? 4 : 3;
  const raw = zlib.inflateSync(Buffer.concat(idatChunks));
  const stride = width * bpp;
  const pixels = Buffer.alloc(width * height * 4);
  const prev = Buffer.alloc(stride);
  const curr = Buffer.alloc(stride);

  function paeth(a, b, c) {
    const p = a + b - c;
    const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
    return (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
  }

  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const rowIn = raw.subarray(y * (stride + 1) + 1, y * (stride + 1) + 1 + stride);
    for (let i = 0; i < stride; i++) {
      const x = rowIn[i];
      const a = i >= bpp ? curr[i - bpp] : 0;
      const b = prev[i];
      const c = i >= bpp ? prev[i - bpp] : 0;
      if (filter === 0) curr[i] = x;
      else if (filter === 1) curr[i] = (x + a) & 0xff;
      else if (filter === 2) curr[i] = (x + b) & 0xff;
      else if (filter === 3) curr[i] = (x + ((a + b) >> 1)) & 0xff;
      else if (filter === 4) curr[i] = (x + paeth(a, b, c)) & 0xff;
      else throw new Error('Unknown PNG filter ' + filter);
    }
    for (let x = 0; x < width; x++) {
      const dst = (y * width + x) * 4;
      const src = x * bpp;
      pixels[dst] = curr[src];
      pixels[dst + 1] = curr[src + 1];
      pixels[dst + 2] = curr[src + 2];
      pixels[dst + 3] = bpp === 4 ? curr[src + 3] : 255;
    }
    curr.copy(prev);
  }
  return { width, height, pixels };
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function writePng(filePath, width, height, pixels) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });
  function chunk(type, data) {
    const out = Buffer.alloc(12 + data.length);
    out.writeUInt32BE(data.length, 0);
    out.write(type, 4, 4, 'ascii');
    data.copy(out, 8);
    const crc = crc32(out.subarray(4, 8 + data.length));
    out.writeUInt32BE(crc, 8 + data.length);
    return out;
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  fs.writeFileSync(filePath, Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))]));
}

function hex(s, alpha = 255) {
  const clean = s.replace('#', '');
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
    alpha,
  ];
}

function eqColor(r, g, b, c) {
  return r === c[0] && g === c[1] && b === c[2];
}

const SRC_HAIR_DARK = hex('#432e27');
const SRC_HAIR_LIGHT = hex('#6a4834');
const SRC_SHIRT_LIGHT = hex('#c43c3c');
const SRC_SHIRT_MID = hex('#882e2e');
const SRC_SHIRT_DARK = hex('#681c1c');
const SRC_COLLAR = hex('#f8f8f8');
const SRC_PANTS_LIGHT = hex('#5586b9');
const SRC_PANTS_DARK = hex('#65659b');
const SRC_OUTLINE = hex('#171717');
const SRC_SKIN_1 = hex('#e8d4b2');
const SRC_SKIN_2 = hex('#bfa787');

const NPC_SPECS = {
  npc_cranach: {
    hairDark: '#a87424',
    hairLight: '#dfb15b',
    shirtLight: '#338852',
    shirtMid: '#215c37',
    shirtDark: '#133a22',
    collar: '#f4df9a',
    pantsLight: '#5a412d',
    pantsDark: '#3d2a1c',
    bootsDark: '#2e1d12',
    bootsLight: '#4f3422',
    headwear: 'beret',
    hatMain: '#9e2636',
    hatHi: '#cf4254',
    hatRim: '#5c1420',
  },
  npc_cajetan: {
    hairDark: '#8c929c',
    hairLight: '#c8ced8',
    shirtLight: '#c4242b',
    shirtMid: '#8a161b',
    shirtDark: '#590c10',
    collar: '#f8f8f8',
    pantsLight: '#7a191f',
    pantsDark: '#520f13',
    bootsDark: '#2a1a16',
    bootsLight: '#462c24',
    headwear: 'zucchetto',
    hatMain: '#c4242b',
    hatHi: '#e85258',
    hatRim: '#751216',
  },
  npc_karl_v: {
    hairDark: '#69361f',
    hairLight: '#9c5636',
    shirtLight: '#73308f',
    shirtMid: '#4c1e60',
    shirtDark: '#2f103d',
    collar: '#f2c649',
    pantsLight: '#44485c',
    pantsDark: '#2c2f3d',
    bootsDark: '#241b16',
    bootsLight: '#423228',
    headwear: 'crown',
    hatMain: '#dca22c',
    hatHi: '#ffe073',
    hatRim: '#8a5d10',
  },
  npc_friedrich: {
    hairDark: '#a8a296',
    hairLight: '#ded8ca',
    shirtLight: '#343846',
    shirtMid: '#222530',
    shirtDark: '#12141c',
    collar: '#e6b83e',
    pantsLight: '#3c342b',
    pantsDark: '#26201a',
    bootsDark: '#1f1812',
    bootsLight: '#3b2e23',
    headwear: 'elector_cap',
    hatMain: '#2e313d',
    hatHi: '#565c70',
    hatRim: '#e6b83e',
  },
  npc_guard: {
    hairDark: '#38261e',
    hairLight: '#583f32',
    shirtLight: '#3c5e94',
    shirtMid: '#264069',
    shirtDark: '#162742',
    collar: '#d8ad46',
    pantsLight: '#68717e',
    pantsDark: '#474e59',
    bootsDark: '#25262b',
    bootsLight: '#44464f',
    headwear: 'helmet',
    hatMain: '#8490a0',
    hatHi: '#c4d0e0',
    hatRim: '#4a5462',
  },
  npc_katharina: {
    hairDark: '#5c2c1b',
    hairLight: '#8e4d32',
    shirtLight: '#3272a8',
    shirtMid: '#225078',
    shirtDark: '#153450',
    collar: '#f8f8f8',
    pantsLight: '#2b3e54',
    pantsDark: '#1d2b3b',
    bootsDark: '#2e201a',
    bootsLight: '#4e372c',
    headwear: 'braids',
    hatMain: '#e8e4dc',
    hatHi: '#ffffff',
  },
  npc_muentzer: {
    hairDark: '#382720',
    hairLight: '#5b4236',
    shirtLight: '#ad722e',
    shirtMid: '#7d4f1d',
    shirtDark: '#4f3010',
    collar: '#efe4c8',
    pantsLight: '#5c4b3b',
    pantsDark: '#3d3126',
    bootsDark: '#2b1e16',
    bootsLight: '#4a3527',
    headwear: 'none',
  },
  npc_citizen_m: {
    hairDark: '#4f3526',
    hairLight: '#7a543c',
    shirtLight: '#3e736d',
    shirtMid: '#294f4b',
    shirtDark: '#193330',
    collar: '#f2ead9',
    pantsLight: '#6c5a44',
    pantsDark: '#493c2d',
    bootsDark: '#2a1d14',
    bootsLight: '#473224',
    headwear: 'none',
  },
  npc_citizen_f: {
    hairDark: '#6b4424',
    hairLight: '#9c673b',
    shirtLight: '#a6415c',
    shirtMid: '#752a3f',
    shirtDark: '#4c1928',
    collar: '#f8f8f8',
    pantsLight: '#4d4f5e',
    pantsDark: '#333540',
    bootsDark: '#2d1e18',
    bootsLight: '#4b342b',
    headwear: 'braids',
    hatMain: '#f2ece0',
    hatHi: '#ffffff',
  },
};

const src = readPng(CHAR_PATH);

function buildNpcSheet(name, spec) {
  const W = 64, H = 128;
  const out = Buffer.alloc(W * H * 4);

  const hairDark = hex(spec.hairDark);
  const hairLight = hex(spec.hairLight);
  const shirtLight = hex(spec.shirtLight);
  const shirtMid = hex(spec.shirtMid);
  const shirtDark = hex(spec.shirtDark);
  const collar = hex(spec.collar);
  const pantsLight = hex(spec.pantsLight);
  const pantsDark = hex(spec.pantsDark);
  const bootsDark = hex(spec.bootsDark);
  const bootsLight = hex(spec.bootsLight);

  function setPx(x, y, col) {
    if (x < 0 || x >= W || y < 0 || y >= H) return;
    const i = (y * W + x) * 4;
    out[i] = col[0]; out[i + 1] = col[1]; out[i + 2] = col[2]; out[i + 3] = col[3];
  }

  function getSrc(x, y) {
    const i = (y * src.width + x) * 4;
    return [src.pixels[i], src.pixels[i + 1], src.pixels[i + 2], src.pixels[i + 3]];
  }

  function isSkinOrOutline(r, g, b, a) {
    if (a < 128) return false;
    return eqColor(r, g, b, SRC_SKIN_1) || eqColor(r, g, b, SRC_SKIN_2) || eqColor(r, g, b, SRC_OUTLINE);
  }

  // Pass 1: clean palette recolor strictly by anatomical row slice
  for (let y = 0; y < H; y++) {
    const ly = y % 32;
    for (let x = 0; x < W; x++) {
      const [r, g, b, a] = getSrc(x, y);
      if (a < 128) continue;

      let dst = [r, g, b, a];
      if (ly <= 17 && eqColor(r, g, b, SRC_HAIR_DARK)) dst = hairDark;
      else if (ly <= 17 && eqColor(r, g, b, SRC_HAIR_LIGHT)) dst = hairLight;
      else if (ly >= 23 && eqColor(r, g, b, SRC_HAIR_DARK)) dst = bootsDark;
      else if (ly >= 23 && eqColor(r, g, b, SRC_HAIR_LIGHT)) dst = bootsLight;
      else if (eqColor(r, g, b, SRC_SHIRT_LIGHT)) dst = shirtLight;
      else if (eqColor(r, g, b, SRC_SHIRT_MID)) dst = shirtMid;
      else if (eqColor(r, g, b, SRC_SHIRT_DARK)) dst = shirtDark;
      else if (eqColor(r, g, b, SRC_COLLAR)) dst = collar;
      else if (eqColor(r, g, b, SRC_PANTS_LIGHT)) dst = pantsLight;
      else if (eqColor(r, g, b, SRC_PANTS_DARK)) dst = pantsDark;

      setPx(x, y, dst);
    }
  }

  const hatMain = spec.hatMain ? hex(spec.hatMain) : null;
  const hatHi = spec.hatHi ? hex(spec.hatHi) : null;
  const hatRim = spec.hatRim ? hex(spec.hatRim) : null;

  // Pass 2: fitted crown headwear painted onto existing hair dome (zero floating bars!) + subtle feet shadow
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const fx = col * 16;
      const fy = row * 32;

      // Per-column highest hair pixel (excluding face skin/outlines)
      const colTop = [];
      for (let lx = 0; lx < 16; lx++) {
        let found = -1;
        for (let ly = 5; ly <= 13; ly++) {
          const [r, g, b, a] = getSrc(fx + lx, fy + ly);
          if (a >= 128 && (eqColor(r, g, b, SRC_HAIR_DARK) || eqColor(r, g, b, SRC_HAIR_LIGHT))) {
            found = ly;
            break;
          }
        }
        colTop.push(found);
      }

      // Smooth crown baseline (ignoring isolated cowlick peaks at ends)
      const validYs = colTop.filter((v) => v !== -1);
      const domeY = validYs.length ? validYs.sort((a, b) => a - b)[Math.floor(validYs.length * 0.25)] : 8;

      const paintHairOnly = (lx, ly, colVal) => {
        if (ly < 4 || ly > 11 || lx < 2 || lx > 13) return;
        const [r, g, b, a] = getSrc(fx + lx, fy + ly);
        if (a < 128 || isSkinOrOutline(r, g, b, a)) return;
        if (eqColor(r, g, b, SRC_HAIR_DARK) || eqColor(r, g, b, SRC_HAIR_LIGHT)) {
          setPx(fx + lx, fy + ly, colVal);
        }
      };

      const paintFlushAboveHair = (lx, ly, colVal) => {
        if (ly < 4 || ly > 11 || lx < 2 || lx > 13) return;
        const [r, g, b, a] = getSrc(fx + lx, fy + ly);
        if (isSkinOrOutline(r, g, b, a)) return;
        // Require a non-transparent hair pixel right below or diagonally adjacent so it is flush
        const [, , , aBelow] = getSrc(fx + lx, fy + ly + 1);
        if (a >= 128 || aBelow >= 128) {
          setPx(fx + lx, fy + ly, colVal);
        }
      };

      if (spec.headwear === 'beret' && hatMain && hatHi && hatRim) {
        for (let lx = 4; lx <= 12; lx++) {
          const top = colTop[lx] === -1 ? domeY : Math.max(domeY, colTop[lx]);
          paintFlushAboveHair(lx, top - 1, lx >= 5 && lx <= 9 ? hatHi : hatMain);
          paintHairOnly(lx, top, hatMain);
          paintHairOnly(lx, top + 1, hatRim);
        }
      } else if (spec.headwear === 'zucchetto' && hatMain && hatHi && hatRim) {
        for (let lx = 6; lx <= 10; lx++) {
          const top = colTop[lx] === -1 ? domeY : Math.max(domeY, colTop[lx]);
          paintFlushAboveHair(lx, top - 1, lx >= 7 && lx <= 9 ? hatHi : hatMain);
          paintHairOnly(lx, top, hatMain);
        }
      } else if (spec.headwear === 'crown' && hatMain && hatHi && hatRim) {
        const crownCols = [5, 6, 7, 8, 9, 10];
        for (const lx of crownCols) {
          const top = colTop[lx] === -1 ? domeY : Math.max(domeY, colTop[lx]);
          paintHairOnly(lx, top, lx === 7 || lx === 8 ? hex('#c92a2a') : hatMain);
          paintFlushAboveHair(lx, top - 1, lx % 2 === 1 ? hatHi : hatRim);
        }
      } else if (spec.headwear === 'elector_cap' && hatMain && hatHi && hatRim) {
        for (let lx = 4; lx <= 11; lx++) {
          const top = colTop[lx] === -1 ? domeY : Math.max(domeY, colTop[lx]);
          paintFlushAboveHair(lx, top - 1, lx >= 5 && lx <= 10 ? hatHi : hatMain);
          paintHairOnly(lx, top, hatMain);
          paintHairOnly(lx, top + 1, hatRim);
        }
      } else if (spec.headwear === 'helmet' && hatMain && hatHi && hatRim) {
        for (let lx = 4; lx <= 11; lx++) {
          const top = colTop[lx] === -1 ? domeY : Math.max(domeY, colTop[lx]);
          paintFlushAboveHair(lx, top - 1, lx >= 5 && lx <= 9 ? hatHi : hatMain);
          paintHairOnly(lx, top, lx >= 5 && lx <= 8 ? hatHi : hatMain);
          paintHairOnly(lx, top + 1, hatMain);
          paintHairOnly(lx, top + 2, hatRim);
        }
      } else if (spec.headwear === 'braids' && hatMain && hatHi) {
        // Soft linen headband tucked into hair (only over existing hair pixels)
        for (let lx = 5; lx <= 10; lx++) {
          paintHairOnly(lx, domeY + 1, lx % 2 === 0 ? hatHi : hatMain);
        }
        // Longer hair locks framing neck/shoulders where transparent on down/up frames
        if (row === 0 || row === 2) {
          for (const lx of [3, 12]) {
            for (let ly = 14; ly <= 17; ly++) {
              const [, , , aCur] = getSrc(fx + lx, fy + ly);
              const [rIn, gIn, bIn, aIn] = getSrc(fx + (lx === 3 ? 4 : 11), fy + ly);
              if (aCur < 128 && aIn >= 128 && !eqColor(rIn, gIn, bIn, SRC_OUTLINE)) {
                setPx(fx + lx, fy + ly, ly % 2 === 0 ? hairDark : hairLight);
              }
            }
          }
        }
      }

      // Ground shadow at feet (matching npc_luther / Steinzeit NPCs cleanly)
      for (let ly = 25; ly <= 27; ly++) {
        for (let lx = 4; lx <= 11; lx++) {
          const i = ((fy + ly) * W + (fx + lx)) * 4;
          if (out[i + 3] < 64) {
            const dx = (lx - 7.5) / 4.2;
            const dy = (ly - 26.0) / 1.4;
            if (dx * dx + dy * dy <= 1.0) {
              out[i] = 28; out[i + 1] = 24; out[i + 2] = 34; out[i + 3] = 115;
            }
          }
        }
      }
    }
  }

  writePng(path.join(OUT_DIR, `${name}.png`), W, H, out);
  console.log(`Generated ${name}.png (${W}x${H})`);
}

for (const [name, spec] of Object.entries(NPC_SPECS)) {
  buildNpcSheet(name, spec);
}
