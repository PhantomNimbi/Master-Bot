# 🧪 Template: Vitest Test Specification

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createMockRedis } from '@helix-origin/vitest-suite/storage';
import { createMockClient, createMockInteraction } from '@helix-origin/vitest-suite/discord';

describe('<Feature / Component Name>', () => {
  beforeEach(() => {
    // Setup state
  });

  afterEach(() => {
    // Clean up mocks and timers
  });

  it('should handle primary expected flow', async () => {
    // Arrange
    const client = createMockClient();

    // Act
    // ...

    // Assert
    expect(client).toBeDefined();
  });

  it('should cleanly handle errors and fallbacks', async () => {
    // Edge case / error assertions
  });
});
```
