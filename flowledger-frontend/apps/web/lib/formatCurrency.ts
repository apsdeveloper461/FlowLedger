const PKR_FORMATTER = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format a number as PKR currency.
 * e.g. formatPKR(1250) → "PKR 1,250.00"
 */
export function formatPKR(amount: number): string {
  return PKR_FORMATTER.format(amount);
}

/**
 * Format a number as a compact PKR string for chart tooltips.
 * e.g. formatPKRCompact(1250000) → "PKR 1.25M"
 */
export function formatPKRCompact(amount: number): string {
  if (amount >= 1_000_000) {
    return `PKR ${(amount / 1_000_000).toFixed(2)}M`;
  }
  if (amount >= 1_000) {
    return `PKR ${(amount / 1_000).toFixed(1)}K`;
  }
  return formatPKR(amount);
}
