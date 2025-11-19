# QRIS Static with Amount

## 🚀 Quick Links

- [NPM Package](https://www.npmjs.com/package/qris-static-with-amount)
- [Documentation](https://github.com/rukandax/qris-static-with-amount#readme)
- [Quick Start Guide](QUICKSTART.md)

## 📖 Description

TypeScript library for inserting transaction amounts into static QRIS (Quick Response Code Indonesian Standard) strings. Supports all Indonesian e-wallets: GoPay, OVO, Dana, ShopeePay, LinkAja, and more.

## ✨ Features

- ✅ Fully type-safe TypeScript
- ✅ Zero runtime dependencies
- ✅ 97%+ test coverage
- ✅ Bank Indonesia & EMVCo compliant
- ✅ MIT License

## 📦 Installation

```bash
npm install qris-static-with-amount
```

## 🎯 Usage

```typescript
import { insertAmountIntoQris } from 'qris-static-with-amount';

const result = insertAmountIntoQris(staticQris, "50000");
if (result.ok) {
  console.log(result.payload); // New QRIS with amount
}
```

## 🏷️ Topics

`qris` `qris-indonesia` `payment` `payment-gateway` `indonesia` `qr-code` `emv` `gopay` `ovo` `dana` `shopeepay` `typescript` `e-wallet` `bank-indonesia` `pos` `merchant` `static-qris`
