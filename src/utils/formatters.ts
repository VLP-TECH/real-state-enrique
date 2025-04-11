/**
 * Formats a number as currency
 * @param amount The amount to format
 * @param currency The currency code (e.g. USD, EUR)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Parses a date string and returns a Date object, or null if parsing fails.
 * @param dateString The date string to parse.
 * @returns A Date object or null.
 */
export const safeDateParser = (dateString: string | null): Date | null => {
  if (!dateString) return null;

  try {
    // Elimina microsegundos: deja hasta los primeros 19 caracteres
    // "2025-04-09T10:06:25.733248+00:00" → "2025-04-09T10:06:25"
    const base = dateString.split('.')[0];

    // Mantiene la zona horaria (si viene al final)
    const tz = dateString.includes('+') ? dateString.split('+')[1] : null;
    const formatted = tz ? `${base}+${tz}` : `${base}Z`;

    const date = new Date(formatted);
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.error("Error parsing date:", error);
    return null;
  }
};

export const formatDate = (dateString: string | null): string => {
  const parsed = safeDateParser(dateString);
  return parsed
    ? parsed.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Fecha inválida';
};
