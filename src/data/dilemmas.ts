export interface DilemmaChoice {
  text: string;
  historicalOutcome: string;
  points: number;
}

export interface ReformationDilemma {
  id: string;
  chapter: number;
  title: string;
  situation: string;
  historicalQuestion: string;
  choices: DilemmaChoice[];
}

export const REFORMATION_DILEMMAS: ReformationDilemma[] = [
  {
    id: 'dilemma_thesen',
    chapter: 1,
    title: 'Gewissensnot: Der Anschlag der 95 Thesen',
    situation: 'Martin Luther hat 95 lateinische Streitsätze gegen den Ablass verfasst. Die Universitätsstatuten erlauben akademische Disputationen, doch der Erzbischof ist hoch verschuldet und duldet keine Kritik.',
    historicalQuestion: 'Wie soll Lucas Luther raten, mit den Thesen zu verfahren?',
    choices: [
      {
        text: 'Die Thesen verbrennen, um den Frieden im Kloster nicht zu gefährden.',
        historicalOutcome: 'Ohne Widerspruch wäre der Seelenmarkt ungehindert weitergegangen. Die Menschen hätten ihr letztes Geld verloren.',
        points: 0,
      },
      {
        text: 'Die Thesen an die Tür der Schlosskirche heften und dem Volk auf Deutsch erklären.',
        historicalOutcome: 'Historischer Pfad! Aus dem akademischen Papier wurde die Initialzündung einer gesamteuropäischen Reformbewegung.',
        points: 25,
      },
      {
        text: 'Nur einen vertraulichen Brief an den Papst nach Rom senden und schweigen.',
        historicalOutcome: 'Solche Briefe versandeten damals in der römischen Kurie ohne jede Auswirkung.',
        points: 10,
      },
    ],
  },
  {
    id: 'dilemma_worms',
    chapter: 4,
    title: 'Standhaftigkeit vor Kaiser Karl V.',
    situation: 'Im überfüllten Bürgersaal zu Worms liegt der Bücherstapel auf dem Tisch. Der kaiserliche Notar fordert: „Widerrufst du oder nicht?“ Bei Weigerung drohen Reichsacht und Verbrennung.',
    historicalQuestion: 'Welche Entscheidung trifft Luther vor der Versammlung der Reichsstände?',
    choices: [
      {
        text: 'Widerrufen und Abbitte leisten, um das eigene Leben zu retten.',
        historicalOutcome: 'Die Reformbewegung wäre erloschen und als vorübergehende Ketzerei in den Akten verschwunden.',
        points: 5,
      },
      {
        text: '„Hier stehe ich, ich kann nicht anders. Gott helfe mir, Amen!“ – Dem Gewissen und der Bibel treu bleiben.',
        historicalOutcome: 'Historischer Meilenstein! Die Geburtsstunde der modernen Gewissensfreiheit im abendländischen Denken.',
        points: 30,
      },
      {
        text: 'Mit dem Schwert den Saal stürmen und die Fürsten angreifen.',
        historicalOutcome: 'Wäre ein blutiges Massaker gewesen und stand im völligen Widerspruch zum Evangelium.',
        points: 0,
      },
    ],
  },
  {
    id: 'dilemma_bauernkrieg',
    chapter: 7,
    title: 'Die Zerrissenheit im Bauernkrieg (1525)',
    situation: 'Die Bauern erheben sich und berufen sich auf Luthers Schrift von der Freiheit eines Christenmenschen. Es kommt zu Plünderungen, während die Fürsten mit schweren Heeren aufrüsten.',
    historicalQuestion: 'Welche Haltung nimmt ein wahrhafter Chronist und Humanist ein?',
    choices: [
      {
        text: 'Beide Seiten zur Mäßigung und zum Verhandlungstisch aufrufen: Die Not der Bauern anerkennen, aber Gewalt ablehnen.',
        historicalOutcome: 'Der christlich-humanistische Idealweg nach Philipp Melanchthon: Reformen durch Recht und Gesetz statt durch Blutvergießen.',
        points: 25,
      },
      {
        text: 'Zu den Waffen greifen und alle Burgen niederbrennen.',
        historicalOutcome: 'Führte historisch in die katastrophale Niederlage der Bauern bei Frankenhausen mit zehntausenden Toten.',
        points: 0,
      },
      {
        text: 'Die Bauern als Ungeziefer bezeichnen und ihre totale Vernichtung fordern.',
        historicalOutcome: 'Brachte bittere Spaltung und tiefe Enttäuschung über die Härte der Landesherren.',
        points: 5,
      },
    ],
  },
];
