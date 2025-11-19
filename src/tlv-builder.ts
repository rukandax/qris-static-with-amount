import { QRIS_TAGS } from './constants';
import { parseTlvStructure, findTag } from './tlv-parser';

/**
 * Builds TLV-encoded string from tag and value.
 *
 * @param tag - 2-character tag identifier
 * @param value - Value to encode
 * @returns TLV string: tag + length (2 digits) + value
 */
export function buildTlv(tag: string, value: string): string {
  const length = value.length.toString().padStart(2, '0');
  return `${tag}${length}${value}`;
}

/**
 * Inserts tag 54 (Transaction Amount) at the correct position in QRIS string.
 *
 * @param baseNoCrc - QRIS string without CRC tag
 * @param amount - Transaction amount value
 * @returns QRIS string with tag 54 inserted
 *
 * @remarks
 * Insertion follows QRIS Indonesia standard tag order:
 * Inserts before tag 55/56/57/58/59/60 (whichever appears first), or appends at end.
 */
export function insertOrReplaceTag54(baseNoCrc: string, amount: string): string {
  const tlv54 = buildTlv(QRIS_TAGS.TRANSACTION_AMOUNT, amount);

  // Parse the base string to get proper TLV element positions
  const parseResult = parseTlvStructure(baseNoCrc);
  if (!parseResult.ok) {
    // If parsing fails, fallback to simple append
    return baseNoCrc + tlv54;
  }

  const elements = parseResult.elements;

  // Find insertion point based on tag priority
  const priorityTags = [
    QRIS_TAGS.TIP_INDICATOR,
    QRIS_TAGS.CONVENIENCE_FEE_FIXED,
    QRIS_TAGS.CONVENIENCE_FEE_PERCENTAGE,
    QRIS_TAGS.COUNTRY_CODE,
    QRIS_TAGS.MERCHANT_NAME,
    QRIS_TAGS.MERCHANT_CITY,
  ];

  for (const targetTag of priorityTags) {
    const element = findTag(elements, targetTag);
    if (element) {
      // Insert before this tag
      return baseNoCrc.slice(0, element.start) + tlv54 + baseNoCrc.slice(element.start);
    }
  }

  // Fallback: append at the end
  return baseNoCrc + tlv54;
}
