import { QRIS_TAGS } from './constants';
import { parseTlvStructure, findTag } from './tlv-parser';

/**
 * Builds a TLV string for a given tag and value
 */
export function buildTlv(tag: string, value: string): string {
  const length = value.length.toString().padStart(2, '0');
  return `${tag}${length}${value}`;
}

/**
 * Inserts or replaces tag 54 (Transaction Amount) in the base string
 *
 * Based on QRIS Indonesia standard, tag order should be:
 * - Tag 52 (Merchant Category Code) - optional
 * - Tag 53 (Transaction Currency) - should exist for proper QRIS
 * - Tag 54 (Transaction Amount) - inserted here
 * - Tag 55-57 (Tip/Fee indicators) - optional
 * - Tag 58 (Country Code) - required
 * - Tag 59 (Merchant Name) - required
 *
 * Insertion priority based on parsed TLV elements:
 * 1. Before tag 55/56/57 (if exists)
 * 2. Before tag 58 (Country Code)
 * 3. Before tag 59 (Merchant Name)
 * 4. At the end of the string
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
