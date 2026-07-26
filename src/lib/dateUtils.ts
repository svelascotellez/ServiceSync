// Timezone constant for Cancún / Quintana Roo (UTC-5)
export const CANCUN_TIMEZONE = 'America/Cancun';

/**
 * Format date string or Date object to Cancún local date string (e.g. "25/07/2026")
 */
export function formatCancunDate(dateInput?: string | Date | null): string {
  if (!dateInput) return 'Sin fecha';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return 'Fecha inválida';
  return d.toLocaleDateString('es-MX', {
    timeZone: CANCUN_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Format date and time string or Date object to Cancún local datetime string (e.g. "25/07/2026, 10:30 PM")
 */
export function formatCancunDateTime(dateInput?: string | Date | null): string {
  if (!dateInput) return 'N/A';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleString('es-MX', {
    timeZone: CANCUN_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format time string or Date object to Cancún local time string (e.g. "10:30:15 PM")
 */
export function formatCancunTime(dateInput?: string | Date | null): string {
  if (!dateInput) return 'N/A';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleTimeString('es-MX', {
    timeZone: CANCUN_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

/**
 * Get YYYY-MM-DD key in Cancún time zone
 */
export function getCancunTodayKey(dateInput?: Date): string {
  const d = dateInput || new Date();
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: CANCUN_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/**
 * Format relative calendar day label in Cancún time zone
 */
export function formatCancunCalendarDayLabel(d: Date, isToday: boolean): string {
  const formatted = d.toLocaleDateString('es-MX', {
    timeZone: CANCUN_TIMEZONE,
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
  return isToday ? `HOY • ${formatted}` : formatted;
}
