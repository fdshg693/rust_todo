# Playwright テストガイド

## 概要

Playwright は Microsoft が開発した E2E（End-to-End）テストフレームワークです。
Chromium、Firefox、WebKit の全てのモダンブラウザでテストを実行できます。

## セットアップ

### 1. インストール

```powershell
cd scripts/playwright
npm install
npx playwright install
```

`npx playwright install` でブラウザのバイナリがダウンロードされます。

### 2. アプリケーションの起動

テストを実行する前に、アプリケーションを起動しておく必要があります。

VS Code で `Ctrl+Shift+B` を押すか、コマンドパレットから「Start All (Frontend + Backend)」タスクを実行してください。

- Frontend: http://localhost:3000
- Backend: http://localhost:3030

## テストの実行

### 基本的なコマンド

```powershell
# 全テストを実行（ヘッドレスモード）
npm test

# ブラウザを表示してテストを実行
npm run test:headed

# インタラクティブなUIモードでテストを実行
npm run test:ui

# デバッグモードでテストを実行
npm run test:debug

# テストレポートを表示
npm run report
```

### 特定のテストだけ実行

```powershell
# 特定のファイルを実行
npx playwright test tests/todo.spec.ts

# 特定のテスト名にマッチするものを実行
npx playwright test -g "should add a new todo"

# 特定のブラウザのみ
npx playwright test --project=chromium
```

## テストコードの書き方

### 基本構造

```typescript
import { test, expect } from '@playwright/test';

test.describe('機能グループ名', () => {
  test.beforeEach(async ({ page }) => {
    // 各テストの前に実行
    await page.goto('/');
  });

  test('テストケース名', async ({ page }) => {
    // テストコード
  });
});
```

### よく使うメソッド

#### ページ操作

```typescript
// ページ遷移
await page.goto('/');
await page.goto('http://localhost:3000/todos');

// クリック
await page.click('button');
await page.getByRole('button', { name: '追加' }).click();

// テキスト入力
await page.fill('input[name="title"]', 'New Todo');
await page.getByPlaceholder('タスクを入力').fill('New Todo');

// キーボード操作
await page.keyboard.press('Enter');
```

#### 要素の取得（ロケーター）

```typescript
// CSS セレクタ
page.locator('.todo-item');
page.locator('#main-input');

// ロール（推奨）
page.getByRole('button', { name: '追加' });
page.getByRole('checkbox');
page.getByRole('textbox');

// テキスト
page.getByText('完了したタスク');

// プレースホルダー
page.getByPlaceholder('新しいタスクを入力');

// テストID（data-testid属性）
page.getByTestId('todo-input');
```

#### アサーション

```typescript
// 表示確認
await expect(page.getByText('Hello')).toBeVisible();
await expect(page.getByText('Gone')).not.toBeVisible();

// 値の確認
await expect(page.locator('input')).toHaveValue('expected value');

// チェック状態
await expect(page.getByRole('checkbox')).toBeChecked();

// カウント
await expect(page.locator('.todo-item')).toHaveCount(3);

// タイトル
await expect(page).toHaveTitle(/Todo App/);

// URL
await expect(page).toHaveURL(/.*dashboard/);
```

### 待機処理

```typescript
// 要素が表示されるまで待つ
await page.waitForSelector('.loading', { state: 'hidden' });

// ネットワークリクエストを待つ
await page.waitForResponse(resp => resp.url().includes('/api/todos'));

// 時間で待つ（非推奨だが必要な場合）
await page.waitForTimeout(1000);
```

## テストの生成（Codegen）

Playwright には、ブラウザ操作を記録してテストコードを自動生成する機能があります。

```powershell
npm run codegen
```

これにより、ブラウザが開き、操作を記録できます。操作が完了したら、生成されたコードをコピーしてテストファイルに貼り付けてください。

## デバッグ

### デバッグモード

```powershell
npm run test:debug
```

- ブラウザが一時停止状態で開く
- Playwright Inspector でステップ実行可能
- `page.pause()` でブレークポイントを設定可能

### スクリーンショット

```typescript
// 手動でスクリーンショットを撮る
await page.screenshot({ path: 'screenshot.png' });

// 全画面
await page.screenshot({ path: 'full.png', fullPage: true });
```

### トレース

`playwright.config.ts` で設定：

```typescript
use: {
  trace: 'on-first-retry', // 失敗時のみ記録
  // trace: 'on',          // 常に記録
}
```

トレースファイルを見る：

```powershell
npx playwright show-trace test-results/trace.zip
```

## ベストプラクティス

1. **テストIDを使う**: 要素に `data-testid` 属性を付けて安定したセレクタを使う
2. **ロールベースのロケーターを優先**: `getByRole()` はアクセシビリティも考慮
3. **ハードコードされた待機を避ける**: `waitForTimeout` の代わりに条件付き待機を使う
4. **テストを独立させる**: 各テストは他のテストに依存しないようにする
5. **Page Object Model**: 大規模なテストでは POM パターンを使う

## トラブルシューティング

### ブラウザが見つからない

```powershell
npx playwright install
```

### タイムアウトエラー

- アプリケーションが起動しているか確認
- `playwright.config.ts` で `timeout` を増やす

### 要素が見つからない

- `page.pause()` を使って手動で確認
- ロケーターが正しいか DevTools で確認
- 動的に生成される要素は `waitForSelector` を使う
