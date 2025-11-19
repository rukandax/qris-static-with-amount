# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-19

### Added
- Initial release of QRIS Static with Amount library
- Full TypeScript support with strict type checking
- QRIS Indonesia standard compliance (integer amounts only)
- EMVCo QR Code specification compliance
- TLV parsing and building utilities
- CRC-16/CCITT automatic recalculation
- Comprehensive validation for QRIS and amount format
- 97%+ test coverage with 81 tests
- Zero runtime dependencies
- Complete documentation (README, QUICKSTART, API docs)
- MIT License

### Features
- `insertAmountIntoQris()` - Main function to insert/update amount in QRIS
- `validateAmountForTag54()` - Amount validation per QRIS standard
- `computeCrc16CcittHex()` - CRC checksum calculation
- `parseTlvStructure()` - TLV structure parsing
- Support for all Indonesian e-wallets (GoPay, OVO, Dana, ShopeePay, etc.)
- Type-safe discriminated union return types
- Comprehensive error messages

### Documentation
- README.md with usage examples
- QUICKSTART.md for quick onboarding
- JSDoc comments for all public APIs
- TypeScript type definitions
- Example code

[1.0.0]: https://github.com/rukandax/qris-static-with-amount/releases/tag/v1.0.0
