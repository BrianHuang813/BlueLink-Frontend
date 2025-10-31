/**
 * Utility functions for BlueLink
 */

/**
 * Convert MIST to SUI
 * 1 SUI = 1e9 MIST
 */
export function mistToSui(mist: string | number): number {
  return Number(mist) / 1e9;
}

/**
 * Convert SUI to MIST
 */
export function suiToMist(sui: string | number): number {
  return Number(sui) * 1e9;
}

/**
 * Format interest rate from basis points to percentage
 * e.g., 500 basis points = 5.00%
 */
export function formatInterestRate(bps: number): string {
  return `${(bps / 100).toFixed(2)}%`;
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(raised: number, total: number): number {
  if (total === 0) return 0;
  return Math.min((raised / total) * 100, 100);
}

/**
 * Format date from timestamp (ms)
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Format date from string (YYYY-MM-DD)
 */
export function formatDateString(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Check if bond is matured
 */
export function isBondMatured(maturityDate: string): boolean {
  return new Date(maturityDate) <= new Date();
}

/**
 * Format SUI amount with commas
 */
export function formatSuiAmount(amount: number): string {
  return amount.toLocaleString('zh-TW', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 9,
  });
}

/**
 * Truncate address for display
 */
export function truncateAddress(address: string, start = 6, end = 4): string {
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

/**
 * Calculate days until maturity
 */
export function daysUntilMaturity(maturityDate: string): number {
  const now = new Date();
  const maturity = new Date(maturityDate);
  const diffTime = maturity.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}
