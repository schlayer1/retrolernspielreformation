import Phaser from 'phaser';

export interface AmbientSpeaker {
  id: string;
  name: string;
  role: string;
  x: number;
  y: number;
  quotes: string[];
}

export const REFORMATION_CITIZENS: AmbientSpeaker[] = [
  {
    id: 'buerger_wittenberg',
    name: 'Heinrich (Kürschner)',
    role: 'Wittenberger Bürger',
    x: 24 * 16,
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
    x: 32 * 16,
    y: 24 * 16,
    quotes: [
      '„Meister Melanchthon lehrt uns Griechisch – ad fontes, zurück zu den Quellen!“',
      '„Gestern kam die neue Flugschrift frisch aus Cranachs Druckerpresse!“',
    ],
  },
  {
    id: 'ablass_pilger',
    name: 'Margarethe (Pilgerin)',
    role: 'Bäuerin aus Bitterfeld',
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
    x: 66 * 16,
    y: 18 * 16,
    quotes: [
      '„Kardinal Cajetan verlangt das einfache Bekenntnis: Revoco – ich widerrufe!“',
      '„Golddukaten aus Venedig rollen ins Fugger-Kontor. Geld regiert die Welt.“',
    ],
  },
  {
    id: 'landsknecht_worms',
    name: 'Veit (Kaiserlicher Wächter)',
    role: 'Hellebardier des Kaisers',
    x: 78 * 16,
    y: 18 * 16,
    quotes: [
      '„Ganz Worms steht kopf! Der Kaiser gewährt Luther freies Geleit.“',
      '„Der Mönch weicht keinen Schritt zurück. Sein Gewissen sei in Gottes Wort gefangen.“',
    ],
  },
  {
    id: 'burgwaechter_wartburg',
    name: 'Kunz (Burgknecht)',
    role: 'Torwächter der Wartburg',
    x: 24 * 16,
    y: 76 * 16,
    quotes: [
      '„Unser Gast Junker Jörg sitzt Tag und Nacht am Schreibtisch. Die Feder kratzt unaufhörlich.“',
      '„Er übersetzt das Heilige Buch ins Deutsche – jedes Kind soll es verstehen können!“',
    ],
  },
  {
    id: 'baeuerin_frankenhausen',
    name: 'Elsbeth (Landarbeiterin)',
    role: 'Aufständische Bauersfrau',
    x: 58 * 16,
    y: 74 * 16,
    quotes: [
      '„Die Zwölf Artikel fordern nur Gottes Recht: Keine Frondienste ohne Entlohnung!“',
      '„Warum soll das Wild im Wald den Edelleuten allein gehören? Gott schuf es für alle!“',
    ],
  },
  {
    id: 'ratsherr_augsburg',
    name: 'Hieronymus (Ratsherr)',
    role: 'Gesandter zu Augsburg 1555',
    x: 76 * 16,
    y: 74 * 16,
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
  private cooldowns: Record<string, number> = {};

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    let existing = document.getElementById('ambient-speech-layer');
    if (existing) {
      this.container = existing;
    } else {
      this.container = document.createElement('div');
      this.container.id = 'ambient-speech-layer';
      this.container.style.position = 'fixed';
      this.container.style.top = '0';
      this.container.style.left = '0';
      this.container.style.width = '100vw';
      this.container.style.height = '100vh';
      this.container.style.pointerEvents = 'none';
      this.container.style.zIndex = '5'; // Strict Z-Index 5 under HUD
      document.body.appendChild(this.container);
    }
  }

  public update(playerX: number, playerY: number, deltaMs: number): void {
    // Tick cooldowns
    for (const id in this.cooldowns) {
      if (this.cooldowns[id] > 0) this.cooldowns[id] -= deltaMs;
    }

    // Check proximity (< 65px)
    let closest: AmbientSpeaker | null = null;
    let minDist = 65;

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
  }

  private showBubble(speaker: AmbientSpeaker): void {
    this.dismissBubble(true);
    this.activeSpeakerId = speaker.id;
    this.cooldowns[speaker.id] = 12000; // 12s cooldown

    const quote = speaker.quotes[Math.floor(Math.random() * speaker.quotes.length)];

    const bubble = document.createElement('div');
    bubble.className = 'ambient-speech-bubble';
    bubble.innerHTML = `
      <div style="font-size: 10px; color: #fbbf24; font-weight: bold; margin-bottom: 2px;">
        🗣️ ${speaker.name} (${speaker.role})
      </div>
      <div style="font-size: 12px; color: #fdf6e3; line-height: 1.35; font-style: italic;">
        ${quote}
      </div>
    `;

    Object.assign(bubble.style, {
      position: 'absolute',
      background: 'rgba(24, 18, 30, 0.92)',
      border: '1px solid #d97706',
      borderRadius: '8px',
      padding: '8px 12px',
      maxWidth: '280px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
      transition: 'opacity 0.4s ease, transform 0.4s ease',
      opacity: '0',
      transform: 'translateY(6px)',
      pointerEvents: 'none',
    });

    this.container.appendChild(bubble);
    this.activeBubble = bubble;

    // Position bubble above speaker
    const cam = this.scene.cameras.main;
    const screenX = (speaker.x - cam.scrollX) * cam.zoom + cam.width / 2;
    const screenY = (speaker.y - cam.scrollY) * cam.zoom + cam.height / 2 - 55;
    bubble.style.left = `${Math.round(screenX - 140)}px`;
    bubble.style.top = `${Math.round(screenY)}px`;

    // Fade in
    requestAnimationFrame(() => {
      bubble.style.opacity = '1';
      bubble.style.transform = 'translateY(0)';
    });

    // Auto fade out after 3.8s
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

    if (immediate) {
      b.remove();
    } else {
      b.style.opacity = '0';
      b.style.transform = 'translateY(-6px)';
      setTimeout(() => b.remove(), 400);
    }
  }
}
