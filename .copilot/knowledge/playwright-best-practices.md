# Playwright E2E Testing Best Practices

## Overview

This document outlines best practices for writing robust and reliable Playwright tests, based on lessons learned from testing the TODO application.

---

## Common Issues and Solutions

### 1. Race Conditions with Parallel Test Execution

**Problem:** When multiple tests run in parallel, they may interfere with each other by creating/modifying the same data in the database.

**Solution:** Use serial mode for tests that share state:

```typescript
// Use serial mode to avoid race conditions between tests
test.describe.configure({ mode: 'serial' });
```

### 2. Page Load Timing Issues

**Problem:** Tests may fail because they start interacting with elements before the page is fully loaded.

**Solution:** Wait for network idle state:

```typescript
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // Wait for the page to fully load
  await page.waitForLoadState('networkidle');
});
```

### 3. Element Not Found After State Change

**Problem:** After clicking a button that changes the DOM (e.g., Edit button that replaces content with a form), the original locator may no longer find the element.

**Bad Pattern:**
```typescript
// This fails because after clicking Edit, the text is now in an input field
const todoItem = page.locator('.todo-item').filter({ hasText: 'My Todo' });
await todoItem.getByRole('button', { name: 'Edit' }).click();
// The filter { hasText: 'My Todo' } may not match anymore!
await todoItem.locator('input').fill('New Title');  // FAILS
```

**Good Pattern:**
```typescript
// For newly created items that appear at top, use positional locator
const todoItem = page.locator('.todo-item').first();
await todoItem.getByRole('button', { name: 'Edit' }).click();
// Now use role-based selectors within the same element
const titleInput = todoItem.getByRole('textbox', { name: 'Title' });
await titleInput.fill('New Title');
```

### 4. Prefer Role-Based Selectors Over CSS Selectors

**Problem:** CSS class names may change, or scoped styles may affect class visibility.

**Bad Pattern:**
```typescript
await expect(todoItem.locator('.todo-edit-form')).toBeVisible();
await todoItem.locator('input#edit-title').fill('New Title');
```

**Good Pattern:**
```typescript
// Use ARIA roles which are more stable and accessible
await expect(todoItem.getByRole('button', { name: 'Save' })).toBeVisible();
await todoItem.getByRole('textbox', { name: 'Title' }).fill('New Title');
```

### 5. Always Verify State Before Interacting

**Problem:** Tests may try to interact with elements that haven't appeared yet.

**Solution:** Always wait for elements to be visible before interacting:

```typescript
// Wait for todo to appear before trying to interact
await expect(page.getByText(uniqueTodoName)).toBeVisible();

// Then find and interact with the element
const todoItem = page.locator('.todo-item').first();
await todoItem.getByRole('button', { name: 'Edit' }).click();
```

### 6. Clean Up Test Data

**Problem:** Leftover test data can cause subsequent tests to fail.

**Solution:** Always clean up created data at the end of each test:

```typescript
// Cleanup: delete the todo
await page.locator('.todo-item')
  .filter({ hasText: uniqueTitle })
  .getByRole('button', { name: 'Delete' }).click();
// Verify deletion
await expect(page.getByText(uniqueTitle)).not.toBeVisible();
```

### 7. Use Unique Identifiers for Test Data

**Problem:** Tests may conflict if they use the same test data names.

**Solution:** Use timestamps or UUIDs to generate unique names:

```typescript
const uniqueTodoName = `Edit Button Test ${Date.now()}`;
```

---

## Recommended Test Structure

```typescript
import { test, expect } from '@playwright/test';

// Enable serial execution for tests that share state
test.describe.configure({ mode: 'serial' });

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should do something', async ({ page }) => {
    // 1. Setup: Create test data with unique names
    const uniqueName = `Test ${Date.now()}`;
    
    // 2. Action: Perform the action being tested
    await page.locator('input').fill(uniqueName);
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // 3. Assertion: Verify the expected outcome
    await expect(page.getByText(uniqueName)).toBeVisible();
    
    // 4. Cleanup: Remove test data
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText(uniqueName)).not.toBeVisible();
  });
});
```

---

## Selector Priority (Most Reliable First)

1. **Role-based selectors** - Most stable, accessibility-friendly
   ```typescript
   page.getByRole('button', { name: 'Save' })
   page.getByRole('textbox', { name: 'Title' })
   ```

2. **Text-based selectors** - Good for unique text content
   ```typescript
   page.getByText('Submit')
   page.getByLabel('Email')
   ```

3. **Test ID selectors** - Explicit testing hooks
   ```typescript
   page.getByTestId('submit-button')
   ```

4. **CSS/XPath selectors** - Last resort, most fragile
   ```typescript
   page.locator('.todo-item')
   page.locator('#edit-title')
   ```

---

## Handling Dynamic Content

### When content changes after interaction:

```typescript
// Before: Element shows "View Mode"
const item = page.locator('.item').first();
await item.getByRole('button', { name: 'Edit' }).click();

// After: Element now shows "Edit Mode" - use same positional reference
await expect(item.getByRole('button', { name: 'Save' })).toBeVisible();
```

### When element position might change:

```typescript
// Bad: Assumes position
const firstItem = page.locator('.item').first();

// Good: Filter by unique content after state change
const updatedItem = page.locator('.item').filter({ hasText: updatedTitle });
await updatedItem.getByRole('button', { name: 'Delete' }).click();
```

---

## Debugging Tips

1. **Run in headed mode** to see what's happening:
   ```bash
   npx playwright test --headed
   ```

2. **Use debug mode** for step-by-step execution:
   ```bash
   npx playwright test --debug
   ```

3. **Check error context files** - Playwright generates snapshots showing page state at failure time

4. **Use single worker** to isolate issues:
   ```bash
   npx playwright test --workers=1
   ```

5. **Increase timeout** for slow operations:
   ```bash
   npx playwright test --timeout=60000
   ```
