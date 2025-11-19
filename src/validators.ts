import { QRIS_CONSTRAINTS } from './constants';
import { ValidationResult } from './types';

/**
 * Validates QRIS amount format (integers only, no decimals).
 *
 * QRIS Indonesia requires integer amounts only - Rupiah has no minor units.
 *
 * @param amount - Amount string to validate
 * @returns `true` if valid, `false` otherwise
 *
 * @example
 * isAsciiNumericAmount("10000") // true - Rp 10.000
 * isAsciiNumericAmount("10.50") // false - no decimals allowed
 * isAsciiNumericAmount("0100")  // false - no leading zeros
 */
export function isAsciiNumericAmount(amount: string): boolean {
  const { MAX_AMOUNT_LENGTH } = QRIS_CONSTRAINTS;

  // Must not be empty and not exceed max length
  if (amount.length === 0 || amount.length > MAX_AMOUNT_LENGTH) {
    return false;
  }

  // Must be digits only (NO decimal point for QRIS Indonesia)
  if (!/^\d+$/.test(amount)) {
    return false;
  }

  // Disallow leading zeros unless exactly "0"
  if (amount.length > 1 && amount[0] === '0') {
    return false;
  }

  return true;
}

/**
 * Validates amount string for QRIS tag 54 (Transaction Amount).
 *
 * @param amount - Amount string (1-13 digits, no decimals)
 * @returns Validation result with error reason if invalid
 */
export function validateAmountForTag54(amount: string): ValidationResult {
  if (!isAsciiNumericAmount(amount)) {
    return {
      ok: false,
      reason: `Amount must be digits only (integers), length 1..${QRIS_CONSTRAINTS.MAX_AMOUNT_LENGTH}, no leading zeros. QRIS Indonesia does not support decimal amounts.`,
    };
  }

  return { ok: true };
}
