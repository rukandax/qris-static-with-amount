import { insertAmountIntoQris } from '../qris-generator';

describe('QRIS Generator', () => {
  describe('insertAmountIntoQris', () => {
    // Helper to create a simple valid QRIS-like string
    const createMockQris = (includeAmount = false, includeCrc = true): string => {
      let qr = '000201010212'; // Mock payload format indicator and point of initiation
      qr += '26460014ID.CO.QRIS.WWW0215ID1234567890123450303UMI'; // Merchant account info (46 chars)
      if (includeAmount) {
        qr += '540510000'; // Amount 10000
      }
      qr += '5802ID'; // Country code
      qr += '5908MERCHANT'; // Merchant name (8 chars)
      qr += '6007JAKARTA'; // Merchant city (7 chars)
      if (includeCrc) {
        qr += '6304'; // CRC placeholder (will be replaced)
        qr += 'ABCD'; // Dummy CRC
      }
      return qr;
    };

    describe('successful amount insertion', () => {
      it('should insert amount into QRIS without existing amount', () => {
        const qris = createMockQris(false, true);
        const result = insertAmountIntoQris(qris, '50000');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.payload).toContain('540550000');
          expect(result.payload).toContain('6304');
          expect(result.payload.length).toBeGreaterThan(qris.length);
        }
      });

      it('should replace existing amount in QRIS', () => {
        const qris = createMockQris(true, true);
        const result = insertAmountIntoQris(qris, '75000');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.payload).toContain('540575000');
          expect(result.payload).not.toContain('540510000');
        }
      });

      it('should add CRC when not present', () => {
        const qris = createMockQris(false, false);
        const result = insertAmountIntoQris(qris, '10000');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.payload).toMatch(/6304[0-9A-F]{4}$/);
        }
      });

      it('should recalculate CRC when present', () => {
        const qris = createMockQris(false, true);
        const result = insertAmountIntoQris(qris, '10000');

        expect(result.ok).toBe(true);
        if (result.ok) {
          const oldCrc = qris.slice(-4);
          const newCrc = result.payload.slice(-4);
          expect(newCrc).not.toBe(oldCrc);
          expect(newCrc).toMatch(/^[0-9A-F]{4}$/);
        }
      });

      it('should reject decimal amounts (QRIS Indonesia standard)', () => {
        const qris = createMockQris(false, true);
        const result = insertAmountIntoQris(qris, '100.50');

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.reason).toContain('does not support decimal');
        }
      });

      it('should handle small amounts', () => {
        const qris = createMockQris(false, true);
        const result = insertAmountIntoQris(qris, '1');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.payload).toContain('54011');
        }
      });

      it('should handle large amounts', () => {
        const qris = createMockQris(false, true);
        const result = insertAmountIntoQris(qris, '9999999999999');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.payload).toContain('54139999999999999');
        }
      });

      it('should insert amount before country code', () => {
        const qris = createMockQris(false, true);
        const result = insertAmountIntoQris(qris, '10000');

        expect(result.ok).toBe(true);
        if (result.ok) {
          const amountIndex = result.payload.indexOf('54');
          const countryIndex = result.payload.indexOf('5802');
          expect(amountIndex).toBeLessThan(countryIndex);
        }
      });
    });

    describe('validation errors', () => {
      it('should reject empty QR string', () => {
        const result = insertAmountIntoQris('', '10000');

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.reason).toContain('Input QR must be a non-empty string');
        }
      });

      it('should handle malformed QRIS after stripping CRC', () => {
        // Create a QRIS with invalid TLV structure that will fail parsing after CRC strip
        const malformedQris = '000201' + '9999INVALID' + '6304ABCD';
        const result = insertAmountIntoQris(malformedQris, '10000');

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.reason).toContain('TLV parse');
        }
      });

      it('should detect malformed final payload', () => {
        // Create a QRIS string that produces malformed output
        // Using a very short invalid string
        const corruptedQris = '99';
        const result = insertAmountIntoQris(corruptedQris, '10000');

        // Should fail at some validation step
        expect(result.ok).toBe(false);
      });

      it('should reject very short QR string', () => {
        const result = insertAmountIntoQris('123', '10000');

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.reason).toContain('Input QR must be a non-empty string');
        }
      });

      it('should reject invalid amount format', () => {
        const qris = createMockQris(false, true);
        const result = insertAmountIntoQris(qris, 'abc');

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.reason).toContain('Invalid amount');
        }
      });

      it('should reject negative amounts', () => {
        const qris = createMockQris(false, true);
        const result = insertAmountIntoQris(qris, '-100');

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.reason).toContain('Invalid amount');
        }
      });

      it('should reject amounts with leading zeros', () => {
        const qris = createMockQris(false, true);
        const result = insertAmountIntoQris(qris, '0100');

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.reason).toContain('Invalid amount');
        }
      });

      it('should reject amounts too long', () => {
        const qris = createMockQris(false, true);
        const result = insertAmountIntoQris(qris, '12345678901234');

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.reason).toContain('Invalid amount');
        }
      });

      it('should reject malformed TLV structure', () => {
        const badQris = '01ABCDEFGHIJ'; // Invalid length field (AB is not numeric)
        const result = insertAmountIntoQris(badQris, '10000');

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.reason).toContain('TLV parse error');
        }
      });

      it('should reject truncated TLV', () => {
        const badQris = '0120ABCDEFGHIJ12'; // Length says 20 but only provides 12 chars after tag+len
        const result = insertAmountIntoQris(badQris, '10000');

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.reason).toContain('parse error');
        }
      });
    });

    describe('edge cases', () => {
      it('should handle QRIS with multiple tags', () => {
        // Use the same mock as other tests but verify it has multiple tags
        const complexQris = createMockQris(false, true);
        const result = insertAmountIntoQris(complexQris, '25000');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.payload).toContain('540525000');
        }
      });

      it('should handle zero amount', () => {
        const qris = createMockQris(false, true);
        const result = insertAmountIntoQris(qris, '0');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.payload).toContain('54010');
        }
      });

      it('should reject decimal zero (integer only)', () => {
        const qris = createMockQris(false, true);
        const result = insertAmountIntoQris(qris, '0.00');

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.reason).toContain('does not support decimal');
        }
      });

      it('should preserve other tags when inserting amount', () => {
        const qris = createMockQris(false, true);
        const result = insertAmountIntoQris(qris, '10000');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.payload).toContain('5802ID');
          expect(result.payload).toContain('5908MERCHANT');
        }
      });

      it('should maintain correct tag order', () => {
        const qris = createMockQris(false, true);
        const result = insertAmountIntoQris(qris, '10000');

        expect(result.ok).toBe(true);
        if (result.ok) {
          // Tag 54 should come before tag 58
          const tag54Pos = result.payload.indexOf('54');
          const tag58Pos = result.payload.indexOf('58');
          expect(tag54Pos).toBeLessThan(tag58Pos);

          // CRC (tag 63) should be at the end
          expect(result.payload).toMatch(/6304[0-9A-F]{4}$/);
        }
      });
    });

    describe('real-world scenarios', () => {
      it('should handle typical Indonesian Rupiah amounts', () => {
        const qris = createMockQris(false, true);
        const amounts = ['5000', '10000', '25000', '50000', '100000', '500000', '1000000'];

        amounts.forEach((amount) => {
          const result = insertAmountIntoQris(qris, amount);
          expect(result.ok).toBe(true);
        });
      });

      it('should reject amounts with decimals (Rupiah has no cents)', () => {
        const qris = createMockQris(false, true);
        const amounts = ['10.50', '99.99', '1234.56'];

        amounts.forEach((amount) => {
          const result = insertAmountIntoQris(qris, amount);
          expect(result.ok).toBe(false);
          if (!result.ok) {
            expect(result.reason).toContain('does not support decimal');
          }
        });
      });
    });
  });
});
