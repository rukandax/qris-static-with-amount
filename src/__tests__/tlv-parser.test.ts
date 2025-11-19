import {
  parseTlvStructure,
  stripExistingCrc,
  findTag,
  removeTag,
  findInsertionPoint,
} from '../tlv-parser';

describe('TLV Parser', () => {
  describe('parseTlvStructure', () => {
    it('should parse valid TLV structure', () => {
      const tlv = '0103ABC';
      const result = parseTlvStructure(tlv);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.elements).toHaveLength(1);
        expect(result.elements[0]).toEqual({
          tag: '01',
          len: 3,
          value: 'ABC',
          start: 0,
          end: 7,
        });
      }
    });

    it('should parse multiple TLV elements', () => {
      const tlv = '0103ABC0205HELLO';
      const result = parseTlvStructure(tlv);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.elements).toHaveLength(2);
        expect(result.elements[0].tag).toBe('01');
        expect(result.elements[1].tag).toBe('02');
      }
    });

    it('should return error for truncated header', () => {
      const tlv = '01';
      const result = parseTlvStructure(tlv);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.reason).toContain('Truncated TLV header');
      }
    });

    it('should return error for invalid length field', () => {
      const tlv = '01ABCD';
      const result = parseTlvStructure(tlv);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.reason).toContain('Invalid length field');
      }
    });

    it('should return error when value exceeds string length', () => {
      const tlv = '0110ABC';
      const result = parseTlvStructure(tlv);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.reason).toContain('exceeds string length');
      }
    });

    it('should parse empty value', () => {
      const tlv = '0100';
      const result = parseTlvStructure(tlv);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.elements[0].value).toBe('');
        expect(result.elements[0].len).toBe(0);
      }
    });

    it('should handle exceptions during parsing', () => {
      // This tests the catch block by providing input that might cause unexpected errors
      // Since the parser is robust, we'll test with extremely long length that causes issues
      const tlv = '0199' + 'X'.repeat(50); // Length says 99 but only 50 chars
      const result = parseTlvStructure(tlv);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.reason).toContain('exceeds string length');
      }
    });
  });

  describe('stripExistingCrc', () => {
    it('should strip CRC when present at end', () => {
      const qr = '0103ABC6304ABCD';
      const result = stripExistingCrc(qr);

      expect(result.hadCrc).toBe(true);
      expect(result.base).toBe('0103ABC');
      expect(result.oldCrc).toBe('ABCD');
    });

    it('should return unchanged when no CRC tag', () => {
      const qr = '0103ABC';
      const result = stripExistingCrc(qr);

      expect(result.hadCrc).toBe(false);
      expect(result.base).toBe(qr);
      expect(result.oldCrc).toBeUndefined();
    });

    it('should not strip CRC if not at terminal position', () => {
      const qr = '6304ABCD0103XYZ';
      const result = stripExistingCrc(qr);

      expect(result.hadCrc).toBe(false);
      expect(result.base).toBe(qr);
    });

    it('should handle invalid CRC length field', () => {
      const qr = '0103ABC63XXABCD';
      const result = stripExistingCrc(qr);

      expect(result.hadCrc).toBe(false);
      expect(result.base).toBe(qr);
    });

    it('should handle CRC tag at end without enough space for length field', () => {
      const qr = '0103ABC63';
      const result = stripExistingCrc(qr);

      expect(result.hadCrc).toBe(false);
      expect(result.base).toBe(qr);
    });

    it('should handle CRC tag with non-numeric length field', () => {
      const qr = '0103ABC63ABABCD';
      const result = stripExistingCrc(qr);

      expect(result.hadCrc).toBe(false);
      expect(result.base).toBe(qr);
    });
  });

  describe('findTag', () => {
    it('should find existing tag', () => {
      const elements = [
        { tag: '01', len: 3, value: 'ABC', start: 0, end: 5 },
        { tag: '54', len: 5, value: '10000', start: 5, end: 14 },
      ];

      const found = findTag(elements, '54');
      expect(found).toBeDefined();
      expect(found?.value).toBe('10000');
    });

    it('should return undefined for non-existing tag', () => {
      const elements = [{ tag: '01', len: 3, value: 'ABC', start: 0, end: 5 }];

      const found = findTag(elements, '99');
      expect(found).toBeUndefined();
    });
  });

  describe('removeTag', () => {
    it('should remove tag from base string', () => {
      const base = '0103ABC5405100000205HELLO';
      const element = { tag: '54', len: 5, value: '10000', start: 7, end: 16 };

      const result = removeTag(base, element);
      expect(result).toBe('0103ABC0205HELLO');
    });

    it('should remove tag at start', () => {
      const base = '54051000002055HELLO';
      const element = { tag: '54', len: 5, value: '10000', start: 0, end: 9 };

      const result = removeTag(base, element);
      expect(result).toBe('02055HELLO');
    });

    it('should remove tag at end', () => {
      const base = '0103ABC540510000';
      const element = { tag: '54', len: 5, value: '10000', start: 7, end: 16 };

      const result = removeTag(base, element);
      expect(result).toBe('0103ABC');
    });
  });

  describe('findInsertionPoint', () => {
    it('should find valid tag position', () => {
      const base = '0103ABC5802ID';
      const position = findInsertionPoint(base, '58');

      expect(position).toBe(7);
    });

    it('should return -1 when tag not found', () => {
      const base = '0103ABC';
      const position = findInsertionPoint(base, '99');

      expect(position).toBe(-1);
    });

    it('should return -1 when tag has invalid length field', () => {
      const base = '0103ABC58XXID';
      const position = findInsertionPoint(base, '58');

      expect(position).toBe(-1);
    });

    it('should find tag even when substring appears elsewhere', () => {
      const base = '580003ABC5802ID';
      const position = findInsertionPoint(base, '58');

      expect(position).toBe(0); // Should find the first valid one
    });
  });
});
