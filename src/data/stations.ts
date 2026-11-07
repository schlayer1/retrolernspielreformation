export interface StationStep {
  id: string;
  title: string;
  prompt: string;
  options: {
    text: string;
    isCorrect: boolean;
    feedback: string;
  }[];
}

export interface DidacticStation {
  id: string;
  name: string;
  chapter: number;
  location: string;
  badge: string;
  intro: string;
  historicalPillar: string;
  x: number;
  y: number;
  steps: StationStep[];
}

export const REFORMATION_STATIONS: DidacticStation[] = [
  {
    id: 'station_ablass',
    name: 'Die Tetzel-Ablasskasse & Preisprüfung',
    chapter: 1,
    location: 'Markt vor Jüterbog',
    badge: 'Finanzkritik',
    intro: 'Johann Tetzel preist mit markigen Worten den päpstlichen Ablass an. Untersuche den Eichenkasten und entlarve die Verflechtung von Seelenangst und Finanzen.',
    historicalPillar: 'Ablasskritik & Historische Urteilskompetenz',
    x: 31 * 16,
    y: 34 * 16,
    steps: [
      {
        id: 'step_1',
        title: 'Schritt 1: Wohin fließt das Geld?',
        prompt: 'Tetzel behauptet, das Geld rette Seelen aus dem Fegefeuer. Welcher weltliche Zweck steht in Wahrheit dahinter?',
        options: [
          {
            text: 'Bau von Armenhäusern und Schulen für Bauernsöhne in Wittenberg.',
            isCorrect: false,
            feedback: 'Nein, für soziale Einrichtungen vor Ort wurde kaum etwas aufgewendet.',
          },
          {
            text: 'Neubau des Petersdoms in Rom & Rückzahlung von Schulden der Erzbischöfe an das Bankhaus Fugger.',
            isCorrect: true,
            feedback: 'Richtig! Die Hälfte des Erlöses floss nach Rom, die andere an die Fugger.',
          },
          {
            text: 'Bau einer Schiffsflotte zur Entdeckung von Indien.',
            isCorrect: false,
            feedback: 'Falsch, mit Seefahrt hatte das päpstliche Ablassgeschäft nichts zu tun.',
          },
        ],
      },
      {
        id: 'step_2',
        title: 'Schritt 2: Die soziale Last',
        prompt: 'Ein Ablassbrief für schwere Sünden kostet 2 Goldgulden. Ein Tagelöhner verdient etwa 20 Pfennige pro Woche (1 Gulden = ca. 240 Pfennige). Wie lange müsste er hungern?',
        options: [
          {
            text: 'Etwa 2 bis 3 Tage.',
            isCorrect: false,
            feedback: 'Zu wenig! Rechne: 2 Gulden = 480 Pfennige. Bei 20 Pfennigen pro Woche sind das 24 Wochen!',
          },
          {
            text: 'Fast ein halbes Jahr (24 Wochen) harter Arbeit ohne jeden Abzug für Brot und Miete.',
            isCorrect: true,
            feedback: 'Exakt! Für einfache Menschen bedeutete der Ablasskauf oft den völligen Ruin der Familie.',
          },
          {
            text: 'Genau einen Nachmittag.',
            isCorrect: false,
            feedback: 'Vollkommen unrealistisch im 16. Jahrhundert.',
          },
        ],
      },
    ],
  },
  {
    id: 'station_druckerei',
    name: 'Die Cranach-Druckerpresse & Letternsatz',
    chapter: 2,
    location: 'Werkstatt Wittenberg',
    badge: 'Medienrevolution',
    intro: 'Luthers lateinische Streitschrift muss für das einfache Volk gedruckt werden. Setze die Bleilettern im Winkelhaken und bediene die Druckerpresse!',
    historicalPillar: 'Gutenberg-Technologie & Medienrevolution',
    x: 136 * 16,
    y: 21 * 16,
    steps: [
      {
        id: 'step_1',
        title: 'Schritt 1: Die Setzkasten-Regel',
        prompt: 'Wie müssen die Bleilettern in den Druckstock eingesetzt werden, damit der Druck auf dem Papier richtig herum lesbar wird?',
        options: [
          {
            text: 'Genau so, wie man den Text aufgeschrieben liest (von links nach rechts).',
            isCorrect: false,
            feedback: 'Vorsicht! Ein Stempel druckt seitenverkehrt ab!',
          },
          {
            text: 'Spiegelverkehrt und von rechts nach links auf dem Kopf.',
            isCorrect: true,
            feedback: 'Ausgezeichnet! Setzer mussten die Kunst beherrschen, spiegelverkehrte Schrift blitzschnell zu lesen.',
          },
          {
            text: 'Mit unsichtbarer Tinte und erst nach Erhitzen sichtbar.',
            isCorrect: false,
            feedback: 'Das wäre alchemistische Spielerei, keine Gutenberg-Presse.',
          },
        ],
      },
      {
        id: 'step_2',
        title: 'Schritt 2: Druckerschwärze & Pressung',
        prompt: 'Woraus bestand die haltbare Druckerschwärze, die Cranach für die Flugschriften verwendete?',
        options: [
          {
            text: 'Wasser und einfacher Ruß aus dem Kaminofen.',
            isCorrect: false,
            feedback: 'Wasserfarbe verläuft auf feuchtem Papier und verblasst sofort.',
          },
          {
            text: 'Leinölfirnis, Kienruß und Terpentinöl – eine zähflüssige Ölfarbe.',
            isCorrect: true,
            feedback: 'Richtig! Erst durch die ölbasierte Farbe hielten die Drucke jahrhundertelang.',
          },
          {
            text: 'Zerstoßene Beeren und roter Wein.',
            isCorrect: false,
            feedback: 'Das wurde manchmal zum Färben von Stoffen genutzt, nicht für Lettern.',
          },
        ],
      },
    ],
  },
  {
    id: 'station_verhoer',
    name: 'Cajetans Disputationstafel',
    chapter: 3,
    location: 'Fuggerpalast Augsburg',
    badge: 'Theologiedialog',
    intro: 'Kardinal Cajetan verlangt das eine Wort: „Revoco“ (Ich widerrufe). Ordne die Argumente, um Luthers theologische Position zu verteidigen.',
    historicalPillar: 'Sola Scriptura & Gewissensfreiheit',
    x: 126 * 16,
    y: 54 * 16,
    steps: [
      {
        id: 'step_1',
        title: 'Schritt 1: Die Autorität des Glaubens',
        prompt: 'Cajetan beruft sich auf päpstliche Bullen und Dekrete. Welcher obersten Autorität unterstellt Luther seine Lehre?',
        options: [
          {
            text: 'Der kaiserlichen Hausordnung der Habsburger.',
            isCorrect: false,
            feedback: 'Nein, der Kaiser war weltlicher Herrscher, keine theologische Instanz.',
          },
          {
            text: 'Allein der Heiligen Schrift (der Bibel) und der klaren Vernunft („Sola Scriptura“).',
            isCorrect: true,
            feedback: 'Genau! Päpste und Konzilien können irren, das Wort Gottes bleibt ewig.',
          },
          {
            text: 'Den Schriften des Aristoteles über die Naturwissenschaften.',
            isCorrect: false,
            feedback: 'Aristoteles war griechischer Philosoph der Antike.',
          },
        ],
      },
    ],
  },
  {
    id: 'station_schreibstube',
    name: 'Die Wartburg-Schreibstube („Dem Volk aufs Maul schauen“)',
    chapter: 5,
    location: 'Wartburg bei Eisenach',
    badge: 'Sprachschöpfung',
    intro: 'Als „Junker Jörg“ übersetzt Luther das griechische Neue Testament. Wähle die kraftvollen deutschen Worte, die bis heute unser Sprechen prägen!',
    historicalPillar: 'Entstehung der deutschen Schriftsprache',
    x: 174 * 16,
    y: 52 * 16,
    steps: [
      {
        id: 'step_1',
        title: 'Rätsel 1: Lukas 6, 45',
        prompt: 'Wie übersetzt Luther den griechischen Satz über die Gedanken des Menschen am treffendsten ins Deutsche?',
        options: [
          {
            text: '„Aus dem vollen Zustand der Herzkammer artikuliert das Sprechorgan.“',
            isCorrect: false,
            feedback: 'Zu hölzern und verkopft! Das versteht kein Bürger auf dem Markt.',
          },
          {
            text: '„Wes das Herz voll ist, des geht der Mund über.“',
            isCorrect: true,
            feedback: 'Meisterhaft! Dieses geflügelte Wort stammt direkt aus Luthers Wartburg-Bibel.',
          },
          {
            text: '„Wer zu viel nachdenkt, plappert unbedacht.“',
            isCorrect: false,
            feedback: 'Verfehlt den Sinn der biblischen Bildsprache.',
          },
        ],
      },
      {
        id: 'step_2',
        title: 'Rätsel 2: Matthäus 7, 6',
        prompt: 'Wie formuliert Luther die Warnung, wertvolles Gut nicht an Unwürdige zu verschwenden?',
        options: [
          {
            text: '„Man soll nicht Perlen vor die Säue werfen.“',
            isCorrect: true,
            feedback: 'Volltreffer! Ein weiteres unvergängliches deutsches Sprachbild Luthers.',
          },
          {
            text: '„Schmuckstücke gehören nicht in den Schweinestall.“',
            isCorrect: false,
            feedback: 'Klingt nüchtern und ohne die Wucht des reformatorischen Klangs.',
          },
          {
            text: '„Füttere das Vieh nur mit Schrot und Korn.“',
            isCorrect: false,
            feedback: 'Das ist Landwirtschaft, keine Übersetzung des Evangeliums.',
          },
        ],
      },
    ],
  },
  {
    id: 'station_quelleninspektor',
    name: 'Der 360° Primärquellen-Inspektor',
    chapter: 8,
    location: 'Reichskanzlei Augsburg',
    badge: 'Quellenforschung',
    intro: 'Untersuche die historischen Originaldokumente von 1517 bis 1555 mit der Lupe und löse die abschließenden Historiker-Fragen.',
    historicalPillar: 'Quellenkritik & Historische Rekonstruktion',
    x: 75 * 16,
    y: 77 * 16,
    steps: [
      {
        id: 'step_1',
        title: 'Dokumentenanalyse: Wormser Edikt (1521)',
        prompt: 'Was bedeutete die kaiserliche Reichsacht („Vogelfreiheit“) für Martin Luther juristisch?',
        options: [
          {
            text: 'Er durfte für zehn Jahre keine Vögel und Wildtiere mehr jagen.',
            isCorrect: false,
            feedback: 'Nein! „Vogelfrei“ bedeutete: schutzlos wie ein Vogel im Wind.',
          },
          {
            text: 'Er verlor jeden rechtlichen Schutz: Jeder durfte ihn ungestraft festnehmen oder töten.',
            isCorrect: true,
            feedback: 'Richtig! Nur die Schutzhaft auf der Wartburg rettete ihm das Leben.',
          },
          {
            text: 'Er wurde zum Ehrenbürger der Reichsstadt Worms ernannt.',
            isCorrect: false,
            feedback: 'Ganz im Gegenteil: Seine Schriften sollten verbrannt werden.',
          },
        ],
      },
      {
        id: 'step_2',
        title: 'Dokumentenanalyse: Augsburger Religionsfrieden (1555)',
        prompt: 'Welcher Kompromiss beendete vorerst die blutigen Glaubenskriege im Reich?',
        options: [
          {
            text: '„Cuius regio, eius religio“ – Der Landesherr bestimmt die Konfession seiner Untertanen.',
            isCorrect: true,
            feedback: 'Historisch vollkommen richtig! Der Meilenstein zum Religionsfrieden.',
          },
          {
            text: 'Die Wiedereinführung der römischen Götterwelt aus der Antike.',
            isCorrect: false,
            feedback: 'Das wäre 1500 Jahre zu spät.',
          },
          {
            text: 'Die Auflösung aller Fürstentümer und Ausrufung einer Republik.',
            isCorrect: false,
            feedback: 'Reine Utopie im frühneuzeitlichen Kaiserreich.',
          },
        ],
      },
    ],
  },
];

export const STATIONS = REFORMATION_STATIONS;
