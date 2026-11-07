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

export interface ChapterData {
  id: number;
  number: number;
  title: string;
  subtitle: string;
  year: string;
  location: string;
  historicalContext: string;
  mentor: MentorData;
  primaryObjective: string;
  objectives: string[];
  relicId?: string;
  stationId?: string;
  successMessage: string;
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
    mentor: {
      name: 'Dr. Martin Luther',
      role: 'Mönch & Theologieprofessor',
      x: 24 * 16,
      y: 21 * 16,
      spriteKey: 'keep_monk',
      portraitKey: 'luther_young',
      greeting: 'Gnade und Friede mit dir, junger Lucas! Gott will keine Münzen in Kisten, sondern ein bußfertiges Herz.',
      speech: 'Die Menschen verarmen und wiegen sich in falscher Sicherheit. Nimm meine Thesen zur Schlosskirche und sieh dir Tetzels Treiben vor den Toren an!',
    },
    primaryObjective: 'Untersuche Tetzels Ablasskasten und bringe Luthers 95 Thesen zur Schlosskirche.',
    objectives: [
      'Sprich mit Dr. Martin Luther im Konvent',
      'Untersuche Tetzels Ablasskasten auf dem Vorstadtmarkt',
      'Löse die Rechenprüfung an der Tetzel-Station',
      'Hebe die Handschrift der 95 Thesen am Schlossportal auf',
    ],
    relicId: 'thesen_95',
    stationId: 'station_ablass',
    successMessage: 'Die 95 Thesen hängen am Portal! Das Ringen um die Wahrheit hat begonnen.',
  },
  {
    id: 2,
    number: 2,
    title: 'Die Druckerpresse – Das Wort fliegt aus',
    subtitle: 'Die Werkstatt Cranachs',
    year: '1518',
    location: 'Wittenberger Cranach-Hof',
    historicalContext: 'Ohne den Buchdruck wäre Luthers Disputation im Sande verlaufen. In Lucas Cranachs Werkstatt laufen die Pressen Tag und Nacht heiß.',
    mentor: {
      name: 'Meister Lucas Cranach d. Ä.',
      role: 'Hofmaler & Werkstattleiter',
      x: 124 * 16,
      y: 19 * 16,
      spriteKey: 'keep_noble',
      portraitKey: 'cranach',
      greeting: 'Pack mit an, Lucas! Die Schriftgießer haben neue Lettern gebracht. Ganz Deutschland will Luthers Worte lesen!',
      speech: 'Ein Holzschnitt sagt mehr als tausend lateinische Predigten. Setze die Druckform und walze die Schwärze gleichmäßig auf.',
    },
    primaryObjective: 'Bediene die Buchdruckerpresse und drucke 100 Flugschriften für die Botenreiter.',
    objectives: [
      'Sprich mit Meister Cranach im Hofatelier',
      'Sammle Lettern und Papierballen aus dem Lager',
      'Löse die Setzkasten-Aufgabe an der Druckerpresse',
      'Birg den geschnitzten Cranach-Druckstock',
    ],
    relicId: 'druckerplatte_cranach',
    stationId: 'station_druckerei',
    successMessage: 'Die Druckerpresse hat vollendet! Hunderte Flugschriften gehen auf Reisen durch das Reich.',
  },
  {
    id: 3,
    number: 3,
    title: 'Das Verhör zu Augsburg',
    subtitle: 'Vor Kardinal Cajetan',
    year: '1518',
    location: 'Augsburger Fuggerpalast',
    historicalContext: 'Rom fordert Luthers Unterwerfung. Kardinal Cajetan verlangt das einfache Bekenntnis des Widerrufs, doch Luther pocht auf Bibelbeweise.',
    mentor: {
      name: 'Kardinal Thomas Cajetan',
      role: 'Päpstlicher Legat',
      x: 130 * 16,
      y: 52 * 16,
      spriteKey: 'keep_noble',
      portraitKey: 'cajetan',
      greeting: 'Unterwirf dich der heiligen Mutter Kirche, Mönch! Ein einziges Wort genügt: Revoco – Ich widerrufe!',
      speech: 'Die Autorität des Papstes steht über allen Gelehrten. Wer die Dekrete anzweifelt, spaltet die Christenheit.',
    },
    primaryObjective: 'Verteidige das Prinzip „Sola Scriptura“ und sichere Luthers nächtliche Flucht.',
    objectives: [
      'Tritt vor Kardinal Cajetan im Prunksaal',
      'Löse das theologische Streitgespräch an der Station',
      'Finde den geheimen Ausfallpfad an der Stadtmauer',
      'Überbringe die Botschaft an Kurfürst Friedrich',
    ],
    stationId: 'station_verhoer',
    successMessage: 'Luther ist unversehrt entkommen! Die Gewissensfrage ist reichsweit entbrannt.',
  },
  {
    id: 4,
    number: 4,
    title: 'Der Reichstag zu Worms',
    subtitle: 'Vor Kaiser Karl V.',
    year: '1521',
    location: 'Bürgersaal zu Worms',
    historicalContext: 'Der mächtigste Monarch der Christenheit, Kaiser Karl V., verlangt vor Fürsten und Ständen den endgültigen Widerruf. Luther bleibt unerschütterlich.',
    mentor: {
      name: 'Kaiser Karl V.',
      role: 'Kaiser des Heiligen Römischen Reiches',
      x: 169 * 16,
      y: 16 * 16,
      spriteKey: 'keep_king',
      portraitKey: 'karl_v',
      greeting: 'Ein einzelner Mönch will gegen tausend Jahre Kirchenlehre Recht behalten? Das dulde ich nicht!',
      speech: 'Mein Reich ist groß, doch kein Ketzer soll ungestraft das Gesetz brechen. Ich verhänge die Reichsacht über Martin Luther!',
    },
    primaryObjective: 'Widerstehe dem kaiserlichen Druck und sichere Luthers Geleitbrief.',
    objectives: [
      'Tritt vor den Kaiserthron in Worms',
      'Höre Luthers mutiges Bekenntnis: „Hier stehe ich, ich kann nicht anders“',
      'Prüfe das Dokument der Reichsacht (Wormser Edikt)',
      'Bereite die geheime Fluchtroute nach Thüringen vor',
    ],
    successMessage: 'Standhaft geblieben! Luther steht unter Reichsacht, doch sein Wort lebt weiter.',
  },
  {
    id: 5,
    number: 5,
    title: 'Junker Jörg auf der Wartburg',
    subtitle: 'Die deutsche Bibelübersetzung',
    year: '1521/1522',
    location: 'Wartburg bei Eisenach',
    historicalContext: 'Zur Rettung vor dem Scheiterhaufen fingieren sächsische Reiter einen Überfall. Auf der Wartburg übersetzt Luther als „Junker Jörg“ das Neue Testament.',
    mentor: {
      name: 'Junker Jörg (Martin Luther)',
      role: 'Versteckter Reformator',
      x: 168 * 16,
      y: 54 * 16,
      spriteKey: 'keep_monk',
      portraitKey: 'luther_joerg',
      greeting: 'Sei gegrüßt auf meiner Veste, treuer Lucas! Mit Tinte und Feder kämpfe ich gegen die Finsternis.',
      speech: 'Man muss dem Volk aufs Maul schauen! Wenn die Mutter im Hause und der Pflüger auf dem Acker das Evangelium nicht verstehen, war alle Mühe umsonst.',
    },
    primaryObjective: 'Löse die Sprachrätsel in Luthers Schreibstube und birg das Septembertestament.',
    objectives: [
      'Erklimme den Burghof der Wartburg',
      'Betritt die historische Lutherstube am Kamin',
      'Löse die 2 Übersetzungs-Aufgaben im Sprachlabor',
      'Sichere den Erstdruck des Septembertestaments',
    ],
    relicId: 'septembertestament',
    stationId: 'station_schreibstube',
    successMessage: 'Die Bibel spricht Deutsch! Eine neue Epoche der Bildung bricht an.',
  },
  {
    id: 6,
    number: 6,
    title: 'Das Schwarze Kloster & der neue Alltag',
    subtitle: 'Wittenberger Neuanfang',
    year: '1525',
    location: 'Wittenberger Lutherhaus',
    historicalContext: 'Klöster leeren sich, Priester heiraten. Katharina von Bora und Martin Luther gründen das evangelische Pfarrhaus als Ort der Zuflucht und Gastfreundschaft.',
    mentor: {
      name: 'Katharina von Bora',
      role: 'Wirtschaftsleiterin & Ehefrau',
      x: 147 * 16,
      y: 78 * 16,
      spriteKey: 'farm_baker_walk_down_strip',
      portraitKey: 'katharina',
      greeting: 'Gott zum Gruße, Lucas! Der Haushalt wächst von Tag zu Tag: Dreißig Studenten, Waisenkinder und Gelehrte müssen ernährt werden!',
      speech: 'Martin dichtet Kirchenlieder und sinnt über Gott nach – ich kümmere mich um Bierbrauerei, Heilkräuter und Viehzucht.',
    },
    primaryObjective: 'Hilf Katharina von Bora bei der Organisation des Anwesens und des Chorgesangs.',
    objectives: [
      'Sprich mit Katharina von Bora im Refektorium',
      'Ernte Heilkräuter und Malz für die Hausbrauerei',
      'Stimme mit Philipp Melanchthon den Choral „Ein feste Burg“ an',
      'Lerne die Bedeutung des evangelischen Pfarrhauses kennen',
    ],
    successMessage: 'Das Schwarze Kloster blüht! Der neue Alltag der Reformation hat feste Wurzeln gefasst.',
  },
  {
    id: 7,
    number: 7,
    title: 'Aufruhr & Bauernkrieg',
    subtitle: 'Die Zwölf Artikel von 1525',
    year: '1525',
    location: 'Thüringer Umland & Bauernlager',
    historicalContext: 'Beflügelt von der christlichen Freiheit erheben sich Bauern gegen Frondienst, Zehnt und Knechtschaft. Thomas Müntzer ruft zum Gottesreich, während Luther vor Gewalt warnt.',
    mentor: {
      name: 'Bauernsprecher Jörg',
      role: 'Vertreter der Landgemeinde',
      x: 56 * 16,
      y: 74 * 16,
      spriteKey: 'farm_farmer_girl_idle_down_strip',
      portraitKey: 'bauer',
      greeting: 'Wir wollen keine Gewalt, junger Geselle! Doch wir wollen nicht länger wie das Vieh im Joch gehalten werden!',
      speech: 'Lies unsere Zwölf Artikel! Warum soll der Graf die Wälder besitzen und uns das Fischen im Fluss verbieten, wenn Gott die Schöpfung für alle schuf?',
    },
    primaryObjective: 'Analysiere die Zwölf Artikel der Bauern und verhindere blindes Blutvergießen.',
    objectives: [
      'Erkunde das Lager der Bauern unter der Regenbogenfahne',
      'Prüfe die Beschwerden über Frondienst und Leibeigenschaft',
      'Vermittle im Gespräch zwischen Ratsherren und Bauern',
      'Reflektiere die Gefahren von Verbitterung und Krieg',
    ],
    successMessage: 'Die Tragödie des Bauernkrieges verstanden. Wahre Freiheit braucht Gerechtigkeit ohne Gewalt.',
  },
  {
    id: 8,
    number: 8,
    title: 'Der Augsburger Religionsfrieden',
    subtitle: 'Cuius regio, eius religio',
    year: '1555',
    location: 'Reichsstadt Augsburg',
    historicalContext: 'Nach Jahrzehnten des Ringens einigen sich Kaiser und Fürsten: Das lutherische Bekenntnis wird dem alten Glauben reichsrechtlich gleichgestellt.',
    mentor: {
      name: 'Kurfürst Friedrich der Weise (Gedenken)',
      role: 'Sächsischer Landesherr',
      x: 80 * 16,
      y: 76 * 16,
      spriteKey: 'keep_noble',
      portraitKey: 'friedrich_weise',
      greeting: 'Sei gegrüßt, Meister-Chronist Lucas! Dreißig Jahre treuer Dienst an Schrift und Wahrheit finden heute ihre Krönung.',
      speech: 'Der Frieden ist teuer erkauft. „Cuius regio, eius religio“ sichert den Glauben unserer Heimat. Drucke nun die Urkunde des Chronisten!',
    },
    primaryObjective: 'Besiegle das Geschichtsdiplom und drucke dein 1-Klick A4-Schulhefterblatt.',
    objectives: [
      'Tritt in den festlichen Friedenssaal zu Augsburg',
      'Untersuche den kaiserlichen Reichsabschied von 1555',
      'Löse die Abschlussprüfung am 360°-Quelleninspektor',
      'Erhalte das Große Reformations-Chronisten-Diplom',
    ],
    relicId: 'religionsfriede_1555',
    stationId: 'station_quelleninspektor',
    successMessage: 'Meisterleistung! Du hast die Reformation von 1517 bis 1555 meisterhaft dokumentiert.',
  },
];
