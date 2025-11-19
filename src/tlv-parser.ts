import { QRIS_CONSTRAINTS, QRIS_TAGS } from './constants';
import { TlvParseResult, TlvElement, CrcStripResult } from './types';

/**
 * Parses TLV (Tag-Length-Value) structure from QRIS string.
 *
 * @param qr - QRIS string to parse
 * @returns Parse result with elements array or error reason
 *
 * @remarks
 * TLV format: TAG (2 chars) + LENGTH (2 digits) + VALUE (LENGTH chars)
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
 * Strips CRC tag (63) from end of QRIS string if present.
 *
 * @param qr - QRIS string potentially containing CRC
 * @returns Base string without CRC, and whether CRC was found
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
 * Finds specific tag in parsed TLV elements.
 *
 * @param elements - Array of parsed TLV elements
 * @param tag - Tag identifier to find (e.g., "54", "58")
 * @returns TLV element if found, undefined otherwise
 */
export function findTag(elements: TlvElement[], tag: string): TlvElement | undefined {
  return elements.find((element) => element.tag === tag);
}

/**
 * Removes tag from QRIS string using element position.
 *
 * @param baseString - Original QRIS string
 * @param element - TLV element to remove
 * @returns QRIS string with element removed
 */
export function removeTag(baseString: string, element: TlvElement): string {
  return baseString.slice(0, element.start) + baseString.slice(element.end);
}

/**
 * Finds insertion point for tag 54 in QRIS string.
 *
 * @param baseString - QRIS string without CRC
 * @param targetTag - Tag to search for (58 or 59)
 * @returns Position index, or -1 if not found
 *
 * @deprecated Use parsed TLV elements with findTag instead for accuracy
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
