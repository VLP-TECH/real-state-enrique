
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
