import Phaser from 'phaser';

export interface AmbientSpeaker {
  id: string;
  name: string;
  role: string;
  spriteKey: 'npc_citizen_m' | 'npc_citizen_f';
  x: number;
  y: number;
  quotes: string[];
}

export const REFORMATION_CITIZENS: AmbientSpeaker[] = [
  {
    id: 'buerger_wittenberg',
    name: 'Heinrich (Kürschner)',
    role: 'Wittenberger Bürger',
    spriteKey: 'npc_citizen_m',
    x: 17 * 16,
    y: 28 * 16,
    quotes: [
      '„Hast du die 95 Thesen an der Kirche gelesen? Der Mönch spricht aus, was alle denken!“',
      '„Drei Gulden für einen Ablassbrief – mein Geselle verdient das im ganzen Monat nicht.“',
    ],
  },
  {
    id: 'student_wittenberg',
    name: 'Nikolaus (Magisterstudent)',
    role: 'Student an der Leucorea',
    spriteKey: 'npc_citizen_m',
    x: 31 * 16,
    y: 25 * 16,
    quotes: [
      '„Meister Melanchthon lehrt uns Griechisch – ad fontes, zurück zu den Quellen!“',
      '„Gestern kam die neue Flugschrift frisch aus Cranachs Druckerpresse!“',
    ],
  },
  {
    id: 'ablass_pilger',
    name: 'Margarethe (Pilgerin)',
    role: 'Bäuerin aus Bitterfeld',
    spriteKey: 'npc_citizen_f',
    x: 68 * 16,
    y: 44 * 16,
    quotes: [
      '„Tetzel predigt mit donnernder Stimme. Wenn das Geld im Kasten klingt...!“',
      '„Ich habe meine letzte Henne verkauft, um der armen Großmutter im Fegefeuer zu helfen.“',
    ],
  },
  {
    id: 'fuhrmann_augsburg',
    name: 'Kilian (Kaufmannsknecht)',
    role: 'Fugger-Fuhrknecht',
    spriteKey: 'npc_citizen_m',
    x: 66 * 16,
    y: 25 * 16,
    quotes: [
      '„Kardinal Cajetan verlangt das einfache Bekenntnis: Revoco – ich widerrufe!“',
      '„Golddukaten aus Venedig rollen ins Fugger-Kontor. Geld regiert die Welt.“',
    ],
  },
  {
    id: 'landsknecht_worms',
    name: 'Veit (Kaiserlicher Wächter)',
    role: 'Hellebardier des Kaisers',
    spriteKey: 'npc_guard' as any,
    x: 77 * 16,
    y: 25 * 16,
    quotes: [
      '„Ganz Worms steht kopf! Der Kaiser gewährt Luther freies Geleit.“',
      '„Der Mönch weicht keinen Schritt zurück. Sein Gewissen sei in Gottes Wort gefangen.“',
    ],
  },
  {
    id: 'burgwaechter_wartburg',
    name: 'Kunz (Burgknecht)',
    role: 'Torwächter der Wartburg',
    spriteKey: 'npc_citizen_m',
    x: 24 * 16,
    y: 78 * 16,
    quotes: [
      '„Unser Gast Junker Jörg sitzt Tag und Nacht am Schreibtisch. Die Feder kratzt unaufhörlich.“',
      '„Er übersetzt das Heilige Buch ins Deutsche – jedes Kind soll es verstehen können!“',
    ],
  },
  {
    id: 'baeuerin_frankenhausen',
    name: 'Elsbeth (Landarbeiterin)',
    role: 'Aufständische Bauersfrau',
    spriteKey: 'npc_citizen_f',
    x: 62 * 16,
    y: 77 * 16,
    quotes: [
      '„Die Zwölf Artikel fordern nur Gottes Recht: Keine Frondienste ohne Entlohnung!“',
      '„Warum soll das Wild im Wald den Edelleuten allein gehören? Gott schuf es für alle!“',
    ],
  },
  {
    id: 'ratsherr_augsburg',
    name: 'Hieronymus (Ratsherr)',
    role: 'Gesandter zu Augsburg 1555',
    spriteKey: 'npc_citizen_m',
    x: 75 * 16,
    y: 79 * 16,
    quotes: [
      '„Frieden nach vierzig Jahren Zwietracht! Cuius regio, eius religio soll das Reich einen.“',
      '„Wer seinem Glauben treu bleiben will, darf friedlich mit Hab und Gut auswandern.“',
    ],
  },
];

export class AmbientSpeechManager {
  private scene: Phaser.Scene;
  private container: HTMLElement;
  private activeBubble: HTMLElement | null = null;
  private activeSpeakerId: string | null = null;
  private activeSpeakerPos: { x: number; y: number } | null = null;
  private cooldowns: Record<string, number> = {};
  private citizenSprites: { sp: AmbientSpeaker; sprite: Phaser.GameObjects.Sprite }[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const existing = document.getElementById('ambient-speech-layer');
    if (existing) {
      this.container = existing;
    } else {
      this.container = document.createElement('div');
      this.container.id = 'ambient-speech-layer';
      document.body.appendChild(this.container);
    }
  }

  public spawnCitizens(scene: Phaser.Scene): Phaser.GameObjects.Sprite[] {
    const out: Phaser.GameObjects.Sprite[] = [];
    for (const c of REFORMATION_CITIZENS) {
      const key = scene.textures.exists(c.spriteKey) ? c.spriteKey : 'npc_citizen_m';
      if (!scene.textures.exists(key)) continue;
      const sprite = scene.add.sprite(c.x, c.y, key, 0).setOrigin(0.5, 0.9).setDepth(c.y);
      if (scene.anims.exists(`${key}-idle-down`)) {
        sprite.play(`${key}-idle-down`);
      }
      this.citizenSprites.push({ sp: c, sprite });
      out.push(sprite);
    }
    return out;
  }

  public update(playerX: number, playerY: number, deltaMs: number): void {
    const isModalOpen = Boolean((window as any).__isModalOpen?.());
    if (isModalOpen) {
      if (this.activeBubble) this.dismissBubble(true);
      return;
    }

    for (const id in this.cooldowns) {
      if (this.cooldowns[id] > 0) this.cooldowns[id] -= deltaMs;
    }

    // Face player when nearby & trigger speech
    let closest: AmbientSpeaker | null = null;
    let minDist = 64;

    for (const item of this.citizenSprites) {
      const d = Math.hypot(item.sp.x - playerX, item.sp.y - playerY);
      if (d < 52) {
        const dx = playerX - item.sp.x;
        const dy = playerY - item.sp.y;
        const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
        const key = item.sprite.texture.key;
        const idleKey = `${key}-idle-${dir}`;
        if (this.scene.anims.exists(idleKey) && item.sprite.anims.currentAnim?.key !== idleKey) {
          item.sprite.play(idleKey);
        }
      }
    }

    for (const sp of REFORMATION_CITIZENS) {
      const dist = Math.hypot(sp.x - playerX, sp.y - playerY);
      if (dist < minDist) {
        minDist = dist;
        closest = sp;
      }
    }

    if (closest) {
      if (this.activeSpeakerId !== closest.id && (!this.cooldowns[closest.id] || this.cooldowns[closest.id] <= 0)) {
        this.showBubble(closest);
      }
    }

    if (this.activeBubble && this.activeSpeakerPos) {
      const activeDist = Math.hypot(this.activeSpeakerPos.x - playerX, this.activeSpeakerPos.y - playerY);
      if (activeDist > 115) {
        this.dismissBubble(true);
      } else {
        this.positionBubble(this.activeBubble, this.activeSpeakerPos.x, this.activeSpeakerPos.y);
      }
    }
  }

  private positionBubble(bubble: HTMLElement, worldX: number, worldY: number): void {
    const canvas = this.scene.game.canvas;
    const rect = canvas.getBoundingClientRect();
    const cam = this.scene.cameras.main;
    const sx = rect.left + ((worldX - cam.worldView.x) / cam.worldView.width) * rect.width;
    const sy = rect.top + ((worldY - 38 - cam.worldView.y) / cam.worldView.height) * rect.height;

    const left = Math.max(rect.left + 8, Math.min(rect.right - 250, sx - 120));
    const top = Math.max(rect.top + 48, Math.min(rect.bottom - 76, sy - 42));
    bubble.style.left = `${Math.round(left)}px`;
    bubble.style.top = `${Math.round(top)}px`;
  }

  private showBubble(speaker: AmbientSpeaker): void {
    this.dismissBubble(true);
    this.activeSpeakerId = speaker.id;
    this.activeSpeakerPos = { x: speaker.x, y: speaker.y };
    this.cooldowns[speaker.id] = 12000;

    const quote = speaker.quotes[Math.floor(Math.random() * speaker.quotes.length)];
    const bubble = document.createElement('div');
    bubble.className = 'ambient-bubble';
    bubble.innerHTML = `
      <div class="ambient-bubble-speaker">${speaker.name} · <span>${speaker.role}</span></div>
      <div class="ambient-bubble-quote">${quote}</div>
    `;

    this.container.appendChild(bubble);
    this.activeBubble = bubble;
    this.positionBubble(bubble, speaker.x, speaker.y);

    requestAnimationFrame(() => {
      bubble.classList.add('visible');
    });

    setTimeout(() => {
      if (this.activeBubble === bubble) {
        this.dismissBubble(false);
      }
    }, 3800);
  }

  public dismissBubble(immediate = false): void {
    if (!this.activeBubble) return;
    const b = this.activeBubble;
    this.activeBubble = null;
    this.activeSpeakerId = null;
    this.activeSpeakerPos = null;

    if (immediate) {
      b.remove();
    } else {
      b.classList.remove('visible');
      setTimeout(() => b.remove(), 350);
    }
  }
}
