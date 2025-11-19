/**
 * Example usage of the QRIS library
 * Run with: ts-node examples/basic-usage.ts
 */

import { insertAmountIntoQris } from '../src/index';

// Example 1: Basic usage with a mock static QRIS
function basicExample(): void {
  console.log('=== Example 1: Basic Usage ===\n');

  // Mock static QRIS (in real scenario, this would come from your payment gateway)
  const staticQris = '000201010212' +
    '26580014ID.CO.QRIS.WWW0215ID12345678901234503031235802ID' +
    '5912MERCHANT_NAME' +
    '6014JAKARTA_SELATAN' +
    '6304ABCD';

  const amount = '50000';

  console.log('Original QRIS:', staticQris);
  console.log('Amount:', amount);

  const result = insertAmountIntoQris(staticQris, amount);

  if (result.ok) {
    console.log('\n✅ Success!');
    console.log('New QRIS:', result.payload);
    console.log('Length:', result.payload.length);
  } else {
    console.log('\n❌ Error:', result.reason);
  }
}

// Example 2: Handling decimal amounts
function decimalExample(): void {
  console.log('\n\n=== Example 2: Decimal Amount ===\n');

  const staticQris = '000201010212' +
    '26580014ID.CO.QRIS.WWW0215ID12345678901234503031235802ID' +
    '5912MERCHANT_NAME' +
    '6304ABCD';

  const amount = '99.50';

  const result = insertAmountIntoQris(staticQris, amount);

  if (result.ok) {
    console.log('✅ Decimal amount inserted successfully');
    console.log('Amount:', amount);
    console.log('Result contains amount tag:', result.payload.includes('540599.50'));
  }
}

// Example 3: Error handling
function errorHandlingExample(): void {
  console.log('\n\n=== Example 3: Error Handling ===\n');

  const staticQris = '000201010212' +
    '26580014ID.CO.QRIS.WWW0215ID12345678901234503031235802ID' +
    '5912MERCHANT_NAME' +
    '6304ABCD';

  const invalidAmounts = [
    'abc',           // Non-numeric
    '-100',          // Negative
    '0100',          // Leading zeros
    '100.123',       // Too many decimals
    '12345678901234' // Too long
  ];

  invalidAmounts.forEach((amount) => {
    const result = insertAmountIntoQris(staticQris, amount);
    console.log(`Amount "${amount}":`, result.ok ? '✅ Valid' : `❌ ${result.reason}`);
  });
}

// Example 4: Replacing existing amount
function replaceAmountExample(): void {
  console.log('\n\n=== Example 4: Replace Existing Amount ===\n');

  // QRIS that already has an amount
  const qrisWithAmount = '000201010212' +
    '26580014ID.CO.QRIS.WWW0215ID12345678901234503031235405100005802ID' +
    '5912MERCHANT_NAME' +
    '6304ABCD';

  console.log('Original QRIS contains amount tag 54:', qrisWithAmount.includes('540510000'));

  const newAmount = '75000';
  const result = insertAmountIntoQris(qrisWithAmount, newAmount);

  if (result.ok) {
    console.log('✅ Amount replaced successfully');
    console.log('Old amount (10000) present:', result.payload.includes('540510000'));
    console.log('New amount (75000) present:', result.payload.includes('540575000'));
  }
}

// Example 5: Real-world payment flow
function paymentFlowExample(): void {
  console.log('\n\n=== Example 5: Payment Flow Simulation ===\n');

  interface PaymentRequest {
    merchantQris: string;
    itemName: string;
    price: string;
  }

  function generatePaymentQris(request: PaymentRequest): string | null {
    const result = insertAmountIntoQris(request.merchantQris, request.price);

    if (result.ok) {
      console.log(`✅ Payment QRIS generated for ${request.itemName}`);
      return result.payload;
    } else {
      console.error(`❌ Failed to generate QRIS: ${result.reason}`);
      return null;
    }
  }

  const merchantQris = '000201010212' +
    '26580014ID.CO.QRIS.WWW0215ID12345678901234503031235802ID' +
    '5912MERCHANT_NAME' +
    '6304ABCD';

  const payments: PaymentRequest[] = [
    { merchantQris, itemName: 'Coffee', price: '25000' },
    { merchantQris, itemName: 'Lunch', price: '50000' },
    { merchantQris, itemName: 'Book', price: '125000.50' },
  ];

  payments.forEach((payment, index) => {
    console.log(`\nPayment ${index + 1}:`);
    const qris = generatePaymentQris(payment);
    if (qris) {
      console.log(`QRIS length: ${qris.length} characters`);
    }
  });
}

// Run all examples
console.log('╔════════════════════════════════════════════════════════╗');
console.log('║  QRIS Static with Amount - Usage Examples             ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

basicExample();
decimalExample();
errorHandlingExample();
replaceAmountExample();
paymentFlowExample();

console.log('\n\n✅ All examples completed!\n');
