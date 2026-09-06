# Master-Bot Vitest Test Suite

Automated testing harness for Master-Bot across bot commands, database models, tRPC procedures, and dashboard utilities.

---

## 🏃 Running Tests

```bash
# Run all unit and integration tests once
pnpm test

# Run tests in watch mode during development
pnpm run test:watch

# Run tests with code coverage report
pnpm run test:coverage

# Verify test type safety
pnpm run test:types
```

---

## 📂 Test Suite Structure

```text
tests/
├── unit/                  # Isolated unit tests for functions, schemas & helpers
│   ├── config.test.ts     # Configuration & feature flag validations
│   └── env.test.ts        # Environment variable parsing tests
├── integration/           # End-to-end service and API integration tests
│   └── (expanded in Phase 2)
├── helpers/               # Mock generators & test harness utilities
├── fixtures/              # Static sample payloads & JSON fixtures
└── README.md              # Test suite documentation
```
