# QRIS Static with Amount

A fully type-safe TypeScript library for inserting transaction amounts into static QRIS (Quick Response Code Indonesian Standard) strings.

## Features

- ✅ **Fully Type-Safe**: Written in TypeScript with strict type checking
- ✅ **EMVCo Compliant**: Follows EMVCo QR Code Specification for TLV structure
- ✅ **QRIS Indonesia Standard**: Complies with Bank Indonesia QRIS specification
- ✅ **Integer Amounts Only**: Enforces QRIS standard (no decimal/fractional amounts)
- ✅ **CRC-16/CCITT**: Automatic CRC recalculation for data integrity
- ✅ **Comprehensive Validation**: Validates both input QRIS and amount format
- ✅ **Zero Dependencies**: No external runtime dependencies
- ✅ **Well Tested**: 97%+ test coverage with 81 comprehensive tests
- ✅ **Modular Design**: Clean separation of concerns
- ✅ **MIT Licensed**: 100% free and open source

## Installation

```bash
npm install qris-static-with-amount
```

## Usage

### Basic Example

```typescript
import { insertAmountIntoQris } from 'qris-static-with-amount';

// Your static QRIS string (without amount)
const staticQris = '00020101021226580014ID.CO.QRIS.WWW0215ID12345678901234503031235802ID5912MERCHANT_NAME6014JAKARTA_SELATAN6304ABCD';

// Insert amount
const result = insertAmountIntoQris(staticQris, '50000');

if (result.ok) {
  console.log('New QRIS with amount:', result.payload);
  // Use result.payload for payment
} else {
  console.error('Error:', result.reason);
}
```

### With Decimal Amounts

**Note**: QRIS Indonesia standard does NOT support decimal amounts. Indonesian Rupiah has no minor units (cents).

```typescript
// ❌ WRONG - Decimals not supported
const result = insertAmountIntoQris(staticQris, '100.50');

// ✅ CORRECT - Integer only
const result = insertAmountIntoQris(staticQris, '100');
```

### Type-Safe Error Handling

```typescript
import { insertAmountIntoQris, QrisResult } from 'qris-static-with-amount';

function processPayment(qris: string, amount: string): string {
  const result: QrisResult = insertAmountIntoQris(qris, amount);
  
  if (result.ok) {
    return result.payload;
  } else {
    throw new Error(`QRIS generation failed: ${result.reason}`);
  }
}
```

## API Reference

### `insertAmountIntoQris(originalQr: string, amount: string): QrisResult`

Inserts or updates the transaction amount in a QRIS string.

**Parameters:**
- `originalQr` (string): The original QRIS string in TLV format
- `amount` (string): The transaction amount as integer string (e.g., "10000" for Rp 10.000)

**Returns:** `QrisResult`
- Success: `{ ok: true, payload: string }`
- Error: `{ ok: false, reason: string }`

**Amount Validation Rules:**
- Must be numeric digits only (0-9)
- NO decimal point (Indonesian Rupiah has no cents)
- Length: 1-13 characters
- No leading zeros (except "0")
- Examples: "1000", "50000", "1000000"
- Represents amount in Rupiah (e.g., "10000" = Rp 10.000)

**Important**: Indonesian Rupiah has no minor units (no sen/cents). Amounts must be whole numbers only.

### Other Exported Functions

```typescript
// Validate amount format
import { validateAmountForTag54, isAsciiNumericAmount } from 'qris-static-with-amount';

// Parse TLV structure
import { parseTlvStructure } from 'qris-static-with-amount';

// Compute CRC
import { computeCrc16CcittHex } from 'qris-static-with-amount';

// Constants
import { QRIS_TAGS, QRIS_CONSTRAINTS } from 'qris-static-with-amount';
```

## How It Works

1. **Validates** the input QRIS string structure (TLV format)
2. **Validates** the amount format
3. **Removes** existing CRC tag (63) if present
4. **Removes** existing amount tag (54) to avoid duplication
5. **Inserts** new amount tag (54) before country code (58) or merchant name (59)
6. **Computes** CRC-16/CCITT checksum
7. **Appends** new CRC tag (63) at the end

## TLV Structure

QRIS uses Tag-Length-Value (TLV) encoding:
- **Tag**: 2 characters (e.g., "54" for amount)
- **Length**: 2 decimal digits (e.g., "05" for 5 characters)
- **Value**: Variable length data

Example: `540510000` = Tag 54, Length 05, Value "10000"

## Important Notes

⚠️ **Testing Required**: This library does not contact banks or payment processors. Always test the generated QRIS with your target e-wallet applications before production use.

⚠️ **Static QRIS Only**: This library is designed for static QRIS. Dynamic QRIS may have different requirements.

⚠️ **Amount Format**: Use string format for amounts to preserve precision (e.g., "100.50" not 100.5).

## Development

### Install Dependencies

```bash
npm install
```

### Build

```bash
npm run build
```

### Run Tests

```bash
npm test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Lint

```bash
npm run lint
```

### Format

```bash
npm run format
```

## Project Structure

```
src/
├── index.ts              # Main entry point
├── qris-generator.ts     # Core QRIS generation logic
├── constants.ts          # QRIS constants and constraints
├── types.ts              # TypeScript type definitions
├── validators.ts         # Amount validation
├── crc.ts               # CRC-16/CCITT implementation
├── tlv-parser.ts        # TLV parsing utilities
├── tlv-builder.ts       # TLV building utilities
└── __tests__/           # Test files
    ├── qris-generator.test.ts
    ├── validators.test.ts
    ├── crc.test.ts
    ├── tlv-parser.test.ts
    └── tlv-builder.test.ts
```

## License

**MIT License** - 100% Free and Open Source

This library is licensed under the MIT License, which means:

✅ **Free to use** - Personal and commercial projects  
✅ **Free to modify** - Adapt to your needs  
✅ **Free to distribute** - Share with others  
✅ **No warranty** - Provided "as is"  
✅ **Zero dependencies** - No license conflicts (devDependencies only used for development)

See [LICENSE](LICENSE) file for full details.

## Contributing

Contributions are welcome! Please ensure all tests pass and add tests for new features.

## References

- [EMVCo QR Code Specification](https://www.emvco.com/emv-technologies/qrcodes/)
- [QRIS Standard - Bank Indonesia](https://www.bi.go.id/qris)
