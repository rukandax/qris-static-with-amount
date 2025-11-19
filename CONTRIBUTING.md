# Contributing to QRIS Static with Amount

Thank you for your interest in contributing! 🎉

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Your environment (Node version, OS, etc.)

### Suggesting Features

We welcome feature suggestions! Please open an issue describing:
- The problem you're trying to solve
- Your proposed solution
- Any alternatives you've considered

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/rukandax/qris-static-with-amount.git
   cd qris-static-with-amount
   npm install
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add tests for new features
   - Update documentation

4. **Run tests**
   ```bash
   npm test
   npm run lint
   npm run build
   ```

5. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**
   - Describe your changes
   - Reference any related issues
   - Ensure all CI checks pass

## Development Setup

```bash
# Install dependencies
npm install

# Run tests in watch mode
npm run test:watch

# Check test coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format

# Build
npm run build
```

## Code Style

- Use TypeScript with strict mode
- Follow existing patterns
- Write JSDoc comments for public APIs
- Keep functions small and focused
- Prefer functional programming where appropriate

## Testing

- Write tests for all new features
- Maintain 95%+ code coverage
- Test both success and error cases
- Use descriptive test names

## Questions?

Feel free to open an issue or discussion if you have questions!

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
