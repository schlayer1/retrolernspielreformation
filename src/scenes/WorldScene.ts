import Phaser from 'phaser';
import { sound } from '../audio/sound';
import { REFORMATION_CHAPTERS, ChapterData } from '../data/chapters';
import { REFORMATION_ITEMS, ReformationItemId } from '../data/items';
import { REFORMATION_RELICS, ReformationRelic } from '../data/relics';
import { REFORMATION_DECOR, RESOURCE_NODES, DecorObject, ResourceNode } from '../data/decor';
import { REFORMATION_STATIONS, DidacticStation } from '../data/stations';
import { gameState } from '../systems/GameState';
import { WildlifeManager } from '../world/Wildlife';
import { LivingWorldManager } from '../world/LivingWorldManager';
import { ChapterBanner } from '../ui/ChapterBanner';
import { CompanionManager } from '../world/Companion';
import { AtmosphereManager } from '../world/AtmosphereManager';
import { AmbientSpeechManager } from '../world/AmbientSpeech';

export interface RoomDefinition {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  bgKey: string;
  entrance: { x: number; y: number };
  exit: { x: number; y: number };
  outdoorDoorId: string;
  outdoorDoor: { x: number; y: number };
  outdoorWarp: { x: number; y: number };
}

export const ROOMS: RoomDefinition[] = [
  {
    id: 'cranach',
    name: 'Cranach Hofatelier & Druckerei',
    x: 118 * 16,
    y: 12 * 16,
    w: 384,
    h: 240,
    bgKey: 'interior_store_smithy_day',
    entrance: { x: 125 * 16, y: 24 * 16 },
    exit: { x: 125 * 16, y: 26 * 16 },
    outdoorDoorId: 'door_enter_cranach',
    outdoorDoor: { x: 36 * 16, y: 20 * 16 },
    outdoorWarp: { x: 36 * 16, y: 22 * 16 },
  },
  {
    id: 'worms',
    name: 'Kaiserlicher Reichstagssaal zu Worms',
    x: 156 * 16,
    y: 12 * 16,
    w: 416,
    h: 256,
    bgKey: 'interior_guild_library_day',
    entrance: { x: 169 * 16, y: 25 * 16 },
    exit: { x: 169 * 16, y: 27 * 16 },
    outdoorDoorId: 'door_enter_worms',
    outdoorDoor: { x: 80 * 16, y: 20 * 16 },
    outdoorWarp: { x: 80 * 16, y: 22 * 16 },
  },
  {
    id: 'fugger',
    name: 'Fuggerpalais Audienzsaal (Augsburg)',
    x: 117 * 16,
    y: 47 * 16,
    w: 416,
    h: 256,
    bgKey: 'interior_guild_library_night',
    entrance: { x: 130 * 16, y: 60 * 16 },
    exit: { x: 130 * 16, y: 62 * 16 },
    outdoorDoorId: 'door_enter_fugger',
    outdoorDoor: { x: 62 * 16, y: 20 * 16 },
    outdoorWarp: { x: 62 * 16, y: 22 * 16 },
  },
  {
    id: 'wartburg',
    name: 'Luthers Schreibstube (Wartburg)',
    x: 158 * 16,
    y: 47 * 16,
    w: 384,
    h: 240,
    bgKey: 'interior_tavern_night',
    entrance: { x: 168 * 16, y: 59 * 16 },
    exit: { x: 168 * 16, y: 61 * 16 },
    outdoorDoorId: 'door_enter_wartburg',
    outdoorDoor: { x: 22 * 16, y: 74 * 16 },
    outdoorWarp: { x: 22 * 16, y: 76 * 16 },
  },
  {
    id: 'kloster',
    name: 'Refektorium & Kloster-Apotheke',
    x: 138 * 16,
    y: 70 * 16,
    w: 384,
    h: 240,
    bgKey: 'interior_tavern_day',
    entrance: { x: 147 * 16, y: 82 * 16 },
    exit: { x: 147 * 16, y: 84 * 16 },
    outdoorDoorId: 'door_enter_kloster',
    outdoorDoor: { x: 36 * 16, y: 49 * 16 },
    outdoorWarp: { x: 36 * 16, y: 51 * 16 },
  },
];

export interface InteractiveTarget {
  id: string;
  kind: 'mentor' | 'resource' | 'relic' | 'station' | 'companion' | 'door';
  name: string;
  sub: string;
  x: number;
  y: number;
  minChapter: number;
  itemId?: ReformationItemId;
  relic?: ReformationRelic;
  stationId?: string;
  warpTarget?: { x: number; y: number; isIndoor: boolean; name: string; roomId?: string };
  questChapter?: number;
  questObjectiveIndex?: number;
  questMessage?: string;
  actionTip?: string;
  discovered?: boolean;
  nodeDef?: ResourceNode;
}

export class WorldScene extends Phaser.Scene {
  public mapW = 196;
  public mapH = 90;
  public currentRoom: RoomDefinition | null = null;
  public player!: Phaser.GameObjects.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    E: Phaser.Input.Keyboard.Key;
  };
  private spaceKey?: Phaser.Input.Keyboard.Key;
  private enterKey?: Phaser.Input.Keyboard.Key;

  public targets: InteractiveTarget[] = [];
  private activeTarget: InteractiveTarget | null = null;
  private labelDiv: HTMLElement | null = null;

  public wildlifeManager!: WildlifeManager;
  public livingWorldManager!: LivingWorldManager;
  public chapterBanner!: ChapterBanner;
  public companionManager!: CompanionManager;
  public atmosphereManager!: AtmosphereManager;
  public ambientSpeechManager!: AmbientSpeechManager;

  private stepTimer = 0;
  private facing: 'down' | 'up' | 'left' | 'right' = 'down';
  private lastBannerChapter = -1;

  constructor() {
    super('WorldScene');
  }

  create(): void {
    // 1. Bake Per-Pixel Multi-Biome Ground with 4x4 Bayer Dithering & Sandstone Cobblestones
    this.bakeReformationTerrainTexture();
    this.add.image(0, 0, 'reformation_baked_ground').setOrigin(0, 0).setDepth(0);

    // 2. Render Authentic 16-Bit Pre-Rendered Room Backdrops in Isolated Coordinate Zones
    for (const room of ROOMS) {
      if (this.textures.exists(room.bgKey)) {
        this.add.image(room.x, room.y, room.bgKey).setOrigin(0, 0).setDepth(2);
      }
    }

    // 3. Initialize Subsystems
    this.wildlifeManager = new WildlifeManager(this);
    this.livingWorldManager = new LivingWorldManager(this);
    this.chapterBanner = new ChapterBanner();
    this.companionManager = new CompanionManager(this);
    this.atmosphereManager = new AtmosphereManager(this);
    this.atmosphereManager.init(this.mapW, this.mapH);
    this.atmosphereManager.setChapterMood(gameState.chapter);
    this.ambientSpeechManager = new AmbientSpeechManager(this);

    // 4. Dense Ground Flora Scattering (Outdoors only)
    this.scatterGroundFlora();
    this.buildPlateauCliffs();

    // 5. Place Static Decor & Real Architecture Buildings
    this.placeWorldDecor();

    // 6. Place Resource Hotspots
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
      this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }

    // 8. Spawn Player
    this.player = this.add.sprite(gameState.playerX, gameState.playerY, 'character', 0);
    this.player.setOrigin(0.5, 0.9);
    this.player.setScale(1.0);
    this.player.setDepth(this.player.y);

    // 9. Setup Camera Clamping & Room State
    const startRoom = ROOMS.find(
      (r) =>
        this.player.x >= r.x &&
        this.player.x <= r.x + r.w &&
        this.player.y >= r.y &&
        this.player.y <= r.y + r.h
    );

    if (startRoom) {
      this.currentRoom = startRoom;
      const cam = this.cameras.main;
      cam.stopFollow();
      const fitZoom = Math.max(cam.width / startRoom.w, cam.height / startRoom.h);
      cam.setZoom(fitZoom);
      cam.centerOn(startRoom.x + startRoom.w / 2, startRoom.y + startRoom.h / 2);
      cam.setBounds(startRoom.x, startRoom.y, startRoom.w, startRoom.h);
      sound.setIndoorAcoustics(true);
    } else {
      this.currentRoom = null;
      this.cameras.main.setBounds(0, 0, 96 * 16, 88 * 16);
      this.cameras.main.setZoom(1.0);
      this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
      sound.setIndoorAcoustics(false);
    }

    // 10. Companion Unlock (Luthers Hund Tölpel)
    this.companionManager.unlock(this.player.x - 20, this.player.y);

    // 11. Setup Interactive Targets, Doors & Mentors
    this.setupTargets();

    (window as any).__enterSampleInterior = () => this.enterInterior('lutherstube_wittenberg');
    this.initInteractionLabel();

    // Expose interaction trigger globally for DOM label click & UI scene
    (window as any).__triggerInteraction = () => this.triggerInteraction();

    // 12. Init Wildlife & Living World
    this.wildlifeManager.init();
    this.livingWorldManager.initWaterEffects(48 * 16, 52 * 16, 4 * 16, 76 * 16);

    // 13. Dynamic Fireplaces, Chimney Smoke & Interior Ambient Animation
    this.livingWorldManager.registerFireSource(136 * 16, 17 * 16, true, 28, 0xffa533); // Cranach Esse
    this.livingWorldManager.registerFireSource(163 * 16, 50 * 16, true, 32, 0xff7722); // Wartburg Kamin
    this.livingWorldManager.registerFireSource(26 * 16, 34 * 16, false, 20, 0xffaa44);  // Tetzel Stand
    this.livingWorldManager.registerFireSource(143 * 16, 73 * 16, true, 28, 0xff7722); // Kloster Kamin

    if (this.textures.exists('dog_sleeping')) {
      this.add.sprite(163 * 16, 52 * 16, 'dog_sleeping').play('dog-sleeping-anim').setDepth(52 * 16 + 1); // Wartburg
    }
    if (this.textures.exists('candle_lit')) {
      this.add.sprite(126 * 16, 16 * 16 - 12, 'candle_lit').play('candle-lit-anim').setDepth(16 * 16 + 2); // Cranach
      this.add.sprite(169 * 16, 20 * 16 - 12, 'candle_lit').play('candle-lit-anim').setDepth(20 * 16 + 2); // Worms
      this.add.sprite(137 * 16, 51 * 16 - 12, 'candle_lit').play('candle-lit-anim').setDepth(51 * 16 + 2); // Fugger
      this.add.sprite(168 * 16, 52 * 16 - 12, 'candle_lit').play('candle-lit-anim').setDepth(52 * 16 + 2); // Wartburg
      this.add.sprite(147 * 16, 75 * 16 - 12, 'candle_lit').play('candle-lit-anim').setDepth(75 * 16 + 2); // Kloster
    }
    if (this.textures.exists('coin_sparkle')) {
      this.add.sprite(137 * 16 + 8, 51 * 16 - 8, 'coin_sparkle').play('coin-sparkle-anim').setDepth(51 * 16 + 3); // Fugger
    }
    if (this.textures.exists('cauldron')) {
      this.add.sprite(143 * 16 + 4, 73 * 16 - 4, 'cauldron').play('cauldron-anim').setDepth(73 * 16 + 2); // Kloster
    }

    // 14. First Chapter Banner
    this.lastBannerChapter = gameState.chapter;
    const curCh = REFORMATION_CHAPTERS.find((c) => c.number === gameState.chapter);
    if (curCh) {
      this.chapterBanner.show({
        chapterNumber: curCh.number,
        title: curCh.title,
        subtitle: `${curCh.year} · ${curCh.location}`,
      });
    }

    // 15. Start BGM
    sound.startBGM(gameState.chapter);
  }

  private bakeReformationTerrainTexture(): void {
    const W = this.mapW * 16;
    const H = this.mapH * 16;

    const canvasTex = this.textures.createCanvas('reformation_baked_ground', W, H);
    if (!canvasTex) return;
    const ctx = canvasTex.getContext();
    const imgData = ctx.createImageData(W, H);
    const dst = imgData.data;

    // 1. Source Image Data from ground_a2 (Authentic SNES medieval autotile sheet)
    const groundKey = this.textures.exists('ground_a2') ? 'ground_a2' : 'ground_med_a2';
    const srcTex = this.textures.get(groundKey).getSourceImage() as HTMLImageElement;
    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = srcTex.width;
    srcCanvas.height = srcTex.height;
    const sctx = srcCanvas.getContext('2d')!;
    sctx.drawImage(srcTex, 0, 0);
    const srcData = sctx.getImageData(0, 0, srcTex.width, srcTex.height).data;
    const sw = srcTex.width;

    // 2. Source Image Data from Overworld (Classic 16-Bit SNES Water tile at 48,48)
    const owTex = this.textures.get('Overworld').getSourceImage() as HTMLImageElement;
    const owCanvas = document.createElement('canvas');
    owCanvas.width = owTex.width;
    owCanvas.height = owTex.height;
    const owctx = owCanvas.getContext('2d')!;
    owctx.drawImage(owTex, 0, 0);
    const owData = owctx.getImageData(0, 0, owTex.width, owTex.height).data;
    const oww = owTex.width;

    // Seamless tile sampling: 48x48 natural pattern sampling without bolt-slab distortions
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
      const sy = 48 + v;
      const idx = (sy * oww + sx) * 4;
      return [owData[idx], owData[idx + 1], owData[idx + 2]];
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

        // Solid dark void for all x >= 96 (interior rooms are rendered via pre-rendered backdrops)
        if (tx >= 96) {
          for (let py = y; py < y + 2 && py < H; py++) {
            for (let px = x; px < x + 2 && px < W; px++) {
              const oi = (py * W + px) * 4;
              dst[oi] = 12;
              dst[oi + 1] = 11;
              dst[oi + 2] = 16;
              dst[oi + 3] = 255;
            }
          }
          continue;
        }

        const dither = bayer4x4[Math.floor(y / 2) % 4][Math.floor(x / 2) % 4] - 0.5;

        // River Elbe curve: tx around 50 + sin wave
        const riverCenter = 50 + Math.sin(ty * 0.08) * 3.5;
        const distRiver = Math.abs(tx - riverCenter);

        // Bridges: Marktbrücke at y: 22..25, Südsteg at y: 56..59
        const isBridge = distRiver < 2.8 && ((ty >= 22 && ty <= 25) || (ty >= 56 && ty <= 59));

        // Medieval Roads & Footpaths
        const dWittenbergToRiver = this.distToSegment(tx, ty, 24, 24, 50, 24);
        const dRiverToWorms = this.distToSegment(tx, ty, 50, 24, 80, 22);
        const dFuggerPath = this.distToSegment(tx, ty, 50, 24, 62, 22);
        const dSouthRoad = this.distToSegment(tx, ty, 24, 24, 22, 74);
        const dPeasantRoad = this.distToSegment(tx, ty, 22, 74, 56, 74);
        const dAugsburg1555 = this.distToSegment(tx, ty, 56, 74, 80, 74);
        const dKlosterPath = this.distToSegment(tx, ty, 24, 24, 36, 50);
        const minRoadDist = Math.min(
          dWittenbergToRiver,
          dRiverToWorms,
          dFuggerPath,
          dSouthRoad,
          dPeasantRoad,
          dAugsburg1555,
          dKlosterPath
        );

        // Organic medieval plazas with soft dithered boundaries
        const distWittenberg = Math.hypot((tx - 26) * 0.85, (ty - 22) * 1.0);
        const inWittenbergPlaza = distWittenberg < 8.5 + dither * 1.2;

        const distCranach = Math.hypot((tx - 38) * 0.9, (ty - 21) * 1.0);
        const inCranachCourt = distCranach < 5.5 + dither * 1.0;

        const distFugger = Math.hypot((tx - 62) * 0.9, (ty - 21) * 1.0);
        const inFuggerCourt = distFugger < 5.8 + dither * 1.0;

        const distWorms = Math.hypot((tx - 80) * 0.85, (ty - 21) * 1.0);
        const inWormsCourt = distWorms < 7.5 + dither * 1.2;

        const distWartburg = Math.hypot((tx - 22) * 0.85, (ty - 73) * 1.0);
        const inWartburgCourt = distWartburg < 7.0 + dither * 1.2;

        const distAugsburg1555 = Math.hypot((tx - 80) * 0.85, (ty - 75) * 1.0);
        const inAugsburg1555Court = distAugsburg1555 < 6.5 + dither * 1.0;

        // Sandstone cobblestones for civic plazas (bx: 3, by: 3 in ground_a2)
        const isSandstoneCobble =
          inWittenbergPlaza ||
          inCranachCourt ||
          inFuggerCourt ||
          inAugsburg1555Court;

        // Dark castle stone for fortresses (bx: 2, by: 3 in ground_a2)
        const isCastleStone = inWormsCourt || inWartburgCourt;

        let bx = 1;
        let by = 1;
        let isWater = false;
        let isBridgePlank = false;

        if (isBridge) {
          isBridgePlank = true;
        } else if (distRiver < 1.8) {
          isWater = true;
        } else if (distRiver < 2.8 + dither * 0.6) {
          bx = 2; // Sandbank
          by = 1;
        } else if (isCastleStone) {
          bx = 2; // Dunkler Burg-Pflasterstein
          by = 3;
        } else if (isSandstoneCobble) {
          bx = 3; // Historischer Sandstein-Pflasterstein (ohne Bolzen)
          by = 3;
        } else if (minRoadDist < 1.4 + dither * 0.4) {
          bx = 1; // Warmer Feldweg
          by = 0;
        } else {
          // Thüringer Wald & sächsische Auen mit natürlicher Dither-Variation
          const wave = Math.sin(x * 0.02 + y * 0.02) * 0.5 + Math.cos(x * 0.015 - y * 0.02) * 0.5;
          if (wave + dither * 0.5 > 0.3) {
            bx = 0; // Waldgras
            by = 1;
          } else {
            bx = 1; // Sommerwiese
            by = 1;
          }
        }

        for (let py = y; py < y + 2 && py < H; py++) {
          for (let px = x; px < x + 2 && px < W; px++) {
            let r: number, g: number, b: number;
            if (isBridgePlank) {
              const plankPattern = (px + (py % 4 === 0 ? 1 : 0)) % 6 === 0 ? 112 : 144;
              r = plankPattern;
              g = Math.round(plankPattern * 0.72);
              b = Math.round(plankPattern * 0.44);
            } else if (isWater) {
              [r, g, b] = sampleWater(px, py);
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

  private distToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
  }

  public scatterGroundFlora(): void {
    const floraFrames = ['flower_red', 'flower_blue', 'flower_yellow', 'mushroom_brown', 'grass_tuft', 'pebble_small'];
    const validFrames = floraFrames.filter((f) => this.textures.get('world_atlas')?.has(f));

    const count = 140;
    for (let i = 0; i < count; i++) {
      const tx = Phaser.Math.Between(4, 90);
      const ty = Phaser.Math.Between(4, 82);
      const frameKey = validFrames.length > 0 ? Phaser.Math.RND.pick(validFrames) : undefined;

      if (frameKey && this.textures.get('world_atlas')?.has(frameKey)) {
        const flora = this.add.image(tx * 16, ty * 16, 'world_atlas', frameKey).setOrigin(0.5, 0.8).setDepth(ty * 16 - 2);
        this.livingWorldManager.registerFlora(flora);
      }
    }
  }

  private placeWorldDecor(): void {
    for (const d of REFORMATION_DECOR) {
      if (this.textures.exists(d.spriteKey)) {
        this.add.image(d.x, d.y, d.spriteKey).setOrigin(0.5, 0.9).setScale(d.scale || 1.0).setDepth(d.y);
      }
    }
  }

  private placeResourceNodes(): void {
    for (const n of RESOURCE_NODES) {
      if (this.textures.exists(n.spriteKey)) {
        this.add.image(n.x, n.y, n.spriteKey).setOrigin(0.5, 0.85).setScale(0.85).setDepth(n.y);
        this.livingWorldManager.registerResourceHotspot(n.x, n.y);
      }
    }
  }

  private setupTargets(): void {
    this.targets = [];

    // 1. Mentors aus chapters.ts
    for (const ch of REFORMATION_CHAPTERS) {
      const m = ch.mentor;
      if (this.textures.exists(m.spriteKey)) {
        this.add.sprite(m.x, m.y, m.spriteKey, 0).setOrigin(0.5, 0.9).setDepth(m.y);
        this.targets.push({
          id: `mentor_${ch.id}`,
          kind: 'mentor',
          name: m.name,
          sub: m.role,
          x: m.x,
          y: m.y,
          minChapter: ch.id,
          actionTip: '[E] Sprechen',
        });
      }
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
        sub: `Didaktische Station · ${st.badge}`,
        x: st.x,
        y: st.y,
        minChapter: st.chapter,
        stationId: st.id,
        actionTip: '[E] Station betreten',
      });
    }

    // 5. Begehbare Innenräume & Warp-Türen
    for (const room of ROOMS) {
      // Outdoor entrance door: located directly at building doorstep
      this.targets.push({
        id: room.outdoorDoorId,
        kind: 'door',
        name: room.name,
        sub: 'Gebäude betreten',
        x: room.outdoorDoor.x,
        y: room.outdoorDoor.y,
        minChapter: 1,
        actionTip: '[E] Betreten',
        warpTarget: {
          x: room.entrance.x,
          y: room.entrance.y,
          isIndoor: true,
          name: room.name,
          roomId: room.id,
        },
      });

      // Indoor exit door: located at room threshold
      this.targets.push({
        id: `door_exit_${room.id}`,
        kind: 'door',
        name: 'Ausgang nach draußen',
        sub: 'Hinaus ins Freie',
        x: room.exit.x,
        y: room.exit.y,
        minChapter: 1,
        actionTip: '[E] Verlassen',
        warpTarget: {
          x: room.outdoorWarp.x,
          y: room.outdoorWarp.y,
          isIndoor: false,
          name: 'Vorplatz',
        },
      });
    }
  }

  private initInteractionLabel(): void {
    if (this.labelDiv) return;
    this.labelDiv = document.createElement('div');
    this.labelDiv.id = 'world-dom-label';
    this.labelDiv.className = 'world-dom-label';
    this.labelDiv.style.display = 'none';
    this.labelDiv.addEventListener('click', () => this.triggerInteraction());
    document.body.appendChild(this.labelDiv);
  }

  update(time: number, delta: number): void {
    // 1. Movement Handling
    let vx = 0;
    let vy = 0;
    const speed = 110;

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

    // Dynamic movement clamping: room boundaries if indoors, world bounds if outdoors
    let minX = 24;
    let maxX = 94 * 16;
    let minY = 24;
    let maxY = 86 * 16;

    if (this.currentRoom) {
      minX = this.currentRoom.x + 20;
      maxX = this.currentRoom.x + this.currentRoom.w - 20;
      minY = this.currentRoom.y + 36;
      maxY = this.currentRoom.y + this.currentRoom.h - 14;
    }

    const nextX = Phaser.Math.Clamp(this.player.x + (vx * delta) / 1000, minX, maxX);
    const nextY = Phaser.Math.Clamp(this.player.y + (vy * delta) / 1000, minY, maxY);

    if (vx !== 0 || vy !== 0) {
      this.player.x = nextX;
      this.player.y = nextY;
      this.player.setDepth(this.player.y);

      gameState.playerX = this.player.x;
      gameState.playerY = this.player.y;
      gameState.walkedDistanceMeters += Math.hypot(vx, vy) * (delta / 1000) * 0.05;

      // Surface detection for footsteps
      let surface: 'stone' | 'dirt' | 'grass' | 'wood' = 'grass';
      if (this.currentRoom) {
        surface = 'wood';
      } else {
        const tx = this.player.x / 16;
        const ty = this.player.y / 16;
        if (
          Math.hypot((tx - 26) * 0.85, (ty - 22) * 1.0) < 8.5 ||
          Math.hypot((tx - 38) * 0.9, (ty - 21) * 1.0) < 5.5 ||
          Math.hypot((tx - 62) * 0.9, (ty - 21) * 1.0) < 5.8 ||
          Math.hypot((tx - 80) * 0.85, (ty - 21) * 1.0) < 7.5 ||
          Math.hypot((tx - 22) * 0.85, (ty - 73) * 1.0) < 7.0 ||
          Math.hypot((tx - 80) * 0.85, (ty - 75) * 1.0) < 6.5
        ) {
          surface = 'stone';
        } else if (ty >= 68 && ty <= 82 && tx >= 48 && tx <= 66) {
          surface = 'dirt';
        }
      }
      sound.footstep(surface);

      // Facing
      if (Math.abs(vx) > Math.abs(vy)) {
        this.facing = vx > 0 ? 'right' : 'left';
        this.player.setFlipX(vx < 0);
      } else {
        this.facing = vy > 0 ? 'down' : 'up';
      }
    }

    // 2. Proximity Check (< 44px)
    this.updateProximityLabel();

    // 3. Subsystem Updates
    this.wildlifeManager.update(delta, this.player.x, this.player.y);
    this.livingWorldManager.update(delta);
    this.companionManager.update(this.player, this.targets, delta);
    this.atmosphereManager.update(delta, this.cameras.main.scrollX, this.cameras.main.scrollY);
    this.ambientSpeechManager.update(this.player.x, this.player.y, delta);
    this.updateQuestCompass();

    // 4. Chapter Change Banner
    if (gameState.chapter !== this.lastBannerChapter) {
      this.lastBannerChapter = gameState.chapter;
      const curCh = REFORMATION_CHAPTERS.find((c) => c.number === gameState.chapter);
      if (curCh) {
        this.chapterBanner.show({
          chapterNumber: curCh.number,
          title: curCh.title,
          subtitle: `${curCh.year} · ${curCh.location}`,
        });
        this.atmosphereManager.setChapterMood(curCh.number);
        sound.startBGM(curCh.number);
      }
    }

    // 5. Input Check for [E] / Space
    const justPressedE =
      (this.wasd?.E && Phaser.Input.Keyboard.JustDown(this.wasd.E)) ||
      (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey)) ||
      tc?.actionPressed;

    if (justPressedE && this.activeTarget) {
      if (tc) tc.actionPressed = false;
      this.triggerInteraction();
    }
  }

  private updateProximityLabel(): void {
    if (!this.labelDiv) return;

    let closest: InteractiveTarget | null = null;
    let minDist = 44; // Strikte Single-Proximity Grenze (< 44px)

    for (const t of this.targets) {
      if (t.minChapter > gameState.chapter) continue;

      // Filter targets strictly by outdoor/indoor room context
      const targetIsIndoor = t.x >= 96 * 16;
      if (this.currentRoom) {
        if (!targetIsIndoor) continue;
        if (
          t.x < this.currentRoom.x ||
          t.x > this.currentRoom.x + this.currentRoom.w ||
          t.y < this.currentRoom.y ||
          t.y > this.currentRoom.y + this.currentRoom.h
        ) {
          continue;
        }
      } else {
        if (targetIsIndoor) continue;
      }

      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, t.x, t.y);
      if (dist < minDist) {
        minDist = dist;
        closest = t;
      }
    }

    this.activeTarget = closest;

    if (closest) {
      const cam = this.cameras.main;
      const screenX = (closest.x - cam.scrollX) * cam.zoom + cam.width / 2;
      const screenY = (closest.y - cam.scrollY) * cam.zoom + cam.height / 2 - 28;

      this.labelDiv.innerHTML = `<strong>${closest.name}</strong><br/><span style="font-size:10px; color:#fbbf24;">${closest.actionTip || '[E] Interagieren'}</span>`;
      this.labelDiv.style.left = `${screenX}px`;
      this.labelDiv.style.top = `${screenY}px`;
      this.labelDiv.style.display = 'block';
    } else {
      this.labelDiv.style.display = 'none';
    }
  }

  private triggerInteraction(): void {
    if (!this.activeTarget) return;
    const t = this.activeTarget;
    sound.click();

    const uiScene = this.scene.get('UIScene') as any;
    if (!uiScene) return;

    if (t.kind === 'mentor') {
      const curCh = REFORMATION_CHAPTERS.find((c) => c.number === gameState.chapter);
      if (curCh) {
        this.focusOnDialog(t.x, t.y);
        uiScene.openMentorDialog(curCh.mentor, () => this.resetDialogFocus());
        gameState.completeObjective(curCh.number, 0);
      }
    } else if (t.kind === 'relic' && t.relic) {
      uiScene.openRelicModal(t.relic);
    } else if (t.kind === 'station' && t.stationId) {
      uiScene.openStationModal(t.stationId);
    } else if (t.kind === 'door') {
      if (t.id.includes('cranach')) {
        this.enterInterior('cranach_werkstatt_druckerei');
      } else if (t.id.includes('wartburg')) {
        this.enterInterior('wartburg_stube');
      } else if (t.id.includes('worms')) {
        this.enterInterior('lutherstube_wittenberg');
      } else if (t.warpTarget) {
        this.warpTo(t.warpTarget);
      } else {
        this.enterInterior('lutherstube_wittenberg');
      }
    } else if (t.kind === 'resource' && t.nodeDef) {
      gameState.addItem(t.nodeDef.lootItem as ReformationItemId, t.nodeDef.lootCount);
      uiScene.showToast(`+${t.nodeDef.lootCount} ${t.nodeDef.name} gesammelt!`);
      sound.questStep();
    }
  }

  public focusOnDialog(targetX: number, targetY: number): void {
    const cam = this.cameras.main;
    this.tweens.add({
      targets: cam,
      zoom: 1.32,
      duration: 450,
      ease: 'Cubic.easeInOut',
    });
  }

  public resetDialogFocus(): void {
    const cam = this.cameras.main;
    this.tweens.add({
      targets: cam,
      zoom: 1.0,
      duration: 400,
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

    // Stufen-Logik:
    if (!objectives[0]) {
      // Stufe 0: Sprich mit Mentor
      targetX = curCh.mentor.x;
      targetY = curCh.mentor.y;
      targetName = curCh.mentor.name;
    } else if (!objectives[1]) {
      // Stufe 1: Zweites Ziel (z. B. Tür, Markt, Ablasskasten)
      const interTarget = this.targets.find(
        (t) => (t.kind === 'door' || t.kind === 'resource') && t.minChapter <= curCh.number
      );
      if (interTarget) {
        targetX = interTarget.x;
        targetY = interTarget.y;
        targetName = interTarget.name;
      }
    } else if (!objectives[2] && curCh.stationId) {
      // Stufe 2: Didaktische Station
      const st = this.targets.find((t) => t.stationId === curCh.stationId);
      if (st) {
        targetX = st.x;
        targetY = st.y;
        targetName = st.name;
      }
    } else if (!objectives[3] && curCh.relicId) {
      // Stufe 3: Primärquelle / Relikt
      const r = this.targets.find((t) => t.relic?.id === curCh.relicId);
      if (r) {
        targetX = r.x;
        targetY = r.y;
        targetName = r.name;
      }
    } else if (objectives.every(Boolean)) {
      gameState.compassText = '🎉 Kapitel-Aufgaben gelöst! Nächstes Kapitel bereit.';
      const el = document.getElementById('hud-compass');
      if (el) el.innerHTML = `<strong>🧭 Status:</strong> <span style="color:#34d399;">Kapitel ${curCh.number} vollständig gemeistert!</span>`;
      return;
    }

    // Smart Cross-Submap Door Routing:
    if (!this.currentRoom && targetX >= 96 * 16) {
      // Player is outdoors, but target is inside an interior room
      const targetRoom = ROOMS.find(
        (r) => targetX >= r.x && targetX <= r.x + r.w && targetY >= r.y && targetY <= r.y + r.h
      );
      if (targetRoom) {
        targetX = targetRoom.outdoorDoor.x;
        targetY = targetRoom.outdoorDoor.y;
        targetName = `Eingang: ${targetRoom.name}`;
      }
    } else if (this.currentRoom && targetX < 96 * 16) {
      // Player is indoors, but target is outdoors
      targetX = this.currentRoom.exit.x;
      targetY = this.currentRoom.exit.y;
      targetName = 'Ausgang nach draußen';
    } else if (this.currentRoom && targetX >= 96 * 16) {
      // Target is indoors - check if in different room
      const targetRoom = ROOMS.find(
        (r) => targetX >= r.x && targetX <= r.x + r.w && targetY >= r.y && targetY <= r.y + r.h
      );
      if (targetRoom && targetRoom.id !== this.currentRoom.id) {
        targetX = this.currentRoom.exit.x;
        targetY = this.currentRoom.exit.y;
        targetName = 'Ausgang nach draußen';
      }
    }

    const dx = targetX - this.player.x;
    const dy = targetY - this.player.y;
    const distPx = Math.hypot(dx, dy);
    const meters = Math.max(2, Math.round(distPx / 8));
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

    let compassMsg = '';
    if (distPx <= 36) {
      compassMsg = `📍 Ziel direkt vor dir: <strong>${targetName}</strong> <span style="color:#fbbf24;">(Drücke [E])</span>`;
    } else {
      compassMsg = `🧭 <strong>${targetName}:</strong> <span style="color:#ffd86b;">${dirStr}</span> (${meters} m)`;
    }

    gameState.compassText = compassMsg;
    const el = document.getElementById('hud-compass');
    if (el) {
      el.innerHTML = compassMsg;
    }
  }

  public warpTo(target: { x: number; y: number; isIndoor: boolean; name: string; roomId?: string }): void {
    sound.door();
    const cam = this.cameras.main;
    cam.fadeOut(160, 0, 0, 0);

    cam.once('camerafadeoutcomplete', () => {
      this.player.x = target.x;
      this.player.y = target.y;
      this.player.setDepth(this.player.y);
      gameState.playerX = target.x;
      gameState.playerY = target.y;

      if (target.isIndoor) {
        const room =
          ROOMS.find((r) => r.id === target.roomId) ||
          ROOMS.find(
            (r) => target.x >= r.x && target.x <= r.x + r.w && target.y >= r.y && target.y <= r.y + r.h
          );
        if (room) {
          this.currentRoom = room;
          cam.stopFollow();
          const fitZoom = Math.max(cam.width / room.w, cam.height / room.h);
          cam.setZoom(fitZoom);
          cam.centerOn(room.x + room.w / 2, room.y + room.h / 2);
          cam.setBounds(room.x, room.y, room.w, room.h);
        }
      } else {
        this.currentRoom = null;
        cam.setBounds(0, 0, 96 * 16, 88 * 16);
        cam.setZoom(1.0);
        cam.startFollow(this.player, true, 0.1, 0.1);
      }

      sound.setIndoorAcoustics(target.isIndoor);
      cam.fadeIn(180, 0, 0, 0);

      const uiScene = this.scene.get('UIScene') as any;
      if (uiScene) {
        uiScene.showToast(`🚪 ${target.name}`);
      }
    });
  }

  public buildPlateauCliffs(): void {
    const stairCols = [32, 68];
    for (const sx of stairCols) {
      if (this.textures.get('world_atlas')?.has('stairs_stone')) {
        this.add
          .image(sx * 16, 13 * 16, 'world_atlas', 'stairs_stone')
          .setScale(0.75)
          .setDepth(4);
      }
    }
    if (this.textures.exists('cliffs_nature')) {
      for (let tx = 6; tx < 94; tx += 4) {
        if (tx >= 30 && tx <= 34) continue;
        if (tx >= 66 && tx <= 70) continue;
        if (tx >= 11 && tx <= 19) continue;
        this.add.image(tx * 16, 12 * 16, 'cliffs_nature').setDepth(3);
      }
    }
  }

  public enterInterior(roomId: string = 'lutherstube_wittenberg'): void {
    sound.door();
    this.scene.pause('WorldScene');
    this.scene.launch('InteriorScene', {
      roomId,
      returnX: this.player.x,
      returnY: this.player.y + 16,
    });
  }
}
