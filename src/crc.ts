/**
 * CRC-16/CCITT implementation for QRIS checksum validation.
 * Uses polynomial 0x1021 with initial value 0xFFFF per EMVCo specification.
 */

const CRC16_POLY = 0x1021;
const CRC16_INIT = 0xffff;
const CRC16_OUTPUT_LENGTH = 4;

/**
 * Computes CRC-16/CCITT checksum for QRIS string.
 *
 * @param inputAscii - ASCII string to compute CRC over
 * @returns 4-character uppercase hexadecimal CRC value
 */
export function computeCrc16CcittHex(inputAscii: string): string {
  let crc = CRC16_INIT;
  const buffer = Buffer.from(inputAscii, 'ascii');

  for (let i = 0; i < buffer.length; i++) {
    crc ^= buffer[i] << 8;

    for (let bit = 0; bit < 8; bit++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) & 0xffff) ^ CRC16_POLY;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(CRC16_OUTPUT_LENGTH, '0');
}
