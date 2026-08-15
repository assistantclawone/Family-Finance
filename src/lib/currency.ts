'use client';

/**
 * Währungs-Helfer (Multi-Währung).
 *
 * Referenzwährung ist CHF. Für die Umrechnung wird ein GRATIS, fest
 * hinterlegter Wechselkurs-Stand verwendet (kein externer API-Aufruf).
 * Die Kurse sind grobe Durchschnittswerte — für eine präzise Veranlagung
 * bitte aktuelle Kurse einsetzen bzw. durch eine Markt-API ersetzen.
 *
 * Alle Beträge in der DB werden in ihrer eigenen Währung gespeichert.
 * Für Summen/Charts/Steueraufstellung wird in die Referenzwährung (CHF)
 * umgerechnet.
 */
import type { CurrencyCode } from '@/lib/types';

/** Referenzwährung für Umrechnung und Gesamtsummen. */
export const REFERENCE_CURRENCY: CurrencyCode = 'CHF';

/** Feste, grobe Durchschnittskurse (1 Einheit der Währung = X CHF). */
export const EXCHANGE_RATES_TO_CHF: Record<CurrencyCode, number> = {
  CHF: 1,
  EUR: 0.95,
  USD: 0.88,
  GBP: 1.11,
};

/** Liste aller unterstützten Währungen für UI-Auswahl. */
export const SUPPORTED_CURRENCIES: CurrencyCode[] = ['CHF', 'EUR', 'USD', 'GBP'];

/**
 * Rechnet einen Betrag aus einer Währung in eine Zielwährung um.
 * Standard-Ziel ist CHF (Referenzwährung).
 */
export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode = REFERENCE_CURRENCY,
): number {
  if (!Number.isFinite(amount)) return 0;
  const fromRate = EXCHANGE_RATES_TO_CHF[from] ?? 1;
  const toRate = EXCHANGE_RATES_TO_CHF[to] ?? 1;
  // von -> CHF -> to
  return (amount * fromRate) / toRate;
}

/** Währungs-Symbol für Anzeige. */
export function currencySymbol(currency: CurrencyCode): string {
  switch (currency) {
    case 'CHF':
      return 'CHF';
    case 'EUR':
      return '€';
    case 'USD':
      return '$';
    case 'GBP':
      return '£';
    default:
      return currency;
  }
}

/**
 * Formatiert einen Betrag als Währung. Nutze die angegebene Währung
 * (nützlich, um Einzelposten in ihrer Originalsprache anzuzeigen).
 */
export function formatCurrencyAmount(
  value: number,
  currency: CurrencyCode,
  locale: string = 'de-CH',
): string {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);
  } catch {
    return `${currencySymbol(currency)} ${value.toFixed(2)}`;
  }
}

/**
 * Formatiert einen Betrag in der Referenzwährung (CHF) — für Summen,
 * bei denen verschiedene Währungen zusammengeführt wurden.
 */
export function formatReferenceCurrency(value: number, locale: string = 'de-CH'): string {
  return formatCurrencyAmount(value, REFERENCE_CURRENCY, locale);
}
