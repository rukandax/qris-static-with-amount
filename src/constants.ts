/**
 * QRIS tag identifiers per EMVCo QR Code and Bank Indonesia specifications.
 *
 * @see {@link https://www.emvco.com/emv-technologies/qrcodes/ | EMVCo QR Code Specification}
 * @see {@link https://www.bi.go.id/qris | QRIS Standard - Bank Indonesia}
 */

export const QRIS_TAGS = {
  MERCHANT_CATEGORY_CODE: '52',
  TRANSACTION_CURRENCY: '53',
  TRANSACTION_AMOUNT: '54',
  TIP_INDICATOR: '55',
  CONVENIENCE_FEE_FIXED: '56',
  CONVENIENCE_FEE_PERCENTAGE: '57',
  COUNTRY_CODE: '58',
  MERCHANT_NAME: '59',
  MERCHANT_CITY: '60',
  POSTAL_CODE: '61',
  CRC: '63',
} as const;

/**
 * QRIS validation constraints and format requirements.
 *
 * @remarks
 * - Indonesian Rupiah has no minor units (no cents/sen)
 * - Amounts must be integers: "10000" = Rp 10.000
 * - MAX_DECIMAL_PLACES is 0 per QRIS Indonesia standard
 */
export const QRIS_CONSTRAINTS = {
  // QRIS Indonesia: Amount should be integer only (no decimals)
  // Format: Plain numeric string representing the value in major currency units
  // For IDR: "10000" means Rp 10.000
  MAX_AMOUNT_LENGTH: 13,
  CRC_LENGTH: 4,
  TAG_LENGTH: 2,
  LENGTH_FIELD_SIZE: 2,
  MIN_QR_LENGTH: 10,
  // QRIS standard: NO decimal places for Indonesian Rupiah
  // Amount must be whole number (integer) only
  MAX_DECIMAL_PLACES: 0,
} as const;
