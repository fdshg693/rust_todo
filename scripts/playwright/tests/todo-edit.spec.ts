import { test, expect } from '@playwright/test';

// Use serial mode to avoid race conditions between tests
test.describe.configure({ mode: 'serial' });

test.describe('Todo Inline Editing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');
  });

  test('should display Edit button on todo items', async ({ page }) => {
    // Create a unique todo
    const uniqueTodoName = `Edit Button Test ${Date.now()}`;
    
    // Add a new todo
    const input = page.locator('input[type="text"]').first();
    await input.fill(uniqueTodoName);
    await page.getByRole('button', { name: /add|追加/i }).click();
    
    // Wait for todo to be added
    await expect(page.getByText(uniqueTodoName)).toBeVisible();
    
    // Verify Edit button is visible
    const todoItem = page.locator('.todo-item').filter({ hasText: uniqueTodoName });
    const editButton = todoItem.getByRole('button', { name: 'Edit' });
    await expect(editButton).toBeVisible();
    
    // Cleanup: delete the todo
    await todoItem.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText(uniqueTodoName)).not.toBeVisible();
  });

  test('should switch to edit mode when Edit button is clicked', async ({ page }) => {
    // Create a unique todo
    const uniqueTodoName = `Edit Mode Test ${Date.now()}`;
    
    // Add a new todo
    const input = page.locator('input[type="text"]').first();
    await input.fill(uniqueTodoName);
    await page.getByRole('button', { name: /add|追加/i }).click();
    
    // Wait for todo to appear
    await expect(page.getByText(uniqueTodoName)).toBeVisible();
    
    // Click the Edit button - new todos appear at top
    const todoItem = page.locator('.todo-item').first();
    await todoItem.getByRole('button', { name: 'Edit' }).click();
    
    // Verify edit form is displayed
    await expect(todoItem.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(todoItem.getByRole('button', { name: 'Cancel' })).toBeVisible();
    // Verify title input contains the todo name
    const titleInput = todoItem.getByRole('textbox', { name: 'Title' });
    await expect(titleInput).toHaveValue(uniqueTodoName);
    
    // Cleanup: cancel and delete
    await todoItem.getByRole('button', { name: 'Cancel' }).click();
    await todoItem.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText(uniqueTodoName)).not.toBeVisible();
  });

  test('should update todo title when saved', async ({ page }) => {
    // Create a unique todo
    const originalTitle = `Original Title ${Date.now()}`;
    const updatedTitle = `Updated Title ${Date.now()}`;
    
    // Add a new todo
    const input = page.locator('input[type="text"]').first();
    await input.fill(originalTitle);
    await page.getByRole('button', { name: /add|追加/i }).click();
    
    // Verify original title
    await expect(page.getByText(originalTitle)).toBeVisible();
    
    // New todos appear at top, click Edit on first item
    const todoItem = page.locator('.todo-item').first();
    await todoItem.getByRole('button', { name: 'Edit' }).click();
    
    // Update the title
    const titleInput = todoItem.getByRole('textbox', { name: 'Title' });
    await titleInput.clear();
    await titleInput.fill(updatedTitle);
    
    // Save the changes
    await todoItem.getByRole('button', { name: 'Save' }).click();
    
    // Verify the title is updated
    await expect(page.getByText(updatedTitle)).toBeVisible();
    await expect(page.getByText(originalTitle)).not.toBeVisible();
    
    // Cleanup: delete the todo (now showing text again)
    await page.locator('.todo-item').filter({ hasText: updatedTitle }).getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText(updatedTitle)).not.toBeVisible();
  });

  test('should update todo description when saved', async ({ page }) => {
    // Create a unique todo
    const uniqueTitle = `Description Test ${Date.now()}`;
    const newDescription = `New description added at ${Date.now()}`;
    
    // Add a new todo
    const input = page.locator('input[type="text"]').first();
    await input.fill(uniqueTitle);
    await page.getByRole('button', { name: /add|追加/i }).click();
    
    // Wait for todo to appear
    await expect(page.getByText(uniqueTitle)).toBeVisible();
    
    // Click Edit on first item (new todo)
    const todoItem = page.locator('.todo-item').first();
    await todoItem.getByRole('button', { name: 'Edit' }).click();
    
    // Add a description using the Description textarea
    const descriptionInput = todoItem.getByRole('textbox', { name: /description/i });
    await descriptionInput.fill(newDescription);
    
    // Save the changes
    await todoItem.getByRole('button', { name: 'Save' }).click();
    
    // Verify the description is displayed
    await expect(page.getByText(newDescription)).toBeVisible();
    
    // Cleanup: delete the todo
    await page.locator('.todo-item').filter({ hasText: uniqueTitle }).getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText(uniqueTitle)).not.toBeVisible();
  });

  test('should cancel edit and restore original values', async ({ page }) => {
    // Create a unique todo
    const originalTitle = `Cancel Test ${Date.now()}`;
    const attemptedTitle = `Should Not Appear ${Date.now()}`;
    
    // Add a new todo
    const input = page.locator('input[type="text"]').first();
    await input.fill(originalTitle);
    await page.getByRole('button', { name: /add|追加/i }).click();
    
    // Wait for todo to appear
    await expect(page.getByText(originalTitle)).toBeVisible();
    
    // Click Edit on first item
    const todoItem = page.locator('.todo-item').first();
    await todoItem.getByRole('button', { name: 'Edit' }).click();
    
    // Modify the title but don't save
    const titleInput = todoItem.getByRole('textbox', { name: 'Title' });
    await titleInput.clear();
    await titleInput.fill(attemptedTitle);
    
    // Cancel the edit
    await todoItem.getByRole('button', { name: 'Cancel' }).click();
    
    // Verify original title is still displayed
    await expect(page.getByText(originalTitle)).toBeVisible();
    await expect(page.getByText(attemptedTitle)).not.toBeVisible();
    
    // Cleanup: delete the todo
    await page.locator('.todo-item').filter({ hasText: originalTitle }).getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText(originalTitle)).not.toBeVisible();
  });

  test('should cancel edit when pressing Escape key', async ({ page }) => {
    // Create a unique todo
    const originalTitle = `Escape Key Test ${Date.now()}`;
    
    // Add a new todo
    const input = page.locator('input[type="text"]').first();
    await input.fill(originalTitle);
    await page.getByRole('button', { name: /add|追加/i }).click();
    
    // Wait for todo to appear
    await expect(page.getByText(originalTitle)).toBeVisible();
    
    // Click Edit on first item
    const todoItem = page.locator('.todo-item').first();
    await todoItem.getByRole('button', { name: 'Edit' }).click();
    
    // Verify edit form is visible (Save button indicates edit mode)
    await expect(todoItem.getByRole('button', { name: 'Save' })).toBeVisible();
    
    // Press Escape key in title input
    const titleInput = todoItem.getByRole('textbox', { name: 'Title' });
    await titleInput.press('Escape');
    
    // Verify edit form is hidden (Save button no longer visible, Edit button is)
    await expect(todoItem.getByRole('button', { name: 'Save' })).not.toBeVisible();
    await expect(todoItem.getByRole('button', { name: 'Edit' })).toBeVisible();
    
    // Cleanup: delete the todo
    await todoItem.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText(originalTitle)).not.toBeVisible();
  });

  test('should save edit when pressing Enter key in title field', async ({ page }) => {
    // Create a unique todo
    const originalTitle = `Enter Key Test ${Date.now()}`;
    const updatedTitle = `Updated via Enter ${Date.now()}`;
    
    // Add a new todo
    const input = page.locator('input[type="text"]').first();
    await input.fill(originalTitle);
    await page.getByRole('button', { name: /add|追加/i }).click();
    
    // Wait for todo to appear
    await expect(page.getByText(originalTitle)).toBeVisible();
    
    // Click Edit on first item
    const todoItem = page.locator('.todo-item').first();
    await todoItem.getByRole('button', { name: 'Edit' }).click();
    
    // Update the title and press Enter
    const titleInput = todoItem.getByRole('textbox', { name: 'Title' });
    await titleInput.clear();
    await titleInput.fill(updatedTitle);
    await titleInput.press('Enter');
    
    // Verify the title is updated
    await expect(page.getByText(updatedTitle)).toBeVisible();
    
    // Cleanup: delete the todo
    await page.locator('.todo-item').filter({ hasText: updatedTitle }).getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText(updatedTitle)).not.toBeVisible();
  });

  test('should not allow saving with empty title', async ({ page }) => {
    // Create a unique todo
    const originalTitle = `Empty Title Test ${Date.now()}`;
    
    // Add a new todo
    const input = page.locator('input[type="text"]').first();
    await input.fill(originalTitle);
    await page.getByRole('button', { name: /add|追加/i }).click();
    
    // Wait for todo to appear
    await expect(page.getByText(originalTitle)).toBeVisible();
    
    // Click Edit on first item
    const todoItem = page.locator('.todo-item').first();
    await todoItem.getByRole('button', { name: 'Edit' }).click();
    
    // Clear the title
    const titleInput = todoItem.getByRole('textbox', { name: 'Title' });
    await titleInput.clear();
    
    // Verify Save button is disabled
    const saveButton = todoItem.getByRole('button', { name: 'Save' });
    await expect(saveButton).toBeDisabled();
    
    // Cleanup: cancel and delete
    await todoItem.getByRole('button', { name: 'Cancel' }).click();
    await todoItem.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText(originalTitle)).not.toBeVisible();
  });
});
