/**
 * Type definitions for QRIS TLV operations
 */

export type ValidationResult = { ok: true } | { ok: false; reason: string };

export interface TlvElement {
  tag: string;
  len: number;
  value: string;
  start: number;
  end: number;
}

export interface ParseResult {
  ok: true;
  elements: TlvElement[];
}

export interface ParseError {
  ok: false;
  reason: string;
}

export type TlvParseResult = ParseResult | ParseError;

export interface CrcStripResult {
  base: string;
  hadCrc: boolean;
  oldCrc?: string;
}

export interface SuccessResult {
  ok: true;
  payload: string;
}

export interface ErrorResult {
  ok: false;
  reason: string;
}

export type QrisResult = SuccessResult | ErrorResult;
