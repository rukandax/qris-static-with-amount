import { QRIS_CONSTRAINTS } from './constants';
import { ValidationResult } from './types';

/**
 * Validates if a string is a valid QRIS amount
 *
 * IMPORTANT: QRIS Indonesia standard requires INTEGER ONLY (no decimals)
 *
 * Rules based on Bank Indonesia QRIS Standard:
 * - Must contain only digits (0-9)
 * - NO decimal point allowed (Rupiah has no minor units/cents)
 * - Length between 1 and 13 characters
 * - No leading zeros (except exactly "0")
 * - Represents amount in Rupiah (e.g., "10000" = Rp 10.000)
 *
 * Examples:
 * ✅ "10000" - Rp 10.000
 * ✅ "1" - Rp 1
 * ✅ "9999999999999" - max 13 digits
 * ❌ "10.50" - NO decimals allowed
 * ❌ "10,000" - NO separators
 * ❌ "0100" - NO leading zeros
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
 * Validates amount string for QRIS tag 54
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
