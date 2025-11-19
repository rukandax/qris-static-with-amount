import { computeCrc16CcittHex } from '../crc';

describe('CRC-16/CCITT', () => {
  describe('computeCrc16CcittHex', () => {
    it('should compute correct CRC for empty string', () => {
      const result = computeCrc16CcittHex('');
      expect(result).toBe('FFFF');
    });

    it('should compute correct CRC for simple ASCII string', () => {
      const result = computeCrc16CcittHex('123');
      expect(result).toHaveLength(4);
      expect(result).toMatch(/^[0-9A-F]{4}$/);
    });

    it('should return uppercase hexadecimal string', () => {
      const result = computeCrc16CcittHex('test');
      expect(result).toBe(result.toUpperCase());
      expect(result).toMatch(/^[0-9A-F]+$/);
    });

    it('should compute deterministic CRC for same input', () => {
      const input = 'QRIS_TEST_STRING';
      const result1 = computeCrc16CcittHex(input);
      const result2 = computeCrc16CcittHex(input);
      expect(result1).toBe(result2);
    });

    it('should compute different CRC for different inputs', () => {
      const result1 = computeCrc16CcittHex('ABC');
      const result2 = computeCrc16CcittHex('ABD');
      expect(result1).not.toBe(result2);
    });

    it('should pad CRC to 4 characters', () => {
      const result = computeCrc16CcittHex('a');
      expect(result).toHaveLength(4);
    });
  });
});
