/**
 * QRIS Static with Amount - TypeScript library for QRIS amount insertion.
 *
 * @packageDocumentation
 *
 * @example
 * ```ts
 * import { insertAmountIntoQris } from 'qris-static-with-amount';
 *
 * const result = insertAmountIntoQris(staticQris, "50000");
 * if (result.ok) {
 *   console.log(result.payload); // QRIS with amount
 * }
 * ```
 */

export { insertAmountIntoQris } from './qris-generator';
export { computeCrc16CcittHex } from './crc';
export { parseTlvStructure, stripExistingCrc } from './tlv-parser';
export { validateAmountForTag54, isAsciiNumericAmount } from './validators';
export { QRIS_TAGS, QRIS_CONSTRAINTS } from './constants';

export type {
  QrisResult,
  SuccessResult,
  ErrorResult,
  ValidationResult,
  TlvElement,
  TlvParseResult,
  ParseResult,
  ParseError,
  CrcStripResult,
} from './types';
