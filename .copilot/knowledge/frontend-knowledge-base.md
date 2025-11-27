# Frontend Knowledge Base - Vue.js 3 + TypeScript TODO Application

## Overview

Vue.js 3 + TypeScript + Pinia + Webpack構成のフロントエンド。
バックエンドAPI: `http://localhost:3030`

---

## Project Structure

```
frontend/
├── src/
│   ├── main.ts              # アプリエントリーポイント
│   ├── App.vue              # ルートコンポーネント（Storeを使用）
│   ├── api/
│   │   └── todoApi.ts       # API層（fetchラッパー、ApiErrorクラス）
│   ├── components/
│   │   ├── AddTodo.vue      # Todo追加フォーム
│   │   ├── TodoItem.vue     # 単一Todo表示
│   │   └── TodoList.vue     # リストコンテナ
│   ├── stores/
│   │   └── todo.ts          # Pinia store（Composition API形式）
│   └── types/
│       └── todo.ts          # TypeScript型定義
├── static/                   # Webpackビルド出力
```

---

## プロジェクト固有の型定義

`types/todo.ts`で定義されている型：
- `Todo`: id, title, description(nullable), completed, created_at
- `TodoInput`: title, description(optional)
- `TodoUpdate`: completed

APIからのnullableフィールドは `string | null` を使用。

---

## API層

`api/todoApi.ts`:
- `ApiError`クラス: statusCode, responseプロパティを持つカスタムエラー
- `fetchWithErrorHandling<T>`: 型安全なfetchラッパー
- DELETE操作は204 No Contentを返す

---

## Pinia Store

`stores/todo.ts`:
- Composition API形式（setup function syntax）
- State: `todos`, `loading`, `error`
- Getters: `completedTodos`, `activeTodos`, `todosCount`
- Actions: `fetchTodos`, `addTodo`, `toggleTodo`, `deleteTodo`, `clearError`

---

## コンポーネント階層

```
App.vue (Storeを直接使用)
├── AddTodo.vue (emits: 'add')
├── TodoList.vue (props: todos, emits: 'toggle', 'delete' をバブリング)
│   └── TodoItem.vue (emits: 'toggle', 'delete')
```

- **Store使用はApp.vueのみ**
- 子コンポーネントはprops/emitで通信

---

## Path Alias

`@/` → `src/` へのエイリアス設定済み（tsconfig.json, webpack.config.js両方で設定）

---

## 開発サーバー

- フロントエンド: `localhost:3000`（webpack-dev-server）
- APIプロキシ: `/api` → `http://localhost:3030`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/todos` | 全Todo取得 |
| POST | `/api/todos` | Todo作成 |
| PUT | `/api/todos/:id` | Todo更新 |
| DELETE | `/api/todos/:id` | Todo削除 |

---

## コマンド

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 (localhost:3000) |
| `npm run build` | プロダクションビルド (static/bundle.js) |
| `npm test` | Jestテスト実行 |
