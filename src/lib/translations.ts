export const translations = {
  pl: {
    // Main page
    wheelOfFortune: 'Wheelchair',
    settings: 'Ustawienia',
    spinToSelectCreators: 'Zakręć, aby losowo wybrać twórców',
    wheel1: 'Koło 1',
    wheel2: 'Koło 2',
    spinWheel1: 'Zakręć Kołem 1',
    spinWheel2: 'Zakręć Kołem 2',
    spinBothWheels: 'Zakręć Oba Koła',
    randomizeWheel1: 'Losuj Koło 1',
    randomizeWheel2: 'Losuj Koło 2',
    selectedCreator: 'Wybrany Twórca',
    wheel1Label: 'Koło 1:',
    wheel2Label: 'Koło 2:',
    openYouTube: 'Otwórz YouTube',
    close: 'Zamknij',

    // Settings
    wheelSettings: 'Ustawienia Kół',
    maxCreatorsToShow: 'Maksymalna Liczba Twórców na Kole',
    allCreators: 'Wszyscy twórcy',
    maxCreatorsDescription:
      'Podczas kręcenia losowo wybierz tylu twórców z listy. Pozostaw puste lub ustaw 0, aby pokazać wszystkich twórców. Jeśli masz mniej twórców niż ta liczba, wszyscy będą pokazani.',
    rigWheels: 'Ustawienie Wyników',
    wheel1Preselected: 'Koło 1 (z góry wybrany wynik)',
    wheel2Preselected: 'Koło 2 (z góry wybrany wynik)',
    randomNoRig: 'Losowo (bez ustawienia)',
    selectCreatorOrSearch: 'Wybierz twórcę lub wpisz, aby wyszukać...',
    noCreatorsFound: 'Nie znaleziono twórców.',
    rigDescription:
      'Gdy ustawione, koła będą kręcić się normalnie, ale zawsze zatrzymają się na wybranym twórcy.',

    // Wheel
    addCreatorsToSpin: 'Dodaj twórców, aby zakręcić',

    // Spin History
    spinHistory: 'Historia Kręceń',
    noSpinsYet: 'Brak kręceń',
    wheel1History: 'Koło 1: ',
    wheel2History: 'Koło 2: ',
    showLess: 'Pokaż Mniej',
    showMore: 'Pokaż Więcej',
    more: 'więcej',

    // Creator Manager
    manageCreators: 'Zarządzaj Twórcami',
    addSingle: 'Dodaj Pojedynczo',
    bulkImport: 'Import Masowy',
    username: 'Nazwa użytkownika',
    youtubeUrl: 'URL YouTube (opcjonalne)',
    addAll: 'Dodaj Wszystkich',
    bulkImportPlaceholder:
      'Wpisz nazwy użytkowników, po jednej w linii\nPrzykład:\ntwórca1\ntwórca2\ntwórca3',
    bulkImportDescription:
      'Wklej wiele nazw użytkowników, po jednej w linii. Adresy URL YouTube zostaną wygenerowane automatycznie.',
    noCreatorsAddedYet: 'Nie dodano jeszcze żadnych twórców',
    totalCreators: 'Łącznie twórców:',
  },
} as const

export type TranslationKey = keyof typeof translations.pl

export function t(key: TranslationKey): string {
  return translations.pl[key]
}
