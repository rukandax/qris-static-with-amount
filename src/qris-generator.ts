/**
 * QRIS Generator - Inserts transaction amounts into static QRIS strings.
 *
 * @module qris-generator
 *
 * @remarks
 * This module handles TLV parsing, amount insertion, and CRC recalculation
 * per EMVCo QR Code and QRIS Indonesia specifications.
 *
 * Does not communicate with banks - always test with target e-wallets.
 */

import { QRIS_TAGS, QRIS_CONSTRAINTS } from './constants';
import { QrisResult } from './types';
import { validateAmountForTag54 } from './validators';
import { computeCrc16CcittHex } from './crc';
import { parseTlvStructure, stripExistingCrc, findTag, removeTag } from './tlv-parser';
import { insertOrReplaceTag54 } from './tlv-builder';

/**
 * Inserts or updates transaction amount in QRIS string.
 *
 * @param originalQr - Original QRIS string (TLV format)
 * @param amount - Transaction amount (integer string, e.g., "10000" for Rp 10.000)
 * @returns Success with new QRIS payload, or error with reason
 *
 * @example
 * ```ts
 * const result = insertAmountIntoQris(qris, "50000");
 * if (result.ok) {
 *   displayQR(result.payload);
 * } else {
 *   console.error(result.reason);
 * }
 * ```
 */
export function insertAmountIntoQris(originalQr: string, amount: string): QrisResult {
  // Validate input
  if (typeof originalQr !== 'string' || originalQr.length < QRIS_CONSTRAINTS.MIN_QR_LENGTH) {
    return {
      ok: false,
      reason: 'Input QR must be a non-empty string of TLV data.',
    };
  }

  // Validate amount format
  const amountValidation = validateAmountForTag54(amount);
  if (!amountValidation.ok) {
    return {
      ok: false,
      reason: `Invalid amount: ${amountValidation.reason}`,
    };
  }

  // Parse original QR to validate TLV structure
  const parseResult = parseTlvStructure(originalQr);
  if (!parseResult.ok) {
    return {
      ok: false,
      reason: `Input TLV parse error: ${parseResult.reason}`,
    };
  }

  // Strip existing CRC if present
  const { base } = stripExistingCrc(originalQr);

  // Validate base string after CRC removal
  const parseBase = parseTlvStructure(base);
  if (!parseBase.ok) {
    return {
      ok: false,
      reason: `TLV parse after stripping CRC failed: ${parseBase.reason}`,
    };
  }

  // Remove existing tag 54 if present (to avoid duplication)
  let newBase = base;
  const tag54Element = findTag(parseBase.elements, QRIS_TAGS.TRANSACTION_AMOUNT);
  if (tag54Element) {
    newBase = removeTag(base, tag54Element);
  }

  // Insert new tag 54 with the amount
  newBase = insertOrReplaceTag54(newBase, amount);

  // Build CRC: compute over (newBase + '6304')
  const crcComputeString =
    newBase + QRIS_TAGS.CRC + QRIS_CONSTRAINTS.CRC_LENGTH.toString().padStart(2, '0');
  const crc = computeCrc16CcittHex(crcComputeString);

  // Build final payload
  const finalPayload =
    newBase + QRIS_TAGS.CRC + QRIS_CONSTRAINTS.CRC_LENGTH.toString().padStart(2, '0') + crc;

  // Final validation: ensure payload is well-formed
  const finalParse = parseTlvStructure(finalPayload);
  if (!finalParse.ok) {
    return {
      ok: false,
      reason: `Final payload TLV malformed after insertion: ${finalParse.reason}`,
    };
  }

  // Verify CRC tag exists and is properly formatted
  const finalElements = finalParse.elements;
  const lastElement = finalElements[finalElements.length - 1];

  if (!(lastElement.tag === QRIS_TAGS.CRC && lastElement.len === QRIS_CONSTRAINTS.CRC_LENGTH)) {
    return {
      ok: false,
      reason: 'Final payload does not end with CRC tag 63 length 04 as expected.',
    };
  }

  return { ok: true, payload: finalPayload };
}
