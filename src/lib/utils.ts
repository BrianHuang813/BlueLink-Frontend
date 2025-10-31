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

/**
 * Calculate redemption amount (principal + simple interest)
 * @param principal Amount invested (in MIST)
 * @param annualInterestRate Annual interest rate in basis points (e.g., 500 = 5%)
 * @param purchaseDate Purchase date timestamp in ms
 * @param maturityDate Maturity date timestamp in ms
 * @returns Redemption amount in MIST
 */
export function calculateRedemptionAmount(
  principal: number,
  annualInterestRate: number,
  purchaseDate: number,
  maturityDate: number
): number {
  const currentTime = Date.now();
  const effectiveMaturity = Math.min(currentTime, maturityDate);
  
  // Calculate time held in days
  const timeHeldMs = effectiveMaturity - purchaseDate;
  const timeHeldDays = timeHeldMs / (1000 * 60 * 60 * 24);
  
  // Simple interest calculation: principal * rate * time / (365 * 10000)
  // rate is in basis points (10000 basis points = 100%)
  const interest = (principal * annualInterestRate * timeHeldDays) / (365 * 10000);
  
  return Math.floor(principal + interest);
}

/**
 * Calculate expected interest for a bond token
 */
export function calculateExpectedInterest(
  principal: number,
  annualInterestRate: number,
  purchaseDate: number,
  maturityDate: number
): number {
  const redemptionAmount = calculateRedemptionAmount(
    principal,
    annualInterestRate,
    purchaseDate,
    maturityDate
  );
  return redemptionAmount - principal;
}
