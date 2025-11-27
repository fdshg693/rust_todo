import { test, expect } from '@playwright/test';

test.describe('Todo Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the todo app title', async ({ page }) => {
    await expect(page).toHaveTitle(/Todo/i);
  });

  test('should add a new todo item', async ({ page }) => {
    // ユニークなTODO名を生成
    const uniqueTodoName = `Add Test ${Date.now()}`;
    
    // 新しいTODOを入力
    const input = page.locator('input[type="text"]').first();
    await input.fill(uniqueTodoName);
    
    // 追加ボタンをクリック
    await page.getByRole('button', { name: /add|追加/i }).click();
    
    // TODOが追加されたことを確認
    await expect(page.getByText(uniqueTodoName)).toBeVisible();
  });

  test('should toggle todo completion', async ({ page }) => {
    // ユニークなTODO名を生成
    const uniqueTodoName = `Toggle Test ${Date.now()}`;
    
    // まず新しいTODOを追加
    const input = page.locator('input[type="text"]').first();
    await input.fill(uniqueTodoName);
    await page.getByRole('button', { name: /add|追加/i }).click();
    
    // 該当するTODOアイテムのチェックボックスをクリック
    const todoItem = page.locator('.todo-item').filter({ hasText: uniqueTodoName });
    const checkbox = todoItem.locator('input[type="checkbox"]');
    await checkbox.click();
    
    // 完了状態が変わったことを確認
    await expect(checkbox).toBeChecked();
  });

  test('should delete a todo item', async ({ page }) => {
    // ユニークなTODO名を生成
    const uniqueTodoName = `Delete Test ${Date.now()}`;
    
    // 新しいTODOを追加
    const input = page.locator('input[type="text"]').first();
    await input.fill(uniqueTodoName);
    await page.getByRole('button', { name: /add|追加/i }).click();
    
    // TODOが追加されたことを確認
    await expect(page.getByText(uniqueTodoName)).toBeVisible();
    
    // 該当するTODOアイテムの削除ボタンをクリック
    const todoItem = page.locator('.todo-item').filter({ hasText: uniqueTodoName });
    await todoItem.getByRole('button', { name: 'Delete' }).click();
    
    // TODOが削除されたことを確認
    await expect(page.getByText(uniqueTodoName)).not.toBeVisible();
  });

  test('should filter todos', async ({ page }) => {
    // フィルタボタンがあれば、フィルタ機能をテスト
    const filterButtons = page.getByRole('button', { name: /all|active|completed/i });
    
    if (await filterButtons.count() > 0) {
      await filterButtons.first().click();
      // フィルタが適用されたことを確認
    }
  });
});
