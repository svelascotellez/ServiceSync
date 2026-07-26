// Timezone constant for Cancún / Quintana Roo (UTC-5)
export const CANCUN_TIMEZONE = 'America/Cancun';

/**
 * Clean locale string differences (e.g. U+202F / U+00A0 spaces) between Node ICU and Browser V8 ICU
 */
function normalizeIntlStr(str: string): string {
  return str.replace(/[\u202F\u00A0]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Format date string or Date object to Cancún local date string (e.g. "25/07/2026")
 */
export function formatCancunDate(dateInput?: string | Date | null): string {
  if (!dateInput) return 'Sin fecha';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return 'Fecha inválida';
  try {
    const formatted = d.toLocaleDateString('es-MX', {
      timeZone: CANCUN_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return normalizeIntlStr(formatted);
  } catch (e) {
    return 'Sin fecha';
  }
}

/**
 * Format date and time string or Date object to Cancún local datetime string (e.g. "25/07/2026, 10:30 PM")
 */
export function formatCancunDateTime(dateInput?: string | Date | null): string {
  if (!dateInput) return 'N/A';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return 'N/A';
  try {
    const formatted = d.toLocaleString('es-MX', {
      timeZone: CANCUN_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return normalizeIntlStr(formatted);
  } catch (e) {
    return 'N/A';
  }
}

/**
 * Format time string or Date object to Cancún local time string (e.g. "10:30:15 p.m.")
 */
export function formatCancunTime(dateInput?: string | Date | null): string {
  if (!dateInput) return 'N/A';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return 'N/A';
  try {
    const formatted = d.toLocaleTimeString('es-MX', {
      timeZone: CANCUN_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    return normalizeIntlStr(formatted);
  } catch (e) {
    return 'N/A';
  }
}

/**
 * Get YYYY-MM-DD key in Cancún time zone
 */
export function getCancunTodayKey(dateInput?: Date): string {
  const d = dateInput || new Date();
  try {
    const formatted = new Intl.DateTimeFormat('en-CA', {
      timeZone: CANCUN_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
    return normalizeIntlStr(formatted);
  } catch (e) {
    return d.toISOString().split('T')[0];
  }
}

/**
 * Format relative calendar day label in Cancún time zone
 */
export function formatCancunCalendarDayLabel(d: Date, isToday: boolean): string {
  try {
    const formatted = d.toLocaleDateString('es-MX', {
      timeZone: CANCUN_TIMEZONE,
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
    const cleaned = normalizeIntlStr(formatted);
    return isToday ? `HOY • ${cleaned}` : cleaned;
  } catch (e) {
    return isToday ? 'HOY' : 'Fecha';
  }
}
