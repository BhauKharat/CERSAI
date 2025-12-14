export interface DateUtils {
  /**
   * Formats a date (string|Date|number) into "DD/MM/YYYY hh:mmAM/PM".
   * Returns '-' for invalid/empty input.
   */
  formatDate(input?: string | Date | number | null): string;

  /** Formats only the date part "DD/MM/YYYY" */
  formatOnlyDate(input?: string | Date | number | null): string;

  /** Formats only the time part "hh:mmAM/PM" */
  formatOnlyTime(input?: string | Date | number | null): string;

  /** Parses input into a Date object (in UTC if no timezone provided). Returns null if invalid. */
  parseToDate(input?: string | Date | number | null): Date | null;

  /** Returns true if the input represents a valid Date */
  isValid(input?: string | Date | number | null): boolean;
}

const KOLKATA_TZ = 'Asia/Kolkata';

// Intl formatter instances (reused to avoid creating them on every call)
// const dateTimeFormatter = new Intl.DateTimeFormat('en-IN', {
//   timeZone: KOLKATA_TZ,
//   year: 'numeric',
//   month: '2-digit',
//   day: '2-digit',
//   hour: '2-digit',
//   minute: '2-digit',
//   hour12: true,
// });

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  timeZone: KOLKATA_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const timeFormatter = new Intl.DateTimeFormat('en-IN', {
  timeZone: KOLKATA_TZ,
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

/**
 * Robust parser:
 * - Accepts Date, number (ms epoch), or string
 * - If string has no timezone, treats as UTC by appending 'Z' after replacing space->T
 * - Returns null for invalid dates
 */
export const parseToDate = (
  input?: string | Date | number | null
): Date | null => {
  if (input == null || input === '') return null;
  if (input instanceof Date) {
    if (isNaN(input.getTime())) return null;
    return input;
  }
  if (typeof input === 'number') {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }
  // string case
  const s = String(input).trim();
  if (s === '') return null;

  // detect timezone info:
  // ends with 'Z' or contains +hh:mm or -hh:mm or +hhmm or -hhmm
  const tzRegex = /Z$|[+-]\d{2}:\d{2}$|[+-]\d{4}$/i;
  let normalized = s;
  if (!tzRegex.test(s)) {
    // replace space with T for formats like "2025-11-21 07:09:46.875702"
    normalized = s.replace(' ', 'T') + 'Z';
  }

  const dt = new Date(normalized);
  return isNaN(dt.getTime()) ? null : dt;
};

/** Common: extract parts from Intl.formatToParts */
const getParts = (formatter: Intl.DateTimeFormat, date: Date) => {
  const parts = formatter.formatToParts(date);
  const byType: Record<string, string> = {};
  for (const p of parts) {
    if (p.type !== 'literal') byType[p.type] = p.value;
  }
  return byType;
};

export const formatDate = (input?: string | Date | number | null): string => {
  if (!input) return '-';

  let date: Date;

  if (input instanceof Date) {
    if (isNaN(input.getTime())) return '-';
    date = input;
  } else if (typeof input === 'number') {
    date = new Date(input);
  } else {
    const s = input.trim();
    if (!s) return '-';

    // Convert "2025-11-21 07:09:46.875702" → "2025-11-21T07:09:46.875702"
    const normalized = s.replace(' ', 'T');

    date = new Date(normalized);
  }

  if (isNaN(date.getTime())) return '-';

  return formatIST(date);
};

const formatIST = (date: Date): string => {
  const d = new Date(date); // no timezone conversion

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;

  return `${day}/${month}/${year} ${hours}:${minutes}${ampm}`;
};

export const formatOnlyDate = (
  input?: string | Date | number | null
): string => {
  const date = parseToDate(input);
  if (!date) return '-';
  const p = getParts(dateFormatter, date);
  return `${p.day ?? ''}/${p.month ?? ''}/${p.year ?? ''}`;
};

export const formatOnlyTime = (
  input?: string | Date | number | null
): string => {
  const date = parseToDate(input);
  if (!date) return '-';
  const p = getParts(timeFormatter, date);
  return `${p.hour ?? ''}:${p.minute ?? ''}${(p.dayPeriod ?? '').toUpperCase()}`;
};

export const isValid = (input?: string | Date | number | null): boolean => {
  return parseToDate(input) !== null;
};

// Default export implementing DateUtils
const DateUtilsImpl: DateUtils = {
  formatDate,
  formatOnlyDate,
  formatOnlyTime,
  parseToDate,
  isValid,
};

export default DateUtilsImpl;
