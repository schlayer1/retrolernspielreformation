export interface ChapterObjective {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface MentorData {
  name: string;
  role: string;
  x: number;
  y: number;
  spriteKey: string;
  portraitKey: string;
  speech: string;
  greeting: string;
}

export interface ChapterQuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface ChapterData {
  id: number;
  number: number;
  title: string;
  subtitle: string;
  year: string;
  location: string;
  historicalContext: string;
  spawn: { x: number; y: number };
  mentor: MentorData;
  primaryObjective: string;
  objectives: string[];
  hintSteps: string[];
  quiz: ChapterQuizQuestion[];
  relicId?: string;
  stationId?: string;
  successMessage: string;
  targetInterior?: string;
  music?: {
    trackId: string;
    title: string;
    style: string;
    prompt: string;
  };
}

export const REFORMATION_CHAPTERS: ChapterData[] = [
  {
    id: 1,
    number: 1,
    title: 'Der Seelenmarkt & die 95 Thesen',
    subtitle: 'Wittenberg & Jüterbog',
    year: '1517',
    location: 'Wittenberg (Markt & Schlosskirche)',
    historicalContext: 'Johann Tetzel zieht mit kaiserlicher und päpstlicher Vollmacht durchs Land, um Ablassbriefe zu verkaufen. In Wittenberg regt sich Widerstand im Augustinerkloster.',
    spawn: { x: 23 * 16, y: 25 * 16 },
    mentor: {
      name: 'Dr. Martin Luther',
      role: 'Mönch & Theologieprofessor',
      x: 24 * 16,
      y: 21 * 16,
      spriteKey: 'npc_luther',
      portraitKey: 'luther_young',
      greeting: 'Gnade und Friede mit dir, junger Lucas! Gott will keine Münzen in Kisten, sondern ein bußfertiges Herz.',
      speech: 'Die Menschen verarmen und wiegen sich in falscher Sicherheit. Nimm meine Thesen zur Schlosskirche und sieh dir Tetzels Treiben vor den Toren an!',
    },
    primaryObjective: 'Untersuche Tetzels Ablasskasten und bringe Luthers 95 Thesen zur Schlosskirche.',
    objectives: [
      'Sprich mit Dr. Martin Luther auf dem Schlossplatz',
      'Untersuche Tetzels Ablasskasten auf dem Vorstadtmarkt',
      'Löse die Rechenprüfung an der Tetzel-Station',
      'Hebe die Handschrift der 95 Thesen am Schlossportal auf',
    ],
    hintSteps: [
      'Rede zuerst mit Dr. Martin Luther nördlich des Brunnens.',
      'Folge dem Weg nach Süden zu Tetzels rotem Marktstand und prüfe den Ablasskasten.',
      'Öffne gleich daneben die grüne Tetzel-Station mit [E].',
      'Kehr zurück zur Schlosskirche im Nordwesten und birg die Handschrift der 95 Thesen.',
    ],
    quiz: [
      {
        question: 'Welche Hauptaussage richtete Martin Luther in seinen 95 Thesen gegen den Ablasshandel?',
        options: [
          'Nur echte innere Reue und Gottes Gnade vergeben Schuld – kein Geldbrief.',
          'Der Ablass durfte ausschließlich in Gold statt Silber bezahlt werden.',
          'Jeder Christ sollte einmal im Jahr nach Rom pilgern.',
        ],
        correct: 0,
        explanation: 'Luther betonte „Sola Gratia“: Gottes Vergebung ist ein Geschenk aus Gnade, keine käufliche Ware.',
      },
      {
        question: 'Wohin floss ein großer Teil der Erlöse aus Tetzels Ablasskästen?',
        options: [
          'In den Aufbau kostenloser Dorfschulen in Sachsen.',
          'An den Petersdom in Rom sowie zur Schuldentilgung an die Fugger-Bank.',
          'An die Zünfte der Wittenberger Drucker.',
        ],
        correct: 1,
        explanation: 'Papst Leo X. und Erzbischof Albrecht teilten sich die Einnahmen mit dem Augsburger Bankhaus Fugger.',
      },
    ],
    relicId: 'thesen_95',
    stationId: 'station_ablass',
    successMessage: 'Die 95 Thesen hängen am Portal! Das Ringen um die Wahrheit hat begonnen.',
    targetInterior: 'schlosskirche_portal',
    music: {
      trackId: 'ref_k01_thesen',
      title: 'Der Seelenmarkt & die 95 Thesen',
      style: '16-bit SNES Renaissance Lute & Monastery Choir',
      prompt: 'Sacred lute and monastic choir',
    },
  },
  {
    id: 2,
    number: 2,
    title: 'Die Druckerpresse – Das Wort fliegt aus',
    subtitle: 'Die Werkstatt Cranachs',
    year: '1518',
    location: 'Wittenberger Cranach-Hof',
    historicalContext: 'Ohne den Buchdruck wäre Luthers Disputation im Sande verlaufen. In Lucas Cranachs Werkstatt laufen die Pressen Tag und Nacht heiß.',
    spawn: { x: 34 * 16, y: 26 * 16 },
    mentor: {
      name: 'Meister Lucas Cranach d. Ä.',
      role: 'Hofmaler & Werkstattleiter',
      x: 34 * 16,
      y: 21 * 16,
      spriteKey: 'npc_cranach',
      portraitKey: 'cranach',
      greeting: 'Pack mit an, Lucas! Die Schriftgießer haben neue Lettern gebracht. Ganz Deutschland will Luthers Worte lesen!',
      speech: 'Ein Holzschnitt sagt mehr als tausend lateinische Predigten. Setze die Druckform und walze die Schwärze gleichmäßig auf.',
    },
    primaryObjective: 'Bediene die Buchdruckerpresse und drucke Flugschriften für die Botenreiter.',
    objectives: [
      'Sprich mit Meister Cranach vor seinem Hofatelier',
      'Sammle Bleilettern und Pergament im Druckerei-Hof',
      'Löse die Setzkasten-Aufgabe an der Druckerpresse',
      'Birg den geschnitzten Cranach-Druckstock',
    ],
    hintSteps: [
      'Sprich mit Meister Lucas Cranach nordöstlich des Marktplatzes.',
      'Plündere die Lettern- und Pergamentkisten im Cranach-Hof mit [E].',
      'Meistere die Druckerpresse-Station (auch im Innenraum des Ateliers erreichbar).',
      'Untersuche den Cranach-Holzschnitt vor dem Atelier-Eingang.',
    ],
    quiz: [
      {
        question: 'Wie mussten bewegliche Bleilettern in den Setzkasten gelegt werden?',
        options: [
          'Spiegelverkehrt und seitenverkehrt von rechts nach links.',
          'Normal lesbar von links nach rechts wie im Schulheft.',
          'Nur in großen Druckbuchstaben ohne Wortabstand.',
        ],
        correct: 0,
        explanation: 'Wie jeder Stempel druckt auch die Gutenberg-Presse spiegelverkehrt aufs Papier ab.',
      },
      {
        question: 'Warum waren Holzschnitte in Cranachs Flugblättern so wirkungsvoll?',
        options: [
          'Sie durften ohne Zustimmung des Kaisers bunt vergoldet werden.',
          'Auch Menschen, die nicht lesen konnten, verstanden die Bildbotschaften sofort.',
          'Sie verhinderten, dass Druckerschwärze auf Hadernpapier verlief.',
        ],
        correct: 1,
        explanation: 'Drastische Bildgegensätze erreichten im 16. Jahrhundert breite Schichten jenseits der Gelehrtenwelt.',
      },
    ],
    relicId: 'druckerplatte_cranach',
    stationId: 'station_druckerei',
    successMessage: 'Die Druckerpresse hat vollendet! Hunderte Flugschriften gehen auf Reisen durch das Reich.',
    targetInterior: 'cranach_werkstatt_druckerei',
    music: {
      trackId: 'ref_k02_buchdruck',
      title: 'Die Werkstatt von Cranach & der Buchdruck',
      style: '16-bit SNES Renaissance Artisan & Woodwinds',
      prompt: 'Lively printing workshop',
    },
  },
  {
    id: 3,
    number: 3,
    title: 'Das Verhör zu Augsburg',
    subtitle: 'Vor Kardinal Cajetan',
    year: '1518',
    location: 'Augsburger Fuggerpalast',
    historicalContext: 'Rom fordert Luthers Unterwerfung. Kardinal Cajetan verlangt das einfache Bekenntnis des Widerrufs, doch Luther pocht auf Bibelbeweise.',
    spawn: { x: 60 * 16, y: 25 * 16 },
    mentor: {
      name: 'Kardinal Thomas Cajetan',
      role: 'Päpstlicher Legat',
      x: 61 * 16,
      y: 21 * 16,
      spriteKey: 'npc_cajetan',
      portraitKey: 'cajetan',
      greeting: 'Unterwirf dich der heiligen Mutter Kirche, Mönch! Ein einziges Wort genügt: Revoco – Ich widerrufe!',
      speech: 'Die Autorität des Papstes steht über allen Gelehrten. Wer die Dekrete anzweifelt, spaltet die Christenheit.',
    },
    primaryObjective: 'Verteidige das Prinzip „Sola Scriptura“ und sichere Luthers nächtliche Flucht.',
    objectives: [
      'Tritt vor Kardinal Cajetan am Fuggerpalais',
      'Löse das theologische Streitgespräch an der Disputations-Station',
      'Betritt den Audienzsaal des Fuggerpalais',
      'Entscheide im Historischen Dilemma über Gewissen und Autorität',
    ],
    hintSteps: [
      'Überquere die nördliche Elbbrücke nach Osten zum Fuggerpalais.',
      'Sprich mit Kardinal Cajetan und stelle dich der Verhör-Station gleich rechts daneben.',
      'Tritt durch die Tür des Fuggerpalais ins Innere ein.',
      'Öffne über [H] oder im Gespräch das Historische Dilemma zu Kapitel 3.',
    ],
    quiz: [
      {
        question: 'Welches Wort verlangte Kardinal Cajetan beim Verhör in Augsburg von Luther?',
        options: [
          '„Sola Fide“ – Allein durch den Glauben.',
          '„Revoco“ – Ich widerrufe.',
          '„Ius emigrandi“ – Recht auf Auswanderung.',
        ],
        correct: 1,
        explanation: 'Cajetan forderte bedingungslosen Widerruf statt einer offenen Disputation über die Bibel.',
      },
      {
        question: 'Worauf stützte Luther seine Weigerung zu widerrufen?',
        options: [
          'Auf die Heilige Schrift („Sola Scriptura“) und klare Vernunftgründe.',
          'Auf ein persönliches Geheimgesetz des sächsischen Rates.',
          'Auf die Stimmenmehrheit der Wittenberger Kaufleute.',
        ],
        correct: 0,
        explanation: 'Für Luther stand die Autorität der Bibel über päpstlichen Beschlüssen und Konzilien.',
      },
    ],
    stationId: 'station_verhoer',
    successMessage: 'Luther ist unversehrt entkommen! Die Gewissensfrage ist reichsweit entbrannt.',
    targetInterior: 'fuggerpalais_augsburg',
    music: {
      trackId: 'ref_k03_bannbulle',
      title: 'Bannandrohung & Feuer vor dem Elstertor',
      style: '16-bit SNES Dramatic Dark Choral',
      prompt: 'Solemn Latin chant feeling',
    },
  },
  {
    id: 4,
    number: 4,
    title: 'Der Reichstag zu Worms',
    subtitle: 'Vor Kaiser Karl V.',
    year: '1521',
    location: 'Kaiserpfalz zu Worms',
    historicalContext: 'Der mächtigste Monarch der Christenheit, Kaiser Karl V., verlangt vor Fürsten und Ständen den endgültigen Widerruf. Luther bleibt unerschütterlich.',
    spawn: { x: 80 * 16, y: 26 * 16 },
    mentor: {
      name: 'Kaiser Karl V.',
      role: 'Kaiser des Heiligen Römischen Reiches',
      x: 80 * 16,
      y: 22 * 16,
      spriteKey: 'npc_karl_v',
      portraitKey: 'karl_v',
      greeting: 'Ein einzelner Mönch will gegen tausend Jahre Kirchenlehre Recht behalten? Das dulde ich nicht!',
      speech: 'Mein Reich ist groß, doch kein Ketzer soll ungestraft das Gesetz brechen. Ich verhänge die Reichsacht über Martin Luther!',
    },
    primaryObjective: 'Widerstehe dem kaiserlichen Druck und sichere Luthers Geleitbrief.',
    objectives: [
      'Tritt vor Kaiser Karl V. an der Pfalz zu Worms',
      'Betritt den Reichstagssaal im Innern der Pfalz',
      'Prüfe die Reichsacht-Rolle im Saal oder auf dem Platz',
      'Schließe die Reichstags-Disputation bei Kaiser Karl V. ab',
    ],
    hintSteps: [
      'Wandere ganz nach Osten über das Fuggerplatz-Pflaster zur Kaiserpfalz Worms.',
      'Sprich mit Kaiser Karl V. vor dem Torbau.',
      'Betritt den Reichstagssaal durch das große Pfalzportal mit [E].',
      'Kehre nach dem Rundgang zu Karl V. zurück und bestehe die Disputation.',
    ],
    quiz: [
      {
        question: 'Was bedeutete das Wormser Edikt (Reichsacht) von 1521 für Martin Luther?',
        options: [
          'Er wurde zum Hofprediger in Wien ernannt.',
          'Er wurde „vogelfrei“ erklärt und seine Schriften sollten verbrannt werden.',
          'Er durfte fünf Jahre lang kostenlos Druckpapier beziehen.',
        ],
        correct: 1,
        explanation: 'Als Geächteter („vogelfrei“) verlor Luther jeden kaiserlichen Rechtsschutz.',
      },
      {
        question: 'Wer rettete Luther nach seiner Abreise aus Worms vor der Verhaftung?',
        options: [
          'Kurfürst Friedrich der Weise durch eine vorgetäuschte Entführung auf die Wartburg.',
          'Kardinal Cajetan durch eine Verlegung nach Augsburg.',
          'Bauernsprecher Jörg mit einem Heer aus Frankenhausen.',
        ],
        correct: 0,
        explanation: 'Sächsische Reiter brachten Luther zum Schutz heimlich auf die Wartburg bei Eisenach.',
      },
    ],
    successMessage: 'Standhaft geblieben! Luther steht unter Reichsacht, doch sein Wort lebt weiter.',
    targetInterior: 'reichstagssaal_worms',
    music: {
      trackId: 'ref_k04_worms',
      title: 'Hier stehe ich – Der Reichstag zu Worms',
      style: '16-bit SNES Imperial Fanfare & Regal Organ',
      prompt: 'Majestic imperial court theme',
    },
  },
  {
    id: 5,
    number: 5,
    title: 'Junker Jörg auf der Wartburg',
    subtitle: 'Die deutsche Bibelübersetzung',
    year: '1521/1522',
    location: 'Wartburg bei Eisenach',
    historicalContext: 'Zur Rettung vor dem Scheiterhaufen fingieren sächsische Reiter einen Überfall. Auf der Wartburg übersetzt Luther als „Junker Jörg“ das Neue Testament.',
    spawn: { x: 24 * 16, y: 81 * 16 },
    mentor: {
      name: 'Junker Jörg (Martin Luther)',
      role: 'Versteckter Reformator',
      x: 24 * 16,
      y: 77 * 16,
      spriteKey: 'npc_junker_joerg',
      portraitKey: 'luther_joerg',
      greeting: 'Sei gegrüßt auf meiner Veste, treuer Lucas! Mit Tinte und Feder kämpfe ich gegen die Finsternis.',
      speech: 'Man muss dem Volk aufs Maul schauen! Wenn die Mutter im Hause und der Pflüger auf dem Acker das Evangelium nicht verstehen, war alle Mühe umsonst.',
    },
    primaryObjective: 'Löse die Sprachrätsel in Luthers Schreibstube und birg das Septembertestament.',
    objectives: [
      'Erklimme die Wartburg-Treppe und sprich mit Junker Jörg',
      'Sammle Buchenholz für den Ofen der Schreibstube',
      'Löse die 2 Übersetzungs-Aufgaben an der Wartburg-Station',
      'Sichere den Erstdruck des Septembertestaments',
    ],
    hintSteps: [
      'Nimm im Südwesten eine der beiden Felstreppen auf das Wartburg-Plateau.',
      'Sprich mit Junker Jörg vor dem Bergfried und sammle Brennholz östlich des Tors.',
      'Prüfe dein Sprachgefühl an der Schreibstuben-Station westlich des Tores.',
      'Hebe den Erstdruck des Septembertestaments von 1522 auf.',
    ],
    quiz: [
      {
        question: 'Welchen Grundsatz verfolgte Luther bei der Bibelübersetzung auf der Wartburg?',
        options: [
          'Nur Gelehrtenwörter aus dem Lateinischen übernehmen.',
          '„Dem Volk aufs Maul schauen“ – lebendiges, allgemein verständliches Deutsch.',
          'Jeden griechischen Vers in Reimform umdichten.',
        ],
        correct: 1,
        explanation: 'Luthers anschauliche Sprache prägte zahllose Redewendungen und begründete das Neuhochdeutsche mit.',
      },
      {
        question: 'In welcher erstaunlich kurzen Zeit übersetzte Luther auf der Wartburg das Neue Testament?',
        options: [
          'In etwa elf Wochen.',
          'In zwölf Jahren.',
          'In drei Tagen.',
        ],
        correct: 0,
        explanation: 'Von Dezember 1521 bis März 1522 vollendete er die Rohfassung in rund elf Wochen.',
      },
    ],
    relicId: 'septembertestament',
    stationId: 'station_schreibstube',
    successMessage: 'Die Bibel spricht Deutsch! Eine neue Epoche der Bildung bricht an.',
    targetInterior: 'wartburg_stube',
    music: {
      trackId: 'ref_k05_wartburg',
      title: 'Junker Jörg auf der Wartburg',
      style: '16-bit SNES Castle Solitude & Folk Lute',
      prompt: 'Gentle melancholic folk lute',
    },
  },
  {
    id: 6,
    number: 6,
    title: 'Das Schwarze Kloster & der neue Alltag',
    subtitle: 'Wittenberger Neuanfang',
    year: '1525',
    location: 'Wittenberger Lutherhaus',
    historicalContext: 'Klöster leeren sich, Priester heiraten. Katharina von Bora und Martin Luther gründen das evangelische Pfarrhaus als Ort der Zuflucht und Gastfreundschaft.',
    spawn: { x: 36 * 16, y: 53 * 16 },
    mentor: {
      name: 'Katharina von Bora',
      role: 'Wirtschaftsleiterin & Ehefrau',
      x: 36 * 16,
      y: 49 * 16,
      spriteKey: 'npc_katharina',
      portraitKey: 'katharina',
      greeting: 'Gott zum Gruße, Lucas! Der Haushalt wächst von Tag zu Tag: Dreißig Studenten, Waisenkinder und Gelehrte müssen ernährt werden!',
      speech: 'Martin dichtet Kirchenlieder und sinnt über Gott nach – ich kümmere mich um Bierbrauerei, Heilkräuter und Viehzucht.',
    },
    primaryObjective: 'Hilf Katharina von Bora bei der Organisation des Schwarzen Klosters.',
    objectives: [
      'Sprich mit Katharina von Bora vor dem Schwarzen Kloster',
      'Ernte frische Heilkräuter im Klostergarten östlich des Hauses',
      'Braue Klostertrunk an der Werkbank ([C]) oder besuche die Lutherstube',
      'Besprich mit Katharina den Alltag des evangelischen Pfarrhauses',
    ],
    hintSteps: [
      'Wandere in die Landesmitte westlich der Elbe zum Schwarzen Kloster.',
      'Sprich mit Katharina von Bora am Konventshaus.',
      'Sammle Heilkräuter im Gartenbeet und braue im Menü [C] oder betritt die Lutherstube.',
      'Kehre zu Katharina zurück und bestehe das Kapitel-Gespräch.',
    ],
    quiz: [
      {
        question: 'Welche gesellschaftliche Neuerung brachte das Ehepaar Katharina und Martin Luther sichtbar voran?',
        options: [
          'Das Zölibatsgebot wurde auf Kaufleute ausgeweitet.',
          'Das offene evangelische Pfarrhaus mit Ehe, Gastfreundschaft, Schule und Wirtschaftsführung.',
          'Frauen durften erstmals Klöster nur außerhalb Sachsens verlassen.',
        ],
        correct: 1,
        explanation: 'Katharina von Bora führte das Schwarze Kloster wie ein großes Bildungs- und Wirtschaftshaus.',
      },
      {
        question: 'Warum bauten Klöster und Pfarrhäuser eigene Kräutergärten und Brauereien an?',
        options: [
          'Zur Selbstversorgung mit Arzneien und sauberem Dünnbier statt verunreinigtem Brunnenwasser.',
          'Weil Weizen in Wittenberg verboten war.',
          'Ausschließlich zum Verkauf auf dem Reichstag zu Worms.',
        ],
        correct: 0,
        explanation: 'Abgekochtes Dünnbier und Heilkräuter waren im 16. Jahrhundert lebenswichtig für Gesundheit und Versorgung.',
      },
    ],
    successMessage: 'Das Schwarze Kloster blüht! Der neue Alltag der Reformation hat feste Wurzeln gefasst.',
    targetInterior: 'lutherstube_wittenberg',
    music: {
      trackId: 'ref_k06_bildersturm',
      title: 'Wittenberger Unruhen & Bildersturm',
      style: '16-bit SNES Suspense & City Agitation',
      prompt: 'Warning town bells and rapid tempo',
    },
  },
  {
    id: 7,
    number: 7,
    title: 'Aufruhr & Bauernkrieg',
    subtitle: 'Die Zwölf Artikel von 1525',
    year: '1525',
    location: 'Thüringer Umland & Bauernlager',
    historicalContext: 'Beflügelt von der christlichen Freiheit erheben sich Bauern gegen Frondienst, Zehnt und Knechtschaft. Thomas Müntzer ruft zum Gottesreich, während Luther vor Gewalt warnt.',
    spawn: { x: 59 * 16, y: 79 * 16 },
    mentor: {
      name: 'Bauernsprecher Jörg',
      role: 'Vertreter der Landgemeinde',
      x: 59 * 16,
      y: 75 * 16,
      spriteKey: 'npc_muentzer',
      portraitKey: 'bauer',
      greeting: 'Wir wollen keine Gewalt, junger Geselle! Doch wir wollen nicht länger wie das Vieh im Joch gehalten werden!',
      speech: 'Lies unsere Zwölf Artikel! Warum soll der Graf die Wälder besitzen und uns das Fischen im Fluss verbieten, wenn Gott die Schöpfung für alle schuf?',
    },
    primaryObjective: 'Analysiere die Zwölf Artikel der Bauern und entscheide über gerechte Reformen ohne Gewalt.',
    objectives: [
      'Sprich mit Bauernsprecher Jörg am Thüringer Dorfplatz',
      'Besuche die Bauernstube ([E] vor der Fachwerkkate)',
      'Triff im Historischen Dilemma eine gerechte Friedensentscheidung',
      'Vermittle mit Bauernsprecher Jörg über die Zwölf Artikel',
    ],
    hintSteps: [
      'Überquere die südliche Elbbrücke ins Bauernland südlich des Flusses.',
      'Sprich mit Bauernsprecher Jörg nahe der Fachwerkkate.',
      'Betritt die Bauernstube oder öffne dein Chronisten-Dilemma ([H]).',
      'Schließe im Gespräch mit Jörg die Disputation zu den Zwölf Artikeln ab.',
    ],
    quiz: [
      {
        question: 'Was forderten die Aufständischen 1525 in den berühmten „Zwölf Artikeln von Memmingen“?',
        options: [
          'Die Abschaffung aller Städte und Druckerpressen.',
          'Die Aufhebung der Leibeigenschaft, gerechte Abgaben sowie freie Wald- und Wassernutzung.',
          'Die Krönung Thomas Müntzers zum deutschen Kaiser.',
        ],
        correct: 1,
        explanation: 'Die Zwölf Artikel gelten als eine der frühesten schriftlichen Menschen- und Freiheitsrechtsforderungen in Europa.',
      },
      {
        question: 'Wie reagierte Martin Luther auf den bewaffneten Aufstand der Bauern?',
        options: [
          'Er lehnte die Vermischung von geistlichem Evangelium und weltlichem Blutvergießen scharf ab.',
          'Er führte selbst das Bauernheer bei Frankenhausen an.',
          'Er ließ die 95 Thesen widerrufen.',
        ],
        correct: 0,
        explanation: 'Luther fürchtete Chaos und trennte geistliche Freiheit des Christen von weltlicher Obrigkeit.',
      },
    ],
    successMessage: 'Die Tragödie des Bauernkrieges verstanden. Wahre Freiheit braucht Gerechtigkeit ohne Gewalt.',
    targetInterior: 'bauernrat_stube',
    music: {
      trackId: 'ref_k07_bauernkrieg',
      title: 'Die Zwölf Artikel & der Bauernkrieg',
      style: '16-bit SNES Peasant Folk & Gathering Drums',
      prompt: 'Rustic German peasant folk melody',
    },
  },
  {
    id: 8,
    number: 8,
    title: 'Der Augsburger Religionsfrieden',
    subtitle: 'Cuius regio, eius religio',
    year: '1555',
    location: 'Reichsstadt Augsburg',
    historicalContext: 'Nach Jahrzehnten des Ringens einigen sich Kaiser und Fürsten: Das lutherische Bekenntnis wird dem alten Glauben reichsrechtlich gleichgestellt.',
    spawn: { x: 81 * 16, y: 80 * 16 },
    mentor: {
      name: 'Kurfürst Friedrich der Weise (Gedenken)',
      role: 'Sächsischer Landesherr',
      x: 81 * 16,
      y: 76 * 16,
      spriteKey: 'npc_friedrich',
      portraitKey: 'friedrich_weise',
      greeting: 'Sei gegrüßt, Meister-Chronist Lucas! Dreißig Jahre treuer Dienst an Schrift und Wahrheit finden heute ihre Krönung.',
      speech: 'Der Frieden ist teuer erkauft. „Cuius regio, eius religio“ sichert den Glauben unserer Heimat. Drucke nun die Urkunde des Chronisten!',
    },
    primaryObjective: 'Besiegle das Geschichtsdiplom und drucke dein 1-Klick A4-Schulhefterblatt.',
    objectives: [
      'Sprich mit Kurfürst Friedrich vor dem Augsburger Rathaus',
      'Besuche den festlichen Friedenssaal im Rathaus',
      'Löse die Abschlussprüfung am 360°-Quelleninspektor',
      'Untersuche den besiegelten Augsburger Religionsfrieden 1555',
    ],
    hintSteps: [
      'Reise in den Südosten nach Augsburg (rechts vom Bauernland).',
      'Sprich mit Kurfürst Friedrich vor dem Rathaus.',
      'Löse die grüne Abschluss-Station links und prüfe die Urkunde rechts.',
      'Tritt danach zu Friedrich und schließe die Reise als Meister-Chronist ab!',
    ],
    quiz: [
      {
        question: 'Was legte der Grundsatz „Cuius regio, eius religio“ (1555) reichsrechtlich fest?',
        options: [
          'Der jeweilige Landesherr bestimmte die Konfession seines Territoriums.',
          'Nur noch eine einzige Konfession blieb weltweit erlaubt.',
          'Der Papst ernannte alle Bürgermeister im Reich.',
        ],
        correct: 0,
        explanation: 'Katholische und lutherische Reichsstände wurden erstmals rechtlich gleichgestellt.',
      },
      {
        question: 'Welches Recht schützte Menschen, die nicht die Konfession ihres Fürsten annehmen wollten?',
        options: [
          'Das „Ius emigrandi“ – freies Auswanderungsrecht mit Hab und Gut.',
          'Die Befreiung von allen Brückenzöllen.',
          'Das Wahlrecht für den Reichstag zu Worms.',
        ],
        correct: 0,
        explanation: 'Das Auswanderungsrecht markierte einen frühen historischen Schritt in Richtung Gewissensfreiheit.',
      },
    ],
    relicId: 'religionsfriede_1555',
    stationId: 'station_quelleninspektor',
    successMessage: 'Meisterleistung! Du hast die Reformation von 1517 bis 1555 meisterhaft dokumentiert.',
    targetInterior: 'rathaus_friedenssaal',
    music: {
      trackId: 'ref_k08_religionsfrieden',
      title: 'Augsburger Bekenntnis & Religionsfrieden',
      style: '16-bit SNES Triumphant Sacred Anthem',
      prompt: 'Triumphant Renaissance chorale',
    },
  },
];

export const CHAPTERS = REFORMATION_CHAPTERS;

