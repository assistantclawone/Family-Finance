/**
 * Zentrale Ausgaben-Kategorien. Diese Liste wird für den Transaktions-Dialog
 * und das Budget-Modul genutzt, damit erfasste Kategorien exakt mit den
 * Budgetgrenzen übereinstimmen (für eine korrekte Auswertung im Chart).
 */
export const EXPENSE_CATEGORIES = [
  'Wohnen',
  'Lebensmittel',
  'Transport',
  'Versicherung',
  'Gesundheit',
  'Bildung',
  'Freizeit',
  'Kleidung',
  'Essen gehen',
  'Sonstiges',
] as const;
