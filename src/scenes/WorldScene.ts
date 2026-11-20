import Phaser from 'phaser';
import { sound } from '../audio/sound';
import { musicManager } from '../audio/MusicManager';
import { REFORMATION_CHAPTERS } from '../data/chapters';
import { ReformationItemId } from '../data/items';
import { REFORMATION_RELICS, ReformationRelic } from '../data/relics';
import { REFORMATION_DECOR, RESOURCE_NODES, ResourceNode } from '../data/decor';
import { REFORMATION_STATIONS } from '../data/stations';
import { gameState } from '../systems/GameState';
import { WildlifeManager } from '../world/Wildlife';
import { LivingWorldManager } from '../world/LivingWorldManager';
import { ChapterBanner } from '../ui/ChapterBanner';
import { CompanionManager } from '../world/Companion';
import { AtmosphereManager } from '../world/AtmosphereManager';
import { AmbientSpeechManager } from '../world/AmbientSpeech';

export interface InteractiveTarget {
  id: string;
  kind: 'mentor' | 'resource' | 'relic' | 'station' | 'companion' | 'door';
  name: string;
  sub: string;
  x: number;
  y: number;
  minChapter: number;
  chapterId?: number;
  itemId?: ReformationItemId;
  relic?: ReformationRelic;
  stationId?: string;
  interiorId?: string;
  actionTip?: string;
  discovered?: boolean;
  nodeDef?: ResourceNode;
  sprite?: Phaser.GameObjects.Sprite;
}

const TALL_BUILDING_KEYS = new Set([
  'chapel',
  'keep',
  'gatehouse',
  'house_tall_slate',
  'house_tall_tile',
  'house_gable_tile',
  'house_gable_slate',
  'house_gable_plum',
  'cottage_stone',
  'cottage_thatch',
  'cottage_tile',
  'cottage_moss',
  'barn',
  'smithy',
  'stable',
  'tower_round',
]);

export class WorldScene extends Phaser.Scene {
  public mapW = 96;
  public mapH = 88;
  public player!: Phaser.Physics.Arcade.Sprite;
  public obstacles!: Phaser.Physics.Arcade.StaticGroup;
  private blockedBoxes: { x1: number; y1: number; x2: number; y2: number }[] = [];

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    E: Phaser.Input.Keyboard.Key;
  };
  private spaceKey?: Phaser.Input.Keyboard.Key;

  public targets: InteractiveTarget[] = [];
  private activeTarget: InteractiveTarget | null = null;
  private labelDiv: HTMLElement | null = null;
  private nameplatesLayer: HTMLElement | null = null;
  private mentorNameplates: { chId: number; name: string; role: string; sprite: Phaser.GameObjects.Sprite; el: HTMLElement }[] = [];

  public wildlifeManager!: WildlifeManager;
  public livingWorldManager!: LivingWorldManager;
  public chapterBanner!: ChapterBanner;
  public companionManager!: CompanionManager;
  public atmosphereManager!: AtmosphereManager;
  public ambientSpeechManager!: AmbientSpeechManager;

  private stepTimer = 0;
  private facing: 'down' | 'up' | 'left' | 'right' = 'down';
  private lastBannerChapter = -1;
  private lastPosX = 0;
  private lastPosY = 0;

  constructor() {
    super('WorldScene');
  }

  public riverCenterTileX(ty: number): number {
    return 50 + Math.sin(ty * 0.08) * 3.5;
  }

  private isBridgeRow(ty: number): boolean {
    return (ty >= 21 && ty <= 26) || (ty >= 55 && ty <= 60);
  }

  private addStaticBox(cx: number, cy: number, w: number, h: number): void {
    const zone = this.add.zone(cx, cy, w, h);
    this.physics.add.existing(zone, true);
    const body = zone.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(w, h);
    this.obstacles.add(zone);
    this.blockedBoxes.push({
      x1: cx - w * 0.5,
      y1: cy - h * 0.5,
      x2: cx + w * 0.5,
      y2: cy + h * 0.5,
    });
  }

  public isWorldPointBlocked(x: number, y: number): boolean {
    if (x < 24 || x > (this.mapW - 1.5) * 16 || y < 24 || y > (this.mapH - 1.5) * 16) {
      return true;
    }
    const ty = y / 16;
    const tx = x / 16;
    if (!this.isBridgeRow(ty) && Math.abs(tx - this.riverCenterTileX(ty)) < 2.2) {
      return true;
    }
    for (const b of this.blockedBoxes) {
      if (x >= b.x1 && x <= b.x2 && y >= b.y1 && y <= b.y2) return true;
    }
    return false;
  }

  create(): void {
    const worldPxW = this.mapW * 16;
    const worldPxH = this.mapH * 16;

    this.physics.world.setBounds(16, 16, worldPxW - 32, worldPxH - 32);
    this.obstacles = this.physics.add.staticGroup();
    this.blockedBoxes = [];

    // 1. Bake Multi-Biome Ground with 4x4 Bayer Dithering & Smooth Overworld Water
    this.bakeReformationTerrainTexture();
    this.add.image(0, 0, 'reformation_baked_ground').setOrigin(0, 0).setDepth(0);

    // 2. River Bridges (Real world_atlas 'bridge_h' spans over the two Elbe crossings)
    this.placeElbeBridges();

    // 3. River Physics Colliders (blocks walking into Elbe except across the two bridges)
    for (let ty = 1; ty < this.mapH - 1; ty++) {
      if (this.isBridgeRow(ty)) continue;
      const cxPx = this.riverCenterTileX(ty) * 16;
      this.addStaticBox(cxPx, ty * 16 + 8, 44, 16);
    }

    // 4. Initialize Subsystems
    this.wildlifeManager = new WildlifeManager(this);
    this.wildlifeManager.init();
    this.livingWorldManager = new LivingWorldManager(this);
    this.livingWorldManager.initWaterEffects(46 * 16, 54 * 16, 10 * 16, 84 * 16);
    this.livingWorldManager.registerFireSource(35 * 16, 17 * 16, true, 24, 0xffa533);
    this.livingWorldManager.registerFireSource(58 * 16, 71 * 16, true, 24, 0xff8833);
    this.livingWorldManager.registerFireSource(22 * 16, 69 * 16, true, 28, 0xff7722);
    this.livingWorldManager.registerFireSource(26 * 16, 34 * 16, false, 18, 0xffaa44);

    this.chapterBanner = new ChapterBanner();
    this.companionManager = new CompanionManager(this);
    this.atmosphereManager = new AtmosphereManager(this);
    this.atmosphereManager.init(this.mapW, this.mapH);
    this.atmosphereManager.setChapterMood(gameState.chapter);
    this.ambientSpeechManager = new AmbientSpeechManager(this);
    this.ambientSpeechManager.spawnCitizens(this);

    // 5. Flora, Trees, Aquatic Bank Details & Wartburg 3D Plateau Cliffs
    this.scatterGroundFlora();
    this.placeOverworldTreesAndNature();
    this.placeRiverBankProps();
    this.buildPlateauCliffs();

    // 6. Place Decor, Buildings & Resource Hotspots (with real Arcade Physics colliders)
    this.placeWorldDecor();
    this.placeResourceNodes();

    // 7. Setup Controls
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        E: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      };
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    // 8. Spawn Arcade Physics Player (strictly clamped to 96x88 world)
    const chData = gameState.getChapterData();
    const spawnX = Phaser.Math.Clamp(gameState.playerX || chData.spawn.x, 32, worldPxW - 32);
    const spawnY = Phaser.Math.Clamp(gameState.playerY || chData.spawn.y, 32, worldPxH - 32);
    gameState.playerX = spawnX;
    gameState.playerY = spawnY;
    this.lastPosX = spawnX;
    this.lastPosY = spawnY;

    const texKey = gameState.gender === 'female' && this.textures.exists('character_female') ? 'character_female' : 'character';
    this.player = this.physics.add.sprite(spawnX, spawnY, texKey, 0);
    this.player.setOrigin(0.5, 0.85);
    this.player.setScale(1.0);
    this.player.setDepth(this.player.y);
    this.player.setCollideWorldBounds(true);

    const pBody = this.player.body as Phaser.Physics.Arcade.Body;
    pBody.setSize(10, 8);
    pBody.setOffset(3, 21);

    this.physics.add.collider(this.player, this.obstacles);

    if (this.anims.exists(`idle-${gameState.gender}-down`)) {
      this.player.play(`idle-${gameState.gender}-down`, true);
    }

    // 9. Camera Clamping (Unified 96x88 Overworld)
    this.cameras.main.setBounds(0, 0, worldPxW, worldPxH);
    this.cameras.main.setZoom(1.0);
    this.cameras.main.startFollow(this.player, true, 0.14, 0.14);
    sound.setIndoorAcoustics(false);

    // 10. Companion Unlock (Luthers Hund Tölpel)
    this.companionManager.unlock(this.player.x - 22, this.player.y);

    // 11. Setup Interactive Targets, Doors & Mentors
    this.setupTargets();
    this.initInteractionLabel();
    this.initMentorNameplates();

    // 12. Scene Resume Handling (clean input & HUD recovery after returning from InteriorScene)
    this.events.on('resume', () => {
      if (this.player?.body) {
        (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
      }
      this.input.keyboard?.resetKeys();
      sound.setIndoorAcoustics(false);
      this.refreshCharacterAppearance();
      this.updateQuestCompass();
      musicManager.playChapterTrack(gameState.chapter);
    });

    // Global Hooks for UI, Tests & Interior Verification
    (window as any).__triggerInteraction = () => this.triggerInteraction();
    (window as any).__enterSampleInterior = () => this.enterInterior('lutherstube_wittenberg');
    (window as any).__teleportToChapter = (ch: number) => this.teleportToChapter(ch);
    (window as any).__refreshCharacterAppearance = () => this.refreshCharacterAppearance();
    (window as any).__WORLD__ = this;

    // 13. Initial Banner & Start Music if Game Active (otherwise StartScreen starts music on launch)
    this.lastBannerChapter = gameState.chapter;
    if (!(window as any).__isModalOpen?.()) {
      this.showChapterBanner(chData);
      musicManager.playChapterTrack(gameState.chapter);
    } else {
      musicManager.playStartTheme();
    }
  }

  private showChapterBanner(curCh = gameState.getChapterData()): void {
    this.chapterBanner.show({
      chapterNumber: curCh.number,
      title: curCh.title,
      subtitle: `${curCh.year} · ${curCh.location}`,
    });
  }

  public teleportToChapter(chNum: number): void {
    const ch = Math.max(1, Math.min(8, chNum));
    gameState.setChapter(ch);
    const curCh = gameState.getChapterData(ch);
    if (!this.player) return;

    const tx = Phaser.Math.Clamp(curCh.spawn.x, 32, this.mapW * 16 - 32);
    const ty = Phaser.Math.Clamp(curCh.spawn.y, 32, this.mapH * 16 - 32);
    this.player.setPosition(tx, ty);
    (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    this.player.setDepth(ty);
    gameState.playerX = tx;
    gameState.playerY = ty;
    this.lastPosX = tx;
    this.lastPosY = ty;

    if (this.companionManager?.sprite) {
      this.companionManager.sprite.setPosition(tx - 20, ty + 2);
      this.companionManager.sprite.setDepth(ty + 2);
    }

    this.ambientSpeechManager?.dismissBubble(true);
    this.cameras.main.centerOn(tx, ty);
    this.lastBannerChapter = ch;
    this.showChapterBanner(curCh);
    this.atmosphereManager.setChapterMood(ch);
    musicManager.playChapterTrack(ch);
    this.updateQuestCompass();
  }

  private bakeReformationTerrainTexture(): void {
    const W = this.mapW * 16;
    const H = this.mapH * 16;

    const canvasTex = this.textures.createCanvas('reformation_baked_ground', W, H);
    if (!canvasTex) return;
    const ctx = canvasTex.getContext();
    const imgData = ctx.createImageData(W, H);
    const dst = imgData.data;

    const groundKey = this.textures.exists('ground_a2') ? 'ground_a2' : 'ground_med_a2';
    const srcTex = this.textures.get(groundKey).getSourceImage() as HTMLImageElement;
    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = srcTex.width;
    srcCanvas.height = srcTex.height;
    const sctx = srcCanvas.getContext('2d')!;
    sctx.drawImage(srcTex, 0, 0);
    const srcData = sctx.getImageData(0, 0, srcTex.width, srcTex.height).data;
    const sw = srcTex.width;

    // Overworld clean water tile at (48, 112) — zero ripple rings
    const owTex = this.textures.get('Overworld').getSourceImage() as HTMLImageElement;
    const owCanvas = document.createElement('canvas');
    owCanvas.width = owTex.width;
    owCanvas.height = owTex.height;
    const owctx = owCanvas.getContext('2d')!;
    owctx.drawImage(owTex, 0, 0);
    const owData = owctx.getImageData(0, 0, owTex.width, owTex.height).data;
    const oww = owTex.width;

    const sampleBlock = (bx: number, by: number, x: number, y: number): [number, number, number] => {
      const u = ((x % 48) + 48) % 48;
      const v = ((y % 48) + 48) % 48;
      const sx = bx * 96 + 24 + u;
      const sy = by * 144 + 72 + v;
      const idx = (sy * sw + sx) * 4;
      return [srcData[idx], srcData[idx + 1], srcData[idx + 2]];
    };

    const sampleWater = (x: number, y: number): [number, number, number] => {
      const u = ((x % 16) + 16) % 16;
      const v = ((y % 16) + 16) % 16;
      const sx = 48 + u;
      const sy = 112 + v;
      const idx = (sy * oww + sx) * 4;
      // Gentle flow shimmer
      const shimmer = Math.sin(x * 0.14 + y * 0.18) > 0.85 ? 10 : 0;
      return [
        Math.min(255, owData[idx] + shimmer),
        Math.min(255, owData[idx + 1] + shimmer),
        Math.min(255, owData[idx + 2] + shimmer),
      ];
    };

    const bayer4x4 = [
      [0 / 16, 8 / 16, 2 / 16, 10 / 16],
      [12 / 16, 4 / 16, 14 / 16, 6 / 16],
      [3 / 16, 11 / 16, 1 / 16, 9 / 16],
      [15 / 16, 7 / 16, 13 / 16, 5 / 16],
    ];

    for (let y = 0; y < H; y += 2) {
      for (let x = 0; x < W; x += 2) {
        const tx = x / 16;
        const ty = y / 16;
        const dither = bayer4x4[Math.floor(y / 2) % 4][Math.floor(x / 2) % 4] - 0.5;

        const riverCenter = this.riverCenterTileX(ty);
        const distRiver = Math.abs(tx - riverCenter);
        const isBridge = distRiver < 2.8 && ((ty >= 22 && ty <= 25) || (ty >= 56 && ty <= 59));

        // Wartburg Plateau Cliff Rim along ty = 62.5..64.4 (tx = 0..45) with two passable stair passes
        const isWartburgCliffZone = tx < 45 && ty >= 62.5 && ty <= 64.4;
        const isCliffStair =
          isWartburgCliffZone && ((tx >= 14 && tx <= 16.8) || (tx >= 32 && tx <= 34.8));

        // Medieval Roads & Footpaths
        const dWittenbergToRiver = this.distToSegment(tx, ty, 24, 24, 50, 24);
        const dRiverToWorms = this.distToSegment(tx, ty, 50, 24, 80, 22);
        const dFuggerPath = this.distToSegment(tx, ty, 50, 24, 62, 22);
        const dSouthRoadWest = this.distToSegment(tx, ty, 24, 24, 15.4, 63.5);
        const dSouthRoadCourtyard = this.distToSegment(tx, ty, 15.4, 63.5, 24, 77);
        const dKlosterEastPass = this.distToSegment(tx, ty, 36, 50, 33.4, 71);
        const dPeasantRoad = this.distToSegment(tx, ty, 24, 76, 59, 75);
        const dEastSouthBridge = this.distToSegment(tx, ty, 36, 54, 59, 58);
        const dSouthEastRoad = this.distToSegment(tx, ty, 53, 58, 59, 75);
        const dAugsburg1555 = this.distToSegment(tx, ty, 59, 75, 81, 76);
        const dKlosterPath = this.distToSegment(tx, ty, 24, 24, 36, 50);

        const minRoadDist = Math.min(
          dWittenbergToRiver,
          dRiverToWorms,
          dFuggerPath,
          dSouthRoadWest,
          dSouthRoadCourtyard,
          dKlosterEastPass,
          dPeasantRoad,
          dEastSouthBridge,
          dSouthEastRoad,
          dAugsburg1555,
          dKlosterPath
        );

        const inWittenbergPlaza = Math.hypot((tx - 25) * 0.85, (ty - 23) * 1.0) < 9.0 + dither * 1.1;
        const inCranachCourt = Math.hypot((tx - 37) * 0.9, (ty - 21) * 1.0) < 5.5 + dither * 1.0;
        const inFuggerCourt = Math.hypot((tx - 62) * 0.9, (ty - 21) * 1.0) < 5.8 + dither * 1.0;
        const inWormsCourt = Math.hypot((tx - 80) * 0.85, (ty - 21) * 1.0) < 7.5 + dither * 1.1;
        const inWartburgCourt = Math.hypot((tx - 24) * 0.85, (ty - 76) * 1.0) < 7.5 + dither * 1.1;
        const inAugsburg1555Court = Math.hypot((tx - 81) * 0.85, (ty - 75) * 1.0) < 6.8 + dither * 1.0;

        let bx = 1;
        let by = 1;
        let isWater = false;
        let isBridgePlank = false;
        let cliffPixelType: 'none' | 'ledge' | 'stair' = 'none';

        if (isBridge) {
          isBridgePlank = true;
        } else if (distRiver < 1.85) {
          isWater = true;
        } else if (isCliffStair) {
          cliffPixelType = 'stair';
        } else if (isWartburgCliffZone) {
          cliffPixelType = 'ledge';
        } else if (distRiver < 2.85 + dither * 0.6) {
          bx = 2;
          by = 1; // Sand bank
        } else if (inWormsCourt || inWartburgCourt) {
          bx = 2;
          by = 3; // Basalt castle stone
        } else if (inFuggerCourt || inAugsburg1555Court) {
          bx = 3;
          by = 3; // Travertine imperial flagstones
        } else if (inWittenbergPlaza || inCranachCourt) {
          bx = 6;
          by = 1; // Sandstone cobble
        } else if (minRoadDist < 1.45 + dither * 0.4) {
          bx = 1;
          by = 0; // Warm dirt road
        } else {
          const wave = Math.sin(x * 0.02 + y * 0.02) * 0.5 + Math.cos(x * 0.015 - y * 0.02) * 0.5;
          if (wave + dither * 0.5 > 0.32) {
            bx = 0;
            by = 1; // Forest green
          } else {
            bx = 1;
            by = 1; // Summer meadow
          }
        }

        for (let py = y; py < y + 2 && py < H; py++) {
          for (let px = x; px < x + 2 && px < W; px++) {
            let r: number, g: number, b: number;
            if (isBridgePlank) {
              const plank = (px + (py % 4 === 0 ? 1 : 0)) % 6 === 0 ? 116 : 148;
              r = plank;
              g = Math.round(plank * 0.72);
              b = Math.round(plank * 0.44);
            } else if (isWater) {
              [r, g, b] = sampleWater(px, py);
            } else if (cliffPixelType === 'stair') {
              const stepRow = Math.floor(py / 6) % 2;
              const edge = py % 6 === 0;
              r = edge ? 118 : stepRow ? 176 : 158;
              g = edge ? 108 : stepRow ? 162 : 144;
              b = edge ? 96 : stepRow ? 140 : 124;
            } else if (cliffPixelType === 'ledge') {
              const isShadow = py / 16 > 63.3;
              const seam = (px + py * 3) % 11 === 0;
              r = isShadow ? (seam ? 58 : 74) : seam ? 92 : 108;
              g = isShadow ? (seam ? 55 : 70) : seam ? 88 : 104;
              b = isShadow ? (seam ? 60 : 76) : seam ? 84 : 98;
            } else {
              [r, g, b] = sampleBlock(bx, by, px, py);
            }

            const oi = (py * W + px) * 4;
            dst[oi] = r;
            dst[oi + 1] = g;
            dst[oi + 2] = b;
            dst[oi + 3] = 255;
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    canvasTex.refresh();
  }

  private placeElbeBridges(): void {
    const atlas = this.textures.get('world_atlas');
    if (!atlas?.has('bridge_h')) return;

    for (const ty of [23.5, 57.5]) {
      const cx = this.riverCenterTileX(ty) * 16;
      const y = ty * 16;
      this.add.image(cx, y, 'world_atlas', 'bridge_h').setOrigin(0.5, 0.5).setScale(1.15, 1.15).setDepth(8);
    }
  }

  private placeRiverBankProps(): void {
    const bankDecor: { ty: number; side: number; key: string; scale: number }[] = [
      { ty: 14, side: -2.4, key: 'reeds', scale: 0.9 },
      { ty: 15, side: 2.4, key: 'reeds_2', scale: 0.9 },
      { ty: 17, side: -0.7, key: 'lilypad_flower', scale: 0.9 },
      { ty: 29, side: 2.3, key: 'reeds', scale: 0.9 },
      { ty: 31, side: -2.3, key: 'reeds_2', scale: 0.9 },
      { ty: 35, side: 0.4, key: 'lilypad', scale: 0.9 },
      { ty: 44, side: -2.4, key: 'reeds', scale: 0.9 },
      { ty: 47, side: 0.5, key: 'lilypad_flower', scale: 0.9 },
      { ty: 51, side: 2.4, key: 'reeds_2', scale: 0.9 },
      { ty: 65, side: -2.4, key: 'reeds', scale: 0.9 },
      { ty: 68, side: -0.5, key: 'lilypad', scale: 0.9 },
      { ty: 72, side: 2.4, key: 'reeds_2', scale: 0.9 },
    ];
    for (const bd of bankDecor) {
      if (!this.textures.exists(bd.key)) continue;
      const x = (this.riverCenterTileX(bd.ty) + bd.side) * 16;
      const y = bd.ty * 16;
      const spr = this.add.image(x, y, bd.key).setOrigin(0.5, 0.85).setScale(bd.scale).setDepth(6);
      this.livingWorldManager.registerFlora(spr);
    }
  }

  private distToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
  }

  public scatterGroundFlora(): void {
    const getFloraScale = (f: string): number => {
      if (f.startsWith('flower_bunch')) return 0.36;
      if (f.startsWith('flower_')) return 0.30;
      if (f.startsWith('grass_s')) return 0.42;
      if (f.startsWith('grass_')) return 0.34;
      if (f.startsWith('fern_big')) return 0.38;
      if (f.startsWith('fern_')) return 0.32;
      if (f.startsWith('mushroom_')) return 0.35;
      if (f.startsWith('pebbles')) return 0.50;
      return 0.34;
    };

    const floraFrames = [
      'flower_red_a', 'flower_red_b', 'flower_blue_a', 'flower_blue_b',
      'flower_purple', 'flower_sun', 'flower_white', 'flower_tulip_y',
      'flower_pink', 'flower_bunch_a', 'flower_bunch_b', 'flower_bunch_c',
      'mushroom_red', 'mushroom_b', 'mushroom_small',
      'grass_1', 'grass_2', 'grass_3', 'grass_4',
      'grass_s1', 'grass_s2', 'grass_s3', 'grass_s4',
      'fern_1', 'fern_2', 'fern_3', 'fern_4', 'fern_big',
      'pebbles_a', 'pebbles_b', 'pebbles_c',
    ];
    const validFrames = floraFrames.filter((f) => this.textures.get('world_atlas')?.has(f));

    for (let i = 0; i < 165; i++) {
      const tx = Phaser.Math.Between(4, 90);
      const ty = Phaser.Math.Between(4, 82);

      // Keep clear of river channel & banks AND cliff ledge
      if (Math.abs(tx - this.riverCenterTileX(ty)) < 3.4) continue;
      if (tx < 46 && ty >= 61 && ty <= 65) continue;

      const nearMentor = REFORMATION_CHAPTERS.some(
        (c) => Math.hypot(tx - c.mentor.x / 16, ty - c.mentor.y / 16) < 2.6
      );
      if (nearMentor) continue;

      const isTownPaved =
        (tx >= 10 && tx <= 44 && ty >= 16 && ty <= 32) ||
        (tx >= 22 && tx <= 30 && ty >= 32 && ty <= 38) ||
        (tx >= 54 && tx <= 71 && ty >= 14 && ty <= 30) ||
        (tx >= 72 && tx <= 92 && ty >= 14 && ty <= 30) ||
        (tx >= 12 && tx <= 32 && ty >= 66 && ty <= 84) ||
        (tx >= 74 && tx <= 89 && ty >= 69 && ty <= 83);

      const frameKey = validFrames.length > 0 ? Phaser.Math.RND.pick(validFrames) : undefined;
      if (isTownPaved && frameKey && !frameKey.startsWith('pebbles') && !frameKey.startsWith('grass_s')) {
        continue;
      }

      if (frameKey && this.textures.get('world_atlas')?.has(frameKey)) {
        const scale = getFloraScale(frameKey);
        const flora = this.add.image(tx * 16, ty * 16, 'world_atlas', frameKey)
          .setOrigin(0.5, 0.8)
          .setScale(scale)
          .setDepth(ty * 16 - 2);
        this.livingWorldManager.registerFlora(flora);
      }
    }
  }

  public placeOverworldTreesAndNature(): void {
    // Harmonized Steinzeit-Benchmark scales: trees 0.56..0.68 so buildings anchor the town silhouette
    const getNatureScale = (frame: string): number => {
      if (frame.startsWith('bush_big') || frame.startsWith('bush_huge')) return 0.48;
      if (frame.startsWith('bush_tall')) return 0.54;
      if (frame.startsWith('bush_')) return 0.58;
      if (frame.startsWith('pebbles') || frame.startsWith('rock_small') || frame.startsWith('rock_flat')) return 0.52;
      if (frame.startsWith('rock_tall') || frame.startsWith('rock_')) return 0.58;
      if (frame.startsWith('stump_')) return 0.55;
      if (frame.startsWith('logs_')) return 0.55;
      if (frame.startsWith('fern_big')) return 0.38;
      if (frame.startsWith('fern_')) return 0.34;
      if (frame.startsWith('tree_oak_tall') || frame.startsWith('tree_pine_tall')) return 0.66;
      if (frame.startsWith('tree_pine_slim') || frame.startsWith('tree_small')) return 0.56;
      if (frame.startsWith('tree_')) return 0.60;
      return 0.60;
    };

    interface NatureItem {
      x: number;
      y: number;
      frame: string;
      scale?: number;
      isFlora?: boolean;
      obstacle?: boolean;
    }

    const natureItems: NatureItem[] = [
      // 1. Thüringer Wald / Wartburg Woods (Southwest)
      { x: 6, y: 66, frame: 'tree_pine_tall', scale: 0.68, isFlora: true, obstacle: true },
      { x: 10, y: 66, frame: 'tree_pine_1', isFlora: true, obstacle: true },
      { x: 6, y: 71, frame: 'tree_pine_2', isFlora: true, obstacle: true },
      { x: 8, y: 75, frame: 'tree_fir_1', isFlora: true, obstacle: true },
      { x: 6, y: 79, frame: 'tree_pine_3', isFlora: true, obstacle: true },
      { x: 10, y: 83, frame: 'tree_fir_2', isFlora: true, obstacle: true },
      { x: 14, y: 85, frame: 'tree_pine_4', isFlora: true, obstacle: true },
      { x: 19, y: 86, frame: 'tree_pine_5', isFlora: true, obstacle: true },
      { x: 29, y: 85, frame: 'tree_pine_1', isFlora: true, obstacle: true },
      { x: 34, y: 80, frame: 'tree_pine_tall', scale: 0.66, isFlora: true, obstacle: true },
      { x: 33, y: 74, frame: 'tree_fir_3', isFlora: true, obstacle: true },
      { x: 30, y: 68, frame: 'tree_pine_slim', isFlora: true, obstacle: true },
      { x: 8, y: 81, frame: 'rock_big_a', scale: 0.72, obstacle: true },
      { x: 12, y: 86, frame: 'rock_moss_a', obstacle: true },
      { x: 26, y: 86, frame: 'rock_cluster', obstacle: true },
      { x: 32, y: 83, frame: 'logs_a', obstacle: true },
      { x: 9, y: 69, frame: 'stump_axe', obstacle: true },
      { x: 28, y: 69, frame: 'stump_a', obstacle: true },

      // 2. Wittenberg Castle Park & Town Verges (Northwest)
      { x: 6, y: 8, frame: 'tree_oak_tall', scale: 0.68, isFlora: true, obstacle: true },
      { x: 12, y: 8, frame: 'tree_oak_1', isFlora: true, obstacle: true },
      { x: 18, y: 8, frame: 'tree_oak_2', isFlora: true, obstacle: true },
      { x: 24, y: 8, frame: 'tree_oak_3', isFlora: true, obstacle: true },
      { x: 30, y: 8, frame: 'tree_oak_tall', scale: 0.66, isFlora: true, obstacle: true },
      { x: 38, y: 8, frame: 'tree_oak_1', isFlora: true, obstacle: true },
      { x: 43, y: 8, frame: 'tree_oak_2', isFlora: true, obstacle: true },
      { x: 6, y: 14, frame: 'tree_oak_2', isFlora: true, obstacle: true },
      { x: 6, y: 22, frame: 'tree_small_1', isFlora: true, obstacle: true },
      { x: 6, y: 28, frame: 'tree_small_2', isFlora: true, obstacle: true },
      { x: 13, y: 14, frame: 'tree_small_1', isFlora: true, obstacle: true },
      { x: 28, y: 15, frame: 'tree_small_2', isFlora: true, obstacle: true },
      { x: 42, y: 14, frame: 'tree_apple', isFlora: true, obstacle: true },
      { x: 31, y: 31, frame: 'tree_willow', isFlora: true, obstacle: true },
      { x: 41, y: 32, frame: 'tree_willow', isFlora: true, obstacle: true },
      { x: 8, y: 26, frame: 'bush_berry_red', isFlora: true },
      { x: 8, y: 18, frame: 'bush_berry_red', isFlora: true },
      { x: 44, y: 27, frame: 'bush_berry_orange', isFlora: true },
      { x: 44, y: 21, frame: 'bush_berry_blue', isFlora: true },
      { x: 22, y: 25, frame: 'pebbles_a' },
      { x: 26, y: 26, frame: 'pebbles_b' },
      { x: 30, y: 24, frame: 'pebbles_c' },

      // 3. Elbe Weeping Willows (strictly outside |tx - riverCenter| >= 4.2)
      { x: 44, y: 12, frame: 'tree_willow', isFlora: true, obstacle: true },
      { x: 44, y: 31, frame: 'tree_willow', isFlora: true, obstacle: true },
      { x: 43, y: 42, frame: 'tree_willow', isFlora: true, obstacle: true },
      { x: 45, y: 69, frame: 'tree_willow', isFlora: true, obstacle: true },
      { x: 56, y: 14, frame: 'tree_willow', isFlora: true, obstacle: true },
      { x: 57, y: 32, frame: 'tree_willow', isFlora: true, obstacle: true },
      { x: 56, y: 48, frame: 'tree_willow', isFlora: true, obstacle: true },
      { x: 57, y: 64, frame: 'tree_willow', isFlora: true, obstacle: true },
      { x: 55, y: 83, frame: 'tree_willow', isFlora: true, obstacle: true },

      // 4. Katharina's Monastery Orchard
      { x: 32, y: 42, frame: 'tree_apple', isFlora: true, obstacle: true },
      { x: 40, y: 41, frame: 'tree_pear', isFlora: true, obstacle: true },
      { x: 45, y: 43, frame: 'tree_apple', isFlora: true, obstacle: true },
      { x: 30, y: 45, frame: 'bush_berry_red', isFlora: true },
      { x: 45, y: 54, frame: 'bush_berry_blue', isFlora: true },

      // 5. Frankenhausen Orchard (strictly off the river! tx >= 57)
      { x: 57, y: 65, frame: 'tree_apple', isFlora: true, obstacle: true },
      { x: 64, y: 65, frame: 'tree_pear', isFlora: true, obstacle: true },
      { x: 70, y: 67, frame: 'tree_apple', isFlora: true, obstacle: true },
      { x: 68, y: 78, frame: 'bush_berry_orange', isFlora: true },
      { x: 54, y: 82, frame: 'logs_b', obstacle: true },

      // 6. East Border Forests (Worms & Augsburg)
      { x: 56, y: 8, frame: 'tree_autumn_1', isFlora: true, obstacle: true },
      { x: 66, y: 8, frame: 'tree_autumn_2', isFlora: true, obstacle: true },
      { x: 76, y: 8, frame: 'tree_oak_tall', scale: 0.66, isFlora: true, obstacle: true },
      { x: 86, y: 8, frame: 'tree_oak_1', isFlora: true, obstacle: true },
      { x: 92, y: 8, frame: 'tree_pine_tall', scale: 0.68, isFlora: true, obstacle: true },
      { x: 92, y: 18, frame: 'tree_pine_1', isFlora: true, obstacle: true },
      { x: 92, y: 26, frame: 'tree_autumn_1', isFlora: true, obstacle: true },
      { x: 92, y: 36, frame: 'tree_pine_2', isFlora: true, obstacle: true },
      { x: 92, y: 48, frame: 'tree_pine_tall', scale: 0.68, isFlora: true, obstacle: true },
      { x: 92, y: 60, frame: 'tree_autumn_2', isFlora: true, obstacle: true },
      { x: 92, y: 72, frame: 'tree_pine_3', isFlora: true, obstacle: true },
      { x: 92, y: 82, frame: 'tree_pine_tall', scale: 0.68, isFlora: true, obstacle: true },
      { x: 73, y: 84, frame: 'tree_pine_1', isFlora: true, obstacle: true },
      { x: 79, y: 84, frame: 'tree_pine_2', isFlora: true, obstacle: true },
      { x: 85, y: 84, frame: 'tree_pine_tall', scale: 0.66, isFlora: true, obstacle: true },
      { x: 89, y: 84, frame: 'tree_fir_1', isFlora: true, obstacle: true },
      { x: 73, y: 32, frame: 'tree_oak_2', isFlora: true, obstacle: true },
      { x: 74, y: 38, frame: 'tree_small_3', isFlora: true, obstacle: true },
      { x: 71, y: 45, frame: 'bush_big_green', isFlora: true },
    ];

    for (const item of natureItems) {
      if (Math.abs(item.x - this.riverCenterTileX(item.y)) < 3.6) continue;
      if (!this.textures.get('world_atlas')?.has(item.frame)) continue;

      const finalScale = item.scale !== undefined ? item.scale : getNatureScale(item.frame);
      const px = item.x * 16;
      const py = item.y * 16;
      const spr = this.add
        .image(px, py, 'world_atlas', item.frame)
        .setOrigin(0.5, 0.9)
        .setScale(finalScale)
        .setDepth(py);

      if (item.isFlora) {
        this.livingWorldManager.registerFlora(spr);
      }
      if (item.obstacle) {
        this.addStaticBox(px, py - 4, 14, 10);
      }
    }
  }

  public buildPlateauCliffs(): void {
    const atlas = this.textures.get('world_atlas');
    const cliffRowY = 63 * 16 + 4;
    const isStairCol = (tx: number) => (tx >= 14 && tx <= 16) || (tx >= 32 && tx <= 34);

    const cliffSprites = ['rock_tall_a', 'rock_big_a', 'rock_moss_d', 'stone_wall', 'rock_big_b'];
    let idx = 0;

    for (let tx = 2; tx <= 44; tx += 2) {
      if (isStairCol(tx)) continue;
      const frame = cliffSprites[idx % cliffSprites.length];
      idx++;
      if (atlas?.has(frame)) {
        this.add
          .image(tx * 16 + 8, cliffRowY + 4, 'world_atlas', frame)
          .setOrigin(0.5, 0.85)
          .setScale(0.62)
          .setDepth(cliffRowY);
      }
    }

    // Solid physics walls on cliff segments leaving the two open stairways (14..16 & 32..34) freely walkable!
    const bands: [number, number][] = [
      [0, 13.6],
      [17.2, 31.6],
      [35.2, 45.2],
    ];
    for (const [startTx, endTx] of bands) {
      const cx = ((startTx + endTx) * 0.5) * 16;
      const w = (endTx - startTx) * 16;
      this.addStaticBox(cx, cliffRowY, w, 22);
    }

    // Visual stair beacons / stone posts flanking both Wartburg ascent passes
    for (const markerTx of [13.4, 17.4, 31.4, 35.4]) {
      if (atlas?.has('torch')) {
        const torch = this.add
          .image(markerTx * 16, cliffRowY + 6, 'world_atlas', 'torch')
          .setOrigin(0.5, 0.9)
          .setScale(0.7)
          .setDepth(cliffRowY + 8);
        this.livingWorldManager.registerFireSource(torch.x, torch.y - 6, false, 18, 0xffaa44);
      }
    }
  }

  private placeWorldDecor(): void {
    for (const d of REFORMATION_DECOR) {
      if (!this.textures.exists(d.spriteKey)) continue;
      const scale = d.scale || 1.0;
      const spr = this.add.image(d.x, d.y, d.spriteKey).setOrigin(0.5, 0.9).setScale(scale).setDepth(d.y);

      if (d.isObstacle) {
        const w = spr.width * scale;
        const h = spr.height * scale;
        if (TALL_BUILDING_KEYS.has(d.spriteKey)) {
          const colW = Math.max(28, Math.round(w * 0.72));
          const colH = Math.min(34, Math.max(20, Math.round(h * 0.26)));
          this.addStaticBox(d.x, d.y - colH * 0.5 - 8, colW, colH);
        } else {
          const colW = Math.min(42, Math.max(12, Math.round(w * 0.62)));
          const colH = Math.min(16, Math.max(8, Math.round(h * 0.34)));
          this.addStaticBox(d.x, d.y - colH * 0.45, colW, colH);
        }
      }
    }
  }

  private placeResourceNodes(): void {
    for (const n of RESOURCE_NODES) {
      if (!this.textures.exists(n.spriteKey)) continue;
      this.add.image(n.x, n.y, n.spriteKey).setOrigin(0.5, 0.85).setScale(0.85).setDepth(n.y);
      this.livingWorldManager.registerResourceHotspot(n.x, n.y);
      this.addStaticBox(n.x, n.y - 4, 18, 10);
    }
  }

  private setupTargets(): void {
    this.targets = [];

    // 1. Mentors (16x32 native sprites, zero scaleY morph)
    for (const ch of REFORMATION_CHAPTERS) {
      const m = ch.mentor;
      if (!this.textures.exists(m.spriteKey)) continue;
      const spr = this.add.sprite(m.x, m.y, m.spriteKey, 0).setOrigin(0.5, 0.9).setScale(1.0).setDepth(m.y + 12);
      if (this.anims.exists(`${m.spriteKey}-idle-down`)) {
        spr.play(`${m.spriteKey}-idle-down`);
      }
      this.livingWorldManager.registerMentor(spr);
      this.targets.push({
        id: `mentor_${ch.id}`,
        kind: 'mentor',
        name: m.name,
        sub: m.role,
        x: m.x,
        y: m.y,
        minChapter: 1,
        chapterId: ch.id,
        actionTip: '[E] Sprechen',
        sprite: spr,
      });
    }

    // 2. Relikte / Leitfunde
    for (const r of REFORMATION_RELICS) {
      const glow = this.add.image(r.x, r.y, 'relic_marker_glow').setOrigin(0.5, 0.5).setDepth(r.y).setScale(0.8);
      this.tweens.add({
        targets: glow,
        alpha: { from: 0.4, to: 0.9 },
        scale: { from: 0.75, to: 0.9 },
        duration: 1000,
        yoyo: true,
        repeat: -1,
      });

      this.targets.push({
        id: `relic_${r.id}`,
        kind: 'relic',
        name: r.name,
        sub: `${r.year} · ${r.epoch}`,
        x: r.x,
        y: r.y,
        minChapter: 1,
        relic: r,
        discovered: gameState.discoveredRelics.has(r.id),
        actionTip: '[E] Bergen & Prüfen',
      });
    }

    // 3. Rohstoff-Knoten
    for (const n of RESOURCE_NODES) {
      this.targets.push({
        id: `node_${n.id}`,
        kind: 'resource',
        name: n.name,
        sub: n.description,
        x: n.x,
        y: n.y,
        minChapter: 1,
        nodeDef: n,
        actionTip: '[E] Sammeln',
      });
    }

    // 4. Didaktische Mitmach-Stationen
    for (const st of REFORMATION_STATIONS) {
      const glow = this.add.image(st.x, st.y, 'relic_marker_glow')
        .setOrigin(0.5, 0.5)
        .setDepth(st.y)
        .setScale(0.85)
        .setTint(0xf59e0b);

      this.tweens.add({
        targets: glow,
        alpha: { from: 0.45, to: 0.95 },
        scale: { from: 0.8, to: 0.95 },
        duration: 1100,
        yoyo: true,
        repeat: -1,
      });

      this.targets.push({
        id: `station_${st.id}`,
        kind: 'station',
        name: st.name,
        sub: `Station · ${st.badge}`,
        x: st.x,
        y: st.y,
        minChapter: st.chapter,
        stationId: st.id,
        actionTip: '[E] Station öffnen',
      });
    }

    // 5. Begehbare Gebäudeportale (alle 8 historischen Innenräume über InteriorScene!)
    const buildingDoors: { id: string; name: string; x: number; y: number; interiorId: string; chapterId: number }[] = [
      { id: 'door_schlosskirche', name: 'Schlosskirche Wittenberg', x: 20 * 16, y: 19 * 16 + 10, interiorId: 'schlosskirche_portal', chapterId: 1 },
      { id: 'door_cranach', name: 'Cranach Druckerei & Atelier', x: 35 * 16, y: 19 * 16 + 10, interiorId: 'cranach_werkstatt_druckerei', chapterId: 2 },
      { id: 'door_fugger', name: 'Fuggerpalais Audienzsaal', x: 62 * 16, y: 19 * 16 + 10, interiorId: 'fuggerpalais_augsburg', chapterId: 3 },
      { id: 'door_worms', name: 'Reichstagssaal zu Worms', x: 80 * 16, y: 19 * 16 + 10, interiorId: 'reichstagssaal_worms', chapterId: 4 },
      { id: 'door_wartburg', name: 'Wartburg Lutherstube', x: 24 * 16, y: 75 * 16 + 10, interiorId: 'wartburg_stube', chapterId: 5 },
      { id: 'door_kloster', name: 'Schwarzes Kloster Refektorium', x: 36 * 16, y: 47 * 16 + 10, interiorId: 'lutherstube_wittenberg', chapterId: 6 },
      { id: 'door_bauern', name: 'Bauernstube Frankenhausen', x: 58 * 16, y: 73 * 16 + 10, interiorId: 'bauernrat_stube', chapterId: 7 },
      { id: 'door_augsburg', name: 'Augsburger Friedenssaal', x: 81 * 16, y: 73 * 16 + 10, interiorId: 'rathaus_friedenssaal', chapterId: 8 },
    ];
    for (const d of buildingDoors) {
      this.targets.push({
        id: d.id,
        kind: 'door',
        name: d.name,
        sub: 'Gebäude betreten',
        x: d.x,
        y: d.y,
        minChapter: 1,
        chapterId: d.chapterId,
        interiorId: d.interiorId,
        actionTip: '[E] Betreten',
      });
    }
  }

  private initInteractionLabel(): void {
    const existing = document.getElementById('world-dom-label');
    if (existing) {
      this.labelDiv = existing;
      return;
    }
    this.labelDiv = document.createElement('div');
    this.labelDiv.id = 'world-dom-label';
    this.labelDiv.className = 'world-dom-label';
    this.labelDiv.style.display = 'none';
    this.labelDiv.addEventListener('click', () => this.triggerInteraction());
    document.body.appendChild(this.labelDiv);
  }

  private initMentorNameplates(): void {
    const existing = document.getElementById('floating-nameplates-layer');
    if (existing) existing.remove();
    this.nameplatesLayer = document.createElement('div');
    this.nameplatesLayer.id = 'floating-nameplates-layer';
    document.body.appendChild(this.nameplatesLayer);

    this.mentorNameplates = [];
    for (const t of this.targets) {
      if (t.kind !== 'mentor' || !t.sprite || !t.chapterId) continue;
      const el = document.createElement('div');
      el.className = 'floating-nameplate';
      el.innerHTML = `<span class="fp-name">${t.name}</span><span class="fp-role">${t.sub}</span>`;
      this.nameplatesLayer.appendChild(el);
      this.mentorNameplates.push({
        chId: t.chapterId,
        name: t.name,
        role: t.sub,
        sprite: t.sprite,
        el,
      });
    }
  }

  private projectToScreen(wx: number, wy: number): { sx: number; sy: number; rect: DOMRect } {
    const rect = this.game.canvas.getBoundingClientRect();
    const cam = this.cameras.main;
    const sx = rect.left + ((wx - cam.worldView.x) / Math.max(1, cam.worldView.width)) * rect.width;
    const sy = rect.top + ((wy - cam.worldView.y) / Math.max(1, cam.worldView.height)) * rect.height;
    return { sx, sy, rect };
  }

  private updateMentorNameplates(isModalOpen: boolean): void {
    if (!this.nameplatesLayer) return;
    if (isModalOpen) {
      this.nameplatesLayer.style.display = 'none';
      return;
    }
    this.nameplatesLayer.style.display = 'block';
    for (const np of this.mentorNameplates) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, np.sprite.x, np.sprite.y);
      if (dist > 155 || (this.activeTarget?.kind === 'mentor' && this.activeTarget.chapterId === np.chId)) {
        np.el.style.display = 'none';
        continue;
      }
      const { sx, sy, rect } = this.projectToScreen(np.sprite.x, np.sprite.y - 32);
      if (sx < rect.left + 20 || sx > rect.right - 20 || sy < rect.top + 48 || sy > rect.bottom - 20) {
        np.el.style.display = 'none';
        continue;
      }
      np.el.style.display = 'flex';
      np.el.style.left = `${Math.round(sx)}px`;
      np.el.style.top = `${Math.round(sy)}px`;

      // Turn mentor smoothly toward nearby player
      if (dist < 48) {
        const dx = this.player.x - np.sprite.x;
        const dy = this.player.y - np.sprite.y;
        const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
        const key = `${np.sprite.texture.key}-idle-${dir}`;
        if (this.anims.exists(key) && np.sprite.anims.currentAnim?.key !== key) {
          np.sprite.play(key);
        }
      }
    }
  }

  public refreshCharacterAppearance(): void {
    if (!this.player) return;
    const texKey = gameState.gender === 'female' && this.textures.exists('character_female') ? 'character_female' : 'character';
    this.player.setTexture(texKey);
    const idleKey = `idle-${gameState.gender}-${this.facing || 'down'}`;
    if (this.anims.exists(idleKey)) {
      this.player.play(idleKey, true);
    }
  }

  update(_time: number, delta: number): void {
    const pBody = this.player?.body as Phaser.Physics.Arcade.Body | undefined;
    const isModalOpen = Boolean((window as any).__isModalOpen?.());

    // Keep relic discovery state synced with GameState
    for (const t of this.targets) {
      if (t.kind === 'relic' && t.relic) {
        t.discovered = gameState.discoveredRelics.has(t.relic.id);
      }
    }

    if (isModalOpen) {
      if (pBody) pBody.setVelocity(0, 0);
      this.playIdleAnim();
      if (this.labelDiv) this.labelDiv.style.display = 'none';
      this.updateMentorNameplates(true);
      this.companionManager.update(this.player, this.targets, delta);
      this.ambientSpeechManager.update(this.player.x, this.player.y, delta);
      return;
    }

    // Playtime Ticker (Pause Dashboard live metric)
    gameState.playTimeSeconds += delta / 1000;

    // 1. Movement Handling via Arcade Physics Velocity
    let vx = 0;
    let vy = 0;
    const speed = 112;

    const tc = (window as any).__touchControls;
    if (tc && (tc.dx !== 0 || tc.dy !== 0)) {
      vx = tc.dx * speed;
      vy = tc.dy * speed;
    } else if (this.cursors && this.wasd) {
      if (this.cursors.left.isDown || this.wasd.A.isDown) vx -= speed;
      if (this.cursors.right.isDown || this.wasd.D.isDown) vx += speed;
      if (this.cursors.up.isDown || this.wasd.W.isDown) vy -= speed;
      if (this.cursors.down.isDown || this.wasd.S.isDown) vy += speed;
    }

    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    if (pBody) {
      pBody.setVelocity(vx, vy);
    }

    this.player.setDepth(this.player.y);
    const movedDist = Math.hypot(this.player.x - this.lastPosX, this.player.y - this.lastPosY);
    this.lastPosX = this.player.x;
    this.lastPosY = this.player.y;
    gameState.playerX = this.player.x;
    gameState.playerY = this.player.y;
    if (movedDist > 0.1 && movedDist < 32) {
      gameState.walkedDistanceMeters += movedDist * 0.05;
    }

    if (vx !== 0 || vy !== 0) {
      this.stepTimer += delta;
      if (this.stepTimer >= 260) {
        this.stepTimer = 0;
        const surface = this.detectSurface(this.player.x / 16, this.player.y / 16);
        sound.footstep(surface);
      }

      const g = gameState.gender;
      this.player.setFlipX(false);
      if (Math.abs(vx) > Math.abs(vy)) {
        this.facing = vx > 0 ? 'right' : 'left';
      } else {
        this.facing = vy > 0 ? 'down' : 'up';
      }
      const walkKey = this.anims.exists(`walk-${g}-${this.facing}`) ? `walk-${g}-${this.facing}` : `walk-${this.facing}`;
      this.player.play(walkKey, true);
    } else {
      this.playIdleAnim();
    }

    // 2. Proximity Check (< 44px) & Floating Nameplates
    this.updateProximityLabel();
    this.updateMentorNameplates(false);

    // 3. Subsystem Updates
    this.wildlifeManager.update(delta, this.player.x, this.player.y, (x, y) => this.isWorldPointBlocked(x, y));
    this.livingWorldManager.update(delta);
    this.companionManager.update(this.player, this.targets, delta);
    this.atmosphereManager.update(delta, this.cameras.main.scrollX, this.cameras.main.scrollY);
    this.ambientSpeechManager.update(this.player.x, this.player.y, delta);
    this.updateQuestCompass();

    // 4. Chapter Change Banner & Music
    if (gameState.chapter !== this.lastBannerChapter) {
      this.lastBannerChapter = gameState.chapter;
      const curCh = gameState.getChapterData();
      this.showChapterBanner(curCh);
      this.atmosphereManager.setChapterMood(curCh.number);
      musicManager.playChapterTrack(curCh.number);
    }

    // 5. Interaction Key Check ([E] / Space / Touch A)
    const justPressedE =
      (this.wasd?.E && Phaser.Input.Keyboard.JustDown(this.wasd.E)) ||
      (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey)) ||
      tc?.actionPressed;

    if (justPressedE && this.activeTarget) {
      if (tc) tc.actionPressed = false;
      this.triggerInteraction();
    }
  }

  private playIdleAnim(): void {
    if (!this.player) return;
    const g = gameState.gender;
    this.player.setFlipX(false);
    const idleKey = this.anims.exists(`idle-${g}-${this.facing}`)
      ? `idle-${g}-${this.facing}`
      : (this.anims.exists(`idle-${this.facing}`) ? `idle-${this.facing}` : null);
    if (idleKey) {
      this.player.play(idleKey, true);
    }
  }

  private detectSurface(tx: number, ty: number): 'stone' | 'dirt' | 'grass' | 'wood' {
    if (this.isBridgeRow(ty) && Math.abs(tx - this.riverCenterTileX(ty)) < 3.0) {
      return 'wood';
    }
    if (
      Math.hypot((tx - 25) * 0.85, (ty - 23) * 1.0) < 9.0 ||
      Math.hypot((tx - 37) * 0.9, (ty - 21) * 1.0) < 5.5 ||
      Math.hypot((tx - 62) * 0.9, (ty - 21) * 1.0) < 5.8 ||
      Math.hypot((tx - 80) * 0.85, (ty - 21) * 1.0) < 7.5 ||
      Math.hypot((tx - 22) * 0.85, (ty - 73) * 1.0) < 7.2 ||
      Math.hypot((tx - 81) * 0.85, (ty - 75) * 1.0) < 6.8
    ) {
      return 'stone';
    }
    if (ty >= 68 && ty <= 82 && tx >= 54 && tx <= 70) {
      return 'dirt';
    }
    return 'grass';
  }

  private updateProximityLabel(): void {
    if (!this.labelDiv) return;

    let closest: InteractiveTarget | null = null;
    let minDist = 44;

    for (const t of this.targets) {
      if (t.minChapter > gameState.chapter) continue;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, t.x, t.y);
      if (dist < minDist) {
        minDist = dist;
        closest = t;
      }
    }

    // Companion Tölpel petting fallback when close & no primary target
    if (!closest && this.companionManager?.sprite) {
      const dog = this.companionManager.sprite;
      const dDog = Phaser.Math.Distance.Between(this.player.x, this.player.y, dog.x, dog.y);
      if (dDog < 32) {
        closest = {
          id: 'companion_toelpel',
          kind: 'companion',
          name: 'Tölpel (Begleiter)',
          sub: 'Luthers treuer Hofhund',
          x: dog.x,
          y: dog.y,
          minChapter: 1,
          actionTip: '[E] Streicheln ❤️',
        };
      }
    }

    this.activeTarget = closest;

    if (closest) {
      const { sx, sy, rect } = this.projectToScreen(closest.x, closest.y - 26);
      const clampedX = Math.max(rect.left + 76, Math.min(rect.right - 76, sx));
      const clampedY = Math.max(rect.top + 52, Math.min(rect.bottom - 26, sy));

      this.labelDiv.innerHTML = `<strong>${closest.name}</strong><span class="wdl-tip">${closest.actionTip || '[E] Interagieren'}</span>`;
      this.labelDiv.style.left = `${Math.round(clampedX)}px`;
      this.labelDiv.style.top = `${Math.round(clampedY)}px`;
      this.labelDiv.style.display = 'flex';
    } else {
      this.labelDiv.style.display = 'none';
    }
  }

  public triggerInteraction(): void {
    if ((window as any).__isModalOpen?.()) return;
    if (!this.activeTarget) return;
    const t = this.activeTarget;
    sound.click();

    const uiScene = this.scene.get('UIScene') as any;

    if (t.kind === 'mentor') {
      const targetCh = t.chapterId ?? gameState.chapter;
      this.focusOnDialog(t.x, t.y);
      if ((window as any).__openMentorDialog) {
        (window as any).__openMentorDialog(targetCh, () => this.resetDialogFocus());
      } else if (uiScene?.openMentorDialog) {
        uiScene.openMentorDialog(targetCh, () => this.resetDialogFocus());
      }
      if (targetCh === gameState.chapter) {
        gameState.completeObjective(targetCh, 0);
      }
    } else if (t.kind === 'companion') {
      this.companionManager.pet();
    } else if (t.kind === 'relic' && t.relic) {
      if ((window as any).__openArtifactInspector) {
        (window as any).__openArtifactInspector(t.relic.id);
      } else {
        uiScene?.openRelicModal?.(t.relic);
      }
    } else if (t.kind === 'station' && t.stationId) {
      if ((window as any).__openStation) {
        (window as any).__openStation(t.stationId);
      } else {
        uiScene?.openStationModal?.(t.stationId);
      }
    } else if (t.kind === 'door') {
      const roomId = t.interiorId || 'lutherstube_wittenberg';
      if (roomId === 'fuggerpalais_augsburg' && gameState.chapter === 3) {
        gameState.completeObjective(3, 2);
      } else if (roomId === 'reichstagssaal_worms' && gameState.chapter === 4) {
        gameState.completeObjective(4, 1);
      } else if (roomId === 'lutherstube_wittenberg' && gameState.chapter === 6) {
        gameState.completeObjective(6, 2);
      } else if (roomId === 'bauernrat_stube' && gameState.chapter === 7) {
        gameState.completeObjective(7, 1);
      } else if (roomId === 'rathaus_friedenssaal' && gameState.chapter === 8) {
        gameState.completeObjective(8, 1);
      }
      this.enterInterior(roomId);
    } else if (t.kind === 'resource' && t.nodeDef) {
      gameState.addItem(t.nodeDef.lootItem as ReformationItemId, t.nodeDef.lootCount);
      uiScene?.showToast?.(`+${t.nodeDef.lootCount} ${t.nodeDef.name} gesammelt!`);
      sound.questStep();
      if ((t.nodeDef.id === 'node_lettern' || t.nodeDef.id === 'node_pergament') && gameState.chapter === 2) {
        gameState.completeObjective(2, 1);
      } else if (t.nodeDef.id === 'node_holz' && gameState.chapter === 5) {
        gameState.completeObjective(5, 1);
      } else if (t.nodeDef.id === 'node_kraeuter' && gameState.chapter === 6) {
        gameState.completeObjective(6, 1);
      }
    }
  }

  public focusOnDialog(_targetX: number, _targetY: number): void {
    this.tweens.add({
      targets: this.cameras.main,
      zoom: 1.32,
      duration: 400,
      ease: 'Cubic.easeInOut',
    });
  }

  public resetDialogFocus(): void {
    this.tweens.add({
      targets: this.cameras.main,
      zoom: 1.0,
      duration: 350,
      ease: 'Cubic.easeInOut',
    });
  }

  public updateQuestCompass(): void {
    const curCh = REFORMATION_CHAPTERS.find((c) => c.number === gameState.chapter);
    if (!curCh) return;

    const objectives = gameState.chapterObjectives[curCh.number] || [false, false, false, false];
    let targetX = curCh.mentor.x;
    let targetY = curCh.mentor.y;
    let targetName = curCh.mentor.name;

    if (!objectives[0]) {
      targetX = curCh.mentor.x;
      targetY = curCh.mentor.y;
      targetName = curCh.mentor.name;
    } else if (!objectives[1]) {
      if (curCh.number === 1) {
        const ablass = this.targets.find((t) => t.id === 'relic_ablasskasten_tetzel');
        if (ablass) { targetX = ablass.x; targetY = ablass.y; targetName = ablass.name; }
      } else if (curCh.number === 2) {
        const nd = this.targets.find((t) => t.id === 'node_node_lettern');
        if (nd) { targetX = nd.x; targetY = nd.y; targetName = nd.name; }
      } else if (curCh.number === 5) {
        const nd = this.targets.find((t) => t.id === 'node_node_holz');
        if (nd) { targetX = nd.x; targetY = nd.y; targetName = nd.name; }
      } else if (curCh.number === 6) {
        const nd = this.targets.find((t) => t.id === 'node_node_kraeuter');
        if (nd) { targetX = nd.x; targetY = nd.y; targetName = nd.name; }
      } else if (curCh.targetInterior) {
        const door = this.targets.find((t) => t.kind === 'door' && t.interiorId === curCh.targetInterior);
        if (door) { targetX = door.x; targetY = door.y; targetName = door.name; }
      }
    } else if (!objectives[2] && curCh.stationId) {
      const st = this.targets.find((t) => t.stationId === curCh.stationId);
      if (st) { targetX = st.x; targetY = st.y; targetName = st.name; }
    } else if (!objectives[2] && curCh.targetInterior) {
      const door = this.targets.find((t) => t.kind === 'door' && t.interiorId === curCh.targetInterior);
      if (door) { targetX = door.x; targetY = door.y; targetName = door.name; }
    } else if (!objectives[3] && curCh.relicId) {
      const r = this.targets.find((t) => t.relic?.id === curCh.relicId);
      if (r) { targetX = r.x; targetY = r.y; targetName = r.name; }
    } else if (!objectives[3]) {
      targetX = curCh.mentor.x;
      targetY = curCh.mentor.y;
      targetName = `${curCh.mentor.name} (Disputation)`;
    } else {
      gameState.compassText = `🧭 Kapitel ${curCh.number} gemeistert!`;
      const el = document.getElementById('hud-compass');
      if (el) el.innerHTML = `🧭 <strong style="color:#15803d;">Kapitel ${curCh.number} abgeschlossen!</strong>`;
      return;
    }

    const dx = targetX - this.player.x;
    const dy = targetY - this.player.y;
    const distPx = Math.hypot(dx, dy);
    const meters = Math.max(1, Math.round(distPx / 8));
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    let dirStr = '→ Osten';
    if (angle >= -112.5 && angle < -67.5) dirStr = '↑ Norden';
    else if (angle >= -67.5 && angle < -22.5) dirStr = '↗ Nordosten';
    else if (angle >= -22.5 && angle < 22.5) dirStr = '→ Osten';
    else if (angle >= 22.5 && angle < 67.5) dirStr = '↘ Südosten';
    else if (angle >= 67.5 && angle < 112.5) dirStr = '↓ Süden';
    else if (angle >= 112.5 && angle < 157.5) dirStr = '↙ Südwesten';
    else if (angle >= -157.5 && angle < -112.5) dirStr = '↖ Nordwesten';
    else dirStr = '← Westen';

    const compassMsg =
      distPx <= 38
        ? `📍 Direkt vor dir: <strong>${targetName}</strong> <span class="compass-key">[E]</span>`
        : `🧭 <strong>${targetName}:</strong> ${dirStr} (${meters} m)`;

    gameState.compassText = compassMsg;
    const el = document.getElementById('hud-compass');
    if (el) el.innerHTML = compassMsg;
  }

  public enterInterior(roomId: string = 'lutherstube_wittenberg'): void {
    sound.door();
    if (this.player?.body) {
      (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    }
    this.input.keyboard?.resetKeys();
    this.ambientSpeechManager?.dismissBubble(true);
    if (this.labelDiv) this.labelDiv.style.display = 'none';
    if (this.nameplatesLayer) this.nameplatesLayer.style.display = 'none';
    this.scene.pause('WorldScene');
    this.scene.launch('InteriorScene', {
      roomId,
      returnX: this.player.x,
      returnY: this.player.y + 16,
    });
  }
}
