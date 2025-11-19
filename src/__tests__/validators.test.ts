import { isAsciiNumericAmount, validateAmountForTag54 } from '../validators';

describe('Validators', () => {
  describe('isAsciiNumericAmount', () => {
    it('should accept valid integer amounts', () => {
      expect(isAsciiNumericAmount('100')).toBe(true);
      expect(isAsciiNumericAmount('1000')).toBe(true);
      expect(isAsciiNumericAmount('999999999')).toBe(true);
      expect(isAsciiNumericAmount('1')).toBe(true);
      expect(isAsciiNumericAmount('9999999999999')).toBe(true); // 13 digits (max)
    });

    it('should accept zero', () => {
      expect(isAsciiNumericAmount('0')).toBe(true);
    });

    it('should reject decimal amounts (QRIS Indonesia standard)', () => {
      expect(isAsciiNumericAmount('100.50')).toBe(false);
      expect(isAsciiNumericAmount('1000.99')).toBe(false);
      expect(isAsciiNumericAmount('50.5')).toBe(false);
      expect(isAsciiNumericAmount('0.99')).toBe(false);
      expect(isAsciiNumericAmount('0.00')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(isAsciiNumericAmount('')).toBe(false);
    });

    it('should reject amounts longer than 13 characters', () => {
      expect(isAsciiNumericAmount('12345678901234')).toBe(false);
    });

    it('should reject amounts with leading zeros', () => {
      expect(isAsciiNumericAmount('01')).toBe(false);
      expect(isAsciiNumericAmount('001')).toBe(false);
      expect(isAsciiNumericAmount('0123')).toBe(false);
    });

    it('should reject any decimal point (QRIS standard)', () => {
      expect(isAsciiNumericAmount('100.123')).toBe(false);
      expect(isAsciiNumericAmount('50.999')).toBe(false);
      expect(isAsciiNumericAmount('10.5')).toBe(false);
      expect(isAsciiNumericAmount('1.0')).toBe(false);
    });

    it('should reject non-numeric characters', () => {
      expect(isAsciiNumericAmount('abc')).toBe(false);
      expect(isAsciiNumericAmount('12a34')).toBe(false);
      expect(isAsciiNumericAmount('100,00')).toBe(false);
    });

    it('should reject negative numbers', () => {
      expect(isAsciiNumericAmount('-100')).toBe(false);
      expect(isAsciiNumericAmount('-50')).toBe(false);
    });

    it('should reject multiple decimal points', () => {
      expect(isAsciiNumericAmount('10.50.25')).toBe(false);
      expect(isAsciiNumericAmount('..5')).toBe(false);
    });
  });

  describe('validateAmountForTag54', () => {
    it('should return ok for valid amounts', () => {
      const result = validateAmountForTag54('10000');
      expect(result.ok).toBe(true);
    });

    it('should return error for invalid amounts', () => {
      const result = validateAmountForTag54('abc');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.reason).toContain('digits only');
      }
    });

    it('should return error for amounts with leading zeros', () => {
      const result = validateAmountForTag54('0123');
      expect(result.ok).toBe(false);
    });

    it('should reject decimal amounts (QRIS Indonesia does not support decimals)', () => {
      const result = validateAmountForTag54('100.50');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.reason).toContain('does not support decimal');
      }
    });
  });
});
