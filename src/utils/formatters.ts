export const formatCurrency = (amount: number | undefined | null, currency: string | undefined | null): string => {
  // Valores por defecto
  const safeAmount = amount || 0;
  const safeCurrency = currency || 'EUR';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: safeCurrency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(safeAmount);
};

export const safeDateParser = (dateString: string | null): Date | null => {
  if (!dateString) return null;

  try {
    const base = dateString.split('.')[0];

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
