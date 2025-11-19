import { buildTlv, insertOrReplaceTag54 } from '../tlv-builder';

describe('TLV Builder', () => {
  describe('buildTlv', () => {
    it('should build valid TLV string', () => {
      const result = buildTlv('54', '10000');
      expect(result).toBe('540510000');
    });

    it('should pad length to 2 digits', () => {
      const result = buildTlv('01', 'A');
      expect(result).toBe('0101A');
    });

    it('should handle empty value', () => {
      const result = buildTlv('99', '');
      expect(result).toBe('9900');
    });

    it('should handle long values', () => {
      const value = 'A'.repeat(99);
      const result = buildTlv('01', value);
      expect(result).toBe(`0199${value}`);
    });
  });

  describe('insertOrReplaceTag54', () => {
    it('should insert before country code tag (58)', () => {
      const base = '0103ABC5802ID';
      const result = insertOrReplaceTag54(base, '10000');

      expect(result).toBe('0103ABC5405100005802ID');
      expect(result.indexOf('54')).toBeLessThan(result.indexOf('58'));
    });

    it('should insert before merchant name tag (59) when no country code', () => {
      const base = '0103ABC5905TOKO1';
      const result = insertOrReplaceTag54(base, '50000');

      expect(result).toBe('0103ABC5405500005905TOKO1');
      expect(result.indexOf('54')).toBeLessThan(result.indexOf('59'));
    });

    it('should append at end when no 58 or 59 tags', () => {
      const base = '0103ABC';
      const result = insertOrReplaceTag54(base, '25000');

      expect(result).toBe('0103ABC540525000');
    });

    it('should handle large amounts', () => {
      const base = '5802ID';
      const result = insertOrReplaceTag54(base, '1000000');

      expect(result).toContain('540710000');
      expect(result).toContain('1000000');
    });

    it('should prioritize tag 58 over tag 59', () => {
      const base = '5905TOKO15802ID';
      const result = insertOrReplaceTag54(base, '1000');

      // Function searches for tag 58 first, then 59
      // When both exist, it inserts before tag 58
      expect(result).toBe('5905TOKO1540410005802ID');
    });

    it('should handle single digit amounts', () => {
      const base = '5802ID';
      const result = insertOrReplaceTag54(base, '5');

      expect(result).toBe('540155802ID');
    });

    it('should fallback to append when parsing fails', () => {
      // Create an invalid TLV string that will fail parsing
      const invalidBase = '9999INVALID';
      const result = insertOrReplaceTag54(invalidBase, '10000');

      // Should append at the end as fallback
      expect(result).toBe('9999INVALID540510000');
    });

    it('should insert before tip indicator tag (55) when present', () => {
      const base = '5501X5802ID';
      const result = insertOrReplaceTag54(base, '1000');

      expect(result).toBe('540410005501X5802ID');
      expect(result.indexOf('54')).toBeLessThan(result.indexOf('55'));
    });

    it('should insert before convenience fee tag (56) when present', () => {
      const base = '5602105802ID';
      const result = insertOrReplaceTag54(base, '1000');

      expect(result).toBe('540410005602105802ID');
      expect(result.indexOf('54')).toBeLessThan(result.indexOf('56'));
    });

    it('should insert before merchant city tag (60) when no other tags', () => {
      const base = '6007JAKARTA';
      const result = insertOrReplaceTag54(base, '5000');

      expect(result).toBe('540450006007JAKARTA');
      expect(result.indexOf('54')).toBeLessThan(result.indexOf('60'));
    });
  });
});
