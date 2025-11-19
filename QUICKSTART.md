# Quick Start Guide

## Installation

```bash
npm install qris-static-with-amount
```

## Basic Usage

```typescript
import { insertAmountIntoQris } from 'qris-static-with-amount';

// Your static QRIS from merchant/payment gateway
const staticQRIS = '00020101021226...6304XXXX';

// Add amount (Rp 50,000)
const result = insertAmountIntoQris(staticQRIS, '50000');

if (result.ok) {
  console.log('✅ QRIS with amount:', result.payload);
  // Display QR code to customer
} else {
  console.error('❌ Error:', result.reason);
}
```

## Common Use Cases

### 1. E-Commerce Checkout

```typescript
function generatePaymentQRIS(orderId: string, total: number): string {
  const merchantStaticQRIS = getMerchantQRIS(); // from config/database
  
  // QRIS Indonesia: Amount must be integer (no decimals)
  // Round to nearest Rupiah if needed
  const amount = Math.round(total).toString();
  
  const result = insertAmountIntoQris(merchantStaticQRIS, amount);
  
  if (!result.ok) {
    throw new Error(`Failed to generate QRIS: ${result.reason}`);
  }
  
  return result.payload;
}
```

### 2. Point of Sale (POS) System

```typescript
async function processTransaction(cart: CartItem[]): Promise<void> {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalWithTax = Math.round(subtotal * 1.10); // Add 10% tax, round to integer
  
  const result = insertAmountIntoQris(MERCHANT_QRIS, totalWithTax.toString());
  
  if (result.ok) {
    await displayQRCode(result.payload);
    await waitForPayment();
  }
}
```

### 3. Invoice/Bill Payment

```typescript
interface Invoice {
  id: string;
  amount: number;
  currency: string;
}

function createPaymentQR(invoice: Invoice): string {
  if (invoice.currency !== 'IDR') {
    throw new Error('Only IDR currency supported');
  }
  
  const result = insertAmountIntoQris(
    COMPANY_STATIC_QRIS,
    invoice.amount.toString()
  );
  
  return result.ok ? result.payload : '';
}
```

## Amount Format

**IMPORTANT**: QRIS Indonesia follows Bank Indonesia standard - amounts must be **integers only** (no decimals).

✅ Valid formats:
- `"10000"` - Rp 10.000
- `"1"` - Rp 1
- `"9999999999999"` - Max 13 digits
- `"0"` - Zero amount

❌ Invalid formats:
- `"10.000"` - NO decimal points
- `"10,000"` - NO comma separators
- `"-100"` - NO negative amounts
- `"0100"` - NO leading zeros
- `"10.50"` - NO fractional amounts (Rupiah has no cents)
- `"abc"` - Must be numeric

## Error Handling

```typescript
const result = insertAmountIntoQris(qris, amount);

if (!result.ok) {
  // Handle specific errors
  if (result.reason.includes('Invalid amount')) {
    console.error('Amount format is incorrect');
  } else if (result.reason.includes('TLV parse error')) {
    console.error('QRIS format is invalid');
  } else {
    console.error('Unknown error:', result.reason);
  }
}
```

## TypeScript Types

```typescript
import type { QrisResult, ValidationResult } from 'qris-static-with-amount';

// QrisResult is either:
// { ok: true; payload: string } 
// or
// { ok: false; reason: string }

function handleQRIS(result: QrisResult): void {
  if (result.ok) {
    // TypeScript knows result.payload exists
    displayQR(result.payload);
  } else {
    // TypeScript knows result.reason exists
    showError(result.reason);
  }
}
```

## Testing Your Integration

```typescript
import { insertAmountIntoQris } from 'qris-static-with-amount';

// Test with small amount first
const testResult = insertAmountIntoQris(yourQRIS, '1000');

if (testResult.ok) {
  console.log('✅ Integration working');
  console.log('Generated QRIS length:', testResult.payload.length);
  console.log('Contains amount tag (54):', testResult.payload.includes('54'));
  console.log('Contains CRC tag (63):', testResult.payload.match(/6304[0-9A-F]{4}$/));
} else {
  console.error('❌ Integration failed:', testResult.reason);
}
```

## Important Notes

⚠️ **QRIS Indonesia Standard**: Amounts must be **integers only**. Indonesian Rupiah has no minor units (cents). Use whole numbers: "10000" not "10000.00".

⚠️ **Always Test**: Test the generated QRIS with actual e-wallet apps (GoPay, OVO, Dana, ShopeePay, etc.) before going to production.

⚠️ **Static QRIS Only**: This library is for static QRIS. Dynamic QRIS may require different handling.

⚠️ **Amount Limits**: Check with your payment provider for minimum/maximum transaction limits.

⚠️ **CRC Validation**: The library automatically recalculates CRC checksums for data integrity.

## Next Steps

- Read the full [README.md](./README.md) for detailed API documentation
- Check [examples/basic-usage.ts](./examples/basic-usage.ts) for more examples
- Review source code for advanced use cases

## Support

For issues, questions, or contributions, please visit the project repository.
