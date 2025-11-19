import { QRIS_CONSTRAINTS, QRIS_TAGS } from './constants';
import { TlvParseResult, TlvElement, CrcStripResult } from './types';

/**
 * Parses TLV (Tag-Length-Value) structure from QRIS string
 * Format: TAG (2 chars) + LENGTH (2 decimal digits) + VALUE (LENGTH chars)
 */
export function parseTlvStructure(qr: string): TlvParseResult {
  const elements: TlvElement[] = [];
  let position = 0;

  try {
    while (position < qr.length) {
      const remainingLength = qr.length - position;

      // Check if we have enough characters for tag and length
      if (remainingLength < QRIS_CONSTRAINTS.TAG_LENGTH + QRIS_CONSTRAINTS.LENGTH_FIELD_SIZE) {
        return {
          ok: false,
          reason: `Truncated TLV header at position ${position}`,
        };
      }

      const tag = qr.substring(position, position + QRIS_CONSTRAINTS.TAG_LENGTH);
      const lengthString = qr.substring(
        position + QRIS_CONSTRAINTS.TAG_LENGTH,
        position + QRIS_CONSTRAINTS.TAG_LENGTH + QRIS_CONSTRAINTS.LENGTH_FIELD_SIZE
      );

      // Validate length field is numeric
      if (!/^\d{2}$/.test(lengthString)) {
        return {
          ok: false,
          reason: `Invalid length field for tag ${tag} at position ${position + QRIS_CONSTRAINTS.TAG_LENGTH}`,
        };
      }

      const length = parseInt(lengthString, 10);
      const valueStart =
        position + QRIS_CONSTRAINTS.TAG_LENGTH + QRIS_CONSTRAINTS.LENGTH_FIELD_SIZE;
      const valueEnd = valueStart + length;

      // Validate value doesn't exceed string boundary
      if (valueEnd > qr.length) {
        return {
          ok: false,
          reason: `Value for tag ${tag} exceeds string length (expected end at ${valueEnd}, total length ${qr.length})`,
        };
      }

      const value = qr.substring(valueStart, valueEnd);

      elements.push({
        tag,
        len: length,
        value,
        start: position,
        end: valueEnd,
      });

      position = valueEnd;
    }

    return { ok: true, elements };
  } catch (error) {
    return {
      ok: false,
      reason: `Exception parsing TLV: ${String(error)}`,
    };
  }
}

/**
 * Removes existing CRC tag (63) if present at the end of the string
 * @returns Object containing base string without CRC, whether CRC was found, and old CRC value
 */
export function stripExistingCrc(qr: string): CrcStripResult {
  const crcTag = QRIS_TAGS.CRC;
  const crcIndex = qr.indexOf(crcTag);

  if (crcIndex === -1) {
    return { base: qr, hadCrc: false };
  }

  // Validate length field exists and is numeric
  const headerEnd = crcIndex + QRIS_CONSTRAINTS.TAG_LENGTH + QRIS_CONSTRAINTS.LENGTH_FIELD_SIZE;
  if (headerEnd > qr.length) {
    return { base: qr, hadCrc: false };
  }

  const lengthString = qr.substring(crcIndex + QRIS_CONSTRAINTS.TAG_LENGTH, headerEnd);
  if (!/^\d{2}$/.test(lengthString)) {
    return { base: qr, hadCrc: false };
  }

  const length = parseInt(lengthString, 10);
  const valueStart = headerEnd;
  const valueEnd = valueStart + length;

  // CRC must be at the terminal position
  if (valueEnd !== qr.length) {
    return { base: qr, hadCrc: false };
  }

  const oldCrc = qr.substring(valueStart, valueEnd);
  const base = qr.substring(0, crcIndex);

  return { base, hadCrc: true, oldCrc };
}

/**
 * Finds a specific tag in the TLV structure
 */
export function findTag(elements: TlvElement[], tag: string): TlvElement | undefined {
  return elements.find((element) => element.tag === tag);
}

/**
 * Removes a specific tag from the base string using element position information
 */
export function removeTag(baseString: string, element: TlvElement): string {
  return baseString.slice(0, element.start) + baseString.slice(element.end);
}

/**
 * Finds the insertion point for tag 54 (Transaction Amount)
 * Priority: before tag 58 (Country Code) > before tag 59 (Merchant Name) > at end
 */
export function findInsertionPoint(baseString: string, targetTag: string): number {
  const tagIndex = baseString.indexOf(targetTag);

  if (tagIndex === -1) {
    return -1;
  }

  // Verify it's a valid TLV tag by checking if length field is numeric
  const lengthStart = tagIndex + QRIS_CONSTRAINTS.TAG_LENGTH;
  const lengthEnd = lengthStart + QRIS_CONSTRAINTS.LENGTH_FIELD_SIZE;

  if (lengthEnd <= baseString.length) {
    const lengthField = baseString.substring(lengthStart, lengthEnd);
    if (/^\d{2}$/.test(lengthField)) {
      return tagIndex;
    }
  }

  return -1;
}
