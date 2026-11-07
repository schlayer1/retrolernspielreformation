import Phaser from 'phaser';
import { gameState } from '../systems/GameState';
import { sound } from '../audio/sound';
import { STATIONS } from '../data/stations';
import { REFORMATION_RELICS } from '../data/relics';

export type InteriorRoomId =
  | 'lutherstube_wittenberg'
  | 'cranach_werkstatt_druckerei'
  | 'wartburg_stube'
  | 'schlosskirche_portal';

export interface InteriorInitData {
  buildingId?: InteriorRoomId;
  roomId?: InteriorRoomId;
  buildingName?: string;
  title?: string;
  subtitle?: string;
  mentorId?: string;
  mentorName?: string;
  returnX: number;
  returnY: number;
}

interface Hotspot {
  id: string;
  x: number;
  y: number;
  label: string;
  speaker: string;
  text: string;
  action?: () => void;
}

export class InteriorScene extends Phaser.Scene {
  private initData!: InteriorInitData;
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    E: Phaser.Input.Keyboard.Key;
    ESC: Phaser.Input.Keyboard.Key;
  };
  private hotspots: Hotspot[] = [];
  private exitMat!: { x: number; y: number; w: number; h: number };
  private isExiting = false;
  private stepCooldown = 0;
  private domOverlay?: HTMLDivElement;

  constructor() {
    super({ key: 'InteriorScene' });
  }

  public init(data: InteriorInitData): void {
    const bId = (data?.roomId || data?.buildingId || 'lutherstube_wittenberg') as InteriorRoomId;
    this.initData = {
      buildingId: bId,
      roomId: bId,
      title: data?.title || this.getRoomTitle(bId),
      subtitle: data?.subtitle || 'Wittenberg & Thüringen (1517–1555) · Epochen der Reformation',
      returnX: data?.returnX ?? 24 * 16,
      returnY: data?.returnY ?? 24 * 16,
    };
    this.hotspots = [];
    this.isExiting = false;
  }

  public create(): void {
    const ROOM_W = 352;
    const ROOM_H = 208;
    const CX = 240;
    const CY = 140;
    const LEFT = CX - ROOM_W / 2;
    const TOP = CY - ROOM_H / 2;

    this.cameras.main.setBackgroundColor('#100b07');

    document.getElementById('interior-dom-overlay')?.remove();
    const overlay = document.createElement('div');
    overlay.id = 'interior-dom-overlay';
    overlay.style.cssText =
      'position:fixed;inset:0;pointer-events:none;z-index:25;font-family:system-ui,sans-serif;';
    document.body.appendChild(overlay);
    this.domOverlay = overlay;

    const addDomTag = (
      rx: number,
      ry: number,
      text: string,
      bg = 'rgba(28,18,10,0.92)',
      border = '#b45309',
      color = '#fef08a'
    ) => {
      const el = document.createElement('div');
      const pctX = (rx / 480) * 100;
      const pctY = (ry / 270) * 100;
      el.style.cssText = `
        position:absolute;left:${pctX}%;top:${pctY}%;transform:translate(-50%,-100%);
        background:${bg};border:1.5px solid ${border};color:${color};
        padding:2px 7px;border-radius:4px;font-size:10px;font-weight:700;
        letter-spacing:0.3px;box-shadow:0 2px 6px rgba(0,0,0,0.7);white-space:nowrap;
      `;
      el.textContent = text;
      this.domOverlay?.appendChild(el);
      return el;
    };

    // Header banner
    const hdr = document.createElement('div');
    hdr.style.cssText = `
      position:absolute;top:10px;left:50%;transform:translateX(-50%);
      background:rgba(20,12,7,0.92);border:2px solid #b45309;
      color:#fef08a;padding:4px 14px;border-radius:6px;
      font-size:11px;font-weight:700;letter-spacing:0.5px;
      box-shadow:0 4px 12px rgba(0,0,0,0.8);text-align:center;pointer-events:auto;
    `;
    hdr.innerHTML = `🏰 <strong>${this.initData.title}</strong> · <span style="color:#fbbf24">${this.initData.subtitle}</span>`;
    this.domOverlay.appendChild(hdr);

    // Floor & Wall rendering
    const floorG = this.add.graphics();
    floorG.fillStyle(0x3a2416, 1);
    floorG.fillRect(LEFT, TOP + 32, ROOM_W, ROOM_H - 32);

    // Planks
    floorG.lineStyle(1, 0x24150c, 0.45);
    for (let py = TOP + 48; py < TOP + ROOM_H; py += 16) {
      floorG.beginPath();
      floorG.moveTo(LEFT, py);
      floorG.lineTo(LEFT + ROOM_W, py);
      floorG.strokePath();
    }

    // Walls
    floorG.fillStyle(0x1a120c, 1);
    floorG.fillRect(LEFT, TOP, ROOM_W, 36);
    floorG.lineStyle(2, 0xb45309, 0.85);
    floorG.strokeRect(LEFT, TOP, ROOM_W, ROOM_H);

    // Carpet
    floorG.fillStyle(0x78350f, 0.85);
    floorG.fillRect(CX - 56, CY - 24, 112, 70);
    floorG.lineStyle(1, 0xfbbf24, 0.8);
    floorG.strokeRect(CX - 56, CY - 24, 112, 70);

    // Exit mat
    this.exitMat = { x: CX, y: TOP + ROOM_H - 12, w: 44, h: 18 };
    floorG.fillStyle(0x991b1b, 0.95);
    floorG.fillRect(this.exitMat.x - 22, this.exitMat.y - 9, this.exitMat.w, this.exitMat.h);
    floorG.lineStyle(1.5, 0xfbbf24, 1);
    floorG.strokeRect(this.exitMat.x - 22, this.exitMat.y - 9, this.exitMat.w, this.exitMat.h);

    addDomTag(this.exitMat.x, this.exitMat.y - 12, '🚪 Zurück nach Wittenberg [E]');

    // Room-specific props & hotspots
    const rId = this.initData.roomId;
    if (rId === 'lutherstube_wittenberg') {
      this.buildLutherstube(LEFT, TOP, CX, CY, addDomTag);
    } else if (rId === 'cranach_werkstatt_druckerei') {
      this.buildCranachDruckerei(LEFT, TOP, CX, CY, addDomTag);
    } else if (rId === 'wartburg_stube') {
      this.buildWartburgStube(LEFT, TOP, CX, CY, addDomTag);
    } else {
      this.buildSchlosskirche(LEFT, TOP, CX, CY, addDomTag);
    }

    // Player (16x32 native sprite at scale 1.0 - Steinzeit benchmark)
    const charKey = gameState.gender === 'female' && this.textures.exists('character_female') ? 'character_female' : 'character';
    this.player = this.physics.add.sprite(CX, TOP + ROOM_H - 36, charKey, 0);
    this.player.setScale(1.0);
    this.player.setOrigin(0.5, 0.85);
    this.player.setDepth(20);
    this.player.setCollideWorldBounds(true);
    if (this.player.body) {
      this.player.body.setSize(10, 8);
      this.player.body.setOffset(3, 22);
    }

    // Input
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        E: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
        ESC: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
      };
    }
  }

  private buildLutherstube(LEFT: number, TOP: number, CX: number, CY: number, addDomTag: any): void {
    addDomTag(CX - 80, TOP + 52, '🔥 Kamin der Stube');
    addDomTag(CX + 80, TOP + 52, '📖 Luthers Schreibtisch');
    addDomTag(CX, CY - 10, '👤 Dr. Martin Luther [E]');

    this.hotspots.push({
      id: 'luther_mentor',
      x: CX,
      y: CY,
      label: 'Dr. Martin Luther',
      speaker: 'Dr. Martin Luther',
      text: 'Gnade und Friede mit dir, junger Lucas! In dieser Stube im Augustinerkloster ringe ich mit den Worten der Schrift. Gott schenkt seine Gnade umsonst – Sola Gratia!',
    });
  }

  private buildCranachDruckerei(LEFT: number, TOP: number, CX: number, CY: number, addDomTag: any): void {
    addDomTag(CX - 80, TOP + 52, '🖨️ Druckerpresse & Letternkasten');
    addDomTag(CX + 80, TOP + 52, '🎨 Cranach-Holzschnitt-Atelier');
    addDomTag(CX, CY - 10, '👤 Meister Lucas Cranach [E]');

    this.hotspots.push({
      id: 'cranach_mentor',
      x: CX,
      y: CY,
      label: 'Lucas Cranach d. Ä.',
      speaker: 'Lucas Cranach d. Ä.',
      text: 'Willkommen in der Druckerwerkstatt! Mit Bleilettern, Ölfarben und der hölzernen Hebelpresse bringen wir Luthers Thesen und deutsche Flugschriften in tausende Hände!',
    });
  }

  private buildWartburgStube(LEFT: number, TOP: number, CX: number, CY: number, addDomTag: any): void {
    addDomTag(CX - 80, TOP + 52, '🏰 Thüringer Burgfenster');
    addDomTag(CX + 80, TOP + 52, '📜 Schreibpult des Neuen Testaments');
    addDomTag(CX, CY - 10, '👤 Junker Jörg (Luther) [E]');

    this.hotspots.push({
      id: 'joerg_mentor',
      x: CX,
      y: CY,
      label: 'Junker Jörg',
      speaker: 'Junker Jörg',
      text: 'Hier oben auf der Veste Wartburg bin ich in Sicherheit vor kaiserlicher Acht. In nur elf Wochen habe ich das griechische Neue Testament ins Deutsche übertragen!',
    });
  }

  private buildSchlosskirche(LEFT: number, TOP: number, CX: number, CY: number, addDomTag: any): void {
    addDomTag(CX - 80, TOP + 52, '🚪 Wittenberger Thesenportal');
    addDomTag(CX + 80, TOP + 52, '✝️ Altarraum & Kanzel');
    addDomTag(CX, CY - 10, '👤 Philipp Melanchthon [E]');

    this.hotspots.push({
      id: 'melanchthon_mentor',
      x: CX,
      y: CY,
      label: 'Philipp Melanchthon',
      speaker: 'Philipp Melanchthon',
      text: 'Salve, amice! An den Türen dieser Schlosskirche wurden die 95 Thesen angeschlagen. Wissenschaft und Glaubensfreiheit müssen Hand in Hand gehen.',
    });
  }

  public update(time: number, delta: number): void {
    if (this.isExiting) return;

    // Movement
    let vx = 0;
    let vy = 0;
    const speed = 110;

    if (this.cursors.left?.isDown || this.wasd.A?.isDown) vx -= speed;
    if (this.cursors.right?.isDown || this.wasd.D?.isDown) vx += speed;
    if (this.cursors.up?.isDown || this.wasd.W?.isDown) vy -= speed;
    if (this.cursors.down?.isDown || this.wasd.S?.isDown) vy += speed;

    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    this.player.setVelocity(vx, vy);

    const g = gameState.gender;
    if (vx !== 0 || vy !== 0) {
      this.stepCooldown -= delta;
      if (this.stepCooldown <= 0) {
        sound.playFootstep('wood');
        this.stepCooldown = 320;
      }
      const facing = Math.abs(vx) > Math.abs(vy) ? (vx > 0 ? 'right' : 'left') : vy > 0 ? 'down' : 'up';
      const walkKey = this.anims.exists(`walk-${g}-${facing}`) ? `walk-${g}-${facing}` : `walk-${facing}`;
      this.player.play(walkKey, true);
    } else {
      const idleKey = this.anims.exists(`idle-${g}-down`) ? `idle-${g}-down` : 'idle-down';
      this.player.play(idleKey, true);
    }

    // Check interaction [E]
    if (Phaser.Input.Keyboard.JustDown(this.wasd.E)) {
      const px = this.player.x;
      const py = this.player.y;

      // Check exit mat
      const dExit = Phaser.Math.Distance.Between(px, py, this.exitMat.x, this.exitMat.y);
      if (dExit < 30) {
        this.exitToOverworld();
        return;
      }

      // Check hotspots
      for (const h of this.hotspots) {
        const d = Phaser.Math.Distance.Between(px, py, h.x, h.y);
        if (d < 40) {
          sound.playClick();
          const win = window as any;
          if (win.__showToast) {
            win.__showToast(`💬 ${h.speaker}: "${h.text}"`);
          }
          if (h.action) h.action();
          return;
        }
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.wasd.ESC)) {
      this.exitToOverworld();
    }
  }

  public exitToOverworld(): void {
    if (this.isExiting) return;
    this.isExiting = true;
    sound.door();
    document.getElementById('interior-dom-overlay')?.remove();

    this.cameras.main.fade(300, 0, 0, 0, false, (cam: any, progress: number) => {
      if (progress === 1) {
        this.scene.stop('InteriorScene');
        this.scene.resume('WorldScene', {
          returnX: this.initData.returnX,
          returnY: this.initData.returnY,
        });
      }
    });
  }

  private getRoomTitle(id: InteriorRoomId): string {
    switch (id) {
      case 'lutherstube_wittenberg':
        return 'Lutherstube im Schwarzen Kloster';
      case 'cranach_werkstatt_druckerei':
        return 'Werkstatt von Lucas Cranach d. Ä.';
      case 'wartburg_stube':
        return 'Junker Jörgs Studierstube (Wartburg)';
      case 'schlosskirche_portal':
        return 'Schlosskirche zu Wittenberg';
    }
  }
}
