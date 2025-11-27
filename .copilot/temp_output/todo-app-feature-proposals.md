# TODO アプリ機能拡張提案

現在のVue 3 + TypeScript + Pinia構成のTODOアプリを進化させるための機能を3つ提案します。

---

## 📋 現在の機能概要

- TODOの追加（タイトル・説明）
- TODOの表示
- 完了/未完了の切り替え
- TODOの削除
- 基本統計表示（Total/Completed/Active）

---

## 🚀 提案機能

### 1. フィルタリング & ソート機能

#### 概要
TODOリストを「すべて / 未完了 / 完了済み」でフィルタリングし、「作成日順 / タイトル順」でソートできる機能。

#### 実装難易度
⭐⭐☆☆☆ **（初級〜中級）**

#### 実装内容
```
frontend/src/
├── components/
│   └── TodoFilter.vue        # 新規：フィルター/ソートUI
├── stores/
│   └── todo.ts               # 修正：フィルター状態とcomputedの追加
└── types/
    └── filter.ts             # 新規：フィルター関連の型定義
```

#### 学習ポイント

| ポイント | 説明 |
|---------|------|
| **Computed Properties** | `computed`を使ったリアクティブなデータ変換。フィルター条件が変わると自動的にリストが更新される仕組みを学べる |
| **TypeScript Enum / Union Types** | `type FilterType = 'all' \| 'active' \| 'completed'` のようなUnion Typeでフィルター種別を型安全に管理 |
| **コンポーネント間通信** | 親子間でのprops/emitパターンの理解深化 |
| **配列操作メソッド** | `filter()`, `sort()`, `toSorted()`などの関数型プログラミング手法 |

#### 実装例（Pinia Store拡張）
```typescript
// stores/todo.ts への追加
type FilterType = 'all' | 'active' | 'completed';
type SortType = 'created_at' | 'title';

const filter = ref<FilterType>('all');
const sortBy = ref<SortType>('created_at');

const filteredAndSortedTodos = computed(() => {
  let result = [...todos.value];
  
  // フィルタリング
  if (filter.value === 'active') {
    result = result.filter(t => !t.completed);
  } else if (filter.value === 'completed') {
    result = result.filter(t => t.completed);
  }
  
  // ソート
  return result.toSorted((a, b) => {
    if (sortBy.value === 'title') {
      return a.title.localeCompare(b.title);
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
});
```

---

### 2. ドラッグ&ドロップによる並び替え

#### 概要
TODOアイテムをドラッグ&ドロップで自由に並び替えできる機能。並び順はローカルまたはバックエンドに永続化。

#### 実装難易度
⭐⭐⭐☆☆ **（中級）**

#### 実装内容
```
frontend/
├── package.json              # 修正：vuedraggable追加
├── src/
│   ├── components/
│   │   └── TodoList.vue      # 修正：draggableコンポーネント導入
│   ├── stores/
│   │   └── todo.ts           # 修正：順序管理のstateとaction追加
│   └── types/
│       └── todo.ts           # 修正：Todoにorder/positionフィールド追加
```

#### 学習ポイント

| ポイント | 説明 |
|---------|------|
| **Vue 3でのライブラリ統合** | `vuedraggable`のようなサードパーティライブラリをComposition APIと組み合わせる方法 |
| **HTML5 Drag and Drop API** | ネイティブAPIの仕組みとライブラリによる抽象化の理解 |
| **Optimistic UI Update** | ドラッグ完了時に即座にUIを更新し、バックグラウンドでAPI同期するパターン |
| **v-model with 配列** | `v-model`を配列に対して使用する方法（双方向バインディング） |
| **デバウンス/スロットリング** | 頻繁な並び替え操作でのAPI呼び出し最適化 |

#### 実装例（TodoList.vue）
```vue
<template>
  <draggable 
    v-model="localTodos" 
    item-key="id"
    @end="onDragEnd"
    ghost-class="ghost"
  >
    <template #item="{ element }">
      <TodoItem :todo="element" @toggle="handleToggle" @delete="handleDelete" />
    </template>
  </draggable>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import draggable from 'vuedraggable';

const localTodos = ref([...props.todos]);

const onDragEnd = () => {
  emit('reorder', localTodos.value.map((t, i) => ({ id: t.id, order: i })));
};
</script>
```

---

### 3. TODO編集機能（インライン編集）

#### 概要
既存のTODOをクリックしてその場で編集できる機能。タイトルと説明の両方を編集可能に。

#### 実装難易度
⭐⭐⭐⭐☆ **（中級〜上級）**

#### 実装内容
```
frontend/src/
├── api/
│   └── todoApi.ts            # 修正：部分更新APIの追加（PATCH対応）
├── components/
│   ├── TodoItem.vue          # 修正：編集モード切り替えロジック追加
│   └── TodoEditForm.vue      # 新規：編集フォームコンポーネント
├── stores/
│   └── todo.ts               # 修正：updateTodoアクションの拡張
└── types/
    └── todo.ts               # 修正：TodoUpdateInputの型定義追加
```

#### 学習ポイント

| ポイント | 説明 |
|---------|------|
| **コンポーネント状態管理** | 表示モード↔編集モードの切り替えを`ref`で管理。ローカルステートとグローバルステートの使い分け |
| **フォームバリデーション** | 編集時のバリデーションロジック（空文字チェック、文字数制限など） |
| **キーボードイベント処理** | `@keyup.enter`、`@keyup.escape`などのキーボードショートカット対応 |
| **フォーカス管理** | `ref`と`nextTick`を使ったプログラム的なフォーカス制御 |
| **Optimistic Update** | 編集完了時に即座にUIを更新し、API失敗時にロールバックするパターン |
| **カスタムイベント設計** | 複雑なイベントペイロードの設計（`{ id, title, description }`） |

#### 実装例（TodoItem.vue拡張）
```vue
<template>
  <li :class="['todo-item', { completed: todo.completed, editing: isEditing }]">
    <!-- 表示モード -->
    <template v-if="!isEditing">
      <input type="checkbox" :checked="todo.completed" @change="handleToggle" />
      <div class="todo-content" @dblclick="startEditing">
        <div class="todo-title">{{ todo.title }}</div>
        <div v-if="todo.description" class="todo-description">
          {{ todo.description }}
        </div>
      </div>
      <button @click="handleDelete" class="delete-btn">Delete</button>
    </template>
    
    <!-- 編集モード -->
    <template v-else>
      <input 
        ref="editInput"
        v-model="editTitle" 
        @keyup.enter="saveEdit"
        @keyup.escape="cancelEdit"
        @blur="saveEdit"
      />
      <input v-model="editDescription" placeholder="Description..." />
      <button @click="saveEdit">Save</button>
      <button @click="cancelEdit">Cancel</button>
    </template>
  </li>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';

const isEditing = ref(false);
const editTitle = ref('');
const editDescription = ref('');
const editInput = ref<HTMLInputElement | null>(null);

const startEditing = () => {
  isEditing.value = true;
  editTitle.value = props.todo.title;
  editDescription.value = props.todo.description ?? '';
  nextTick(() => editInput.value?.focus());
};

const saveEdit = () => {
  if (editTitle.value.trim()) {
    emit('update', {
      id: props.todo.id,
      title: editTitle.value.trim(),
      description: editDescription.value.trim() || null,
    });
  }
  isEditing.value = false;
};
</script>
```

---

## 📊 比較表

| 機能 | 実装難易度 | 実装時間目安 | 主な学習テーマ |
|------|-----------|-------------|---------------|
| フィルタリング & ソート | ⭐⭐☆☆☆ | 2-3時間 | Computed, TypeScript型, 配列操作 |
| ドラッグ&ドロップ | ⭐⭐⭐☆☆ | 4-6時間 | ライブラリ統合, D&D API, Optimistic UI |
| インライン編集 | ⭐⭐⭐⭐☆ | 5-8時間 | 状態管理, フォーカス制御, イベント設計 |

---

## 💡 おすすめ実装順序

1. **フィルタリング & ソート** → 基礎的なVueの概念を復習しながら実装できる
2. **インライン編集** → コンポーネント設計力とUXへの配慮を学べる
3. **ドラッグ&ドロップ** → 外部ライブラリの導入とより高度なUI実装を経験

この順序で実装することで、段階的にスキルアップしながらアプリを拡張できます。

---

## 🔧 バックエンド対応について

各機能の実装には、バックエンドAPI（Rust/Axum）の修正も必要な場合があります：

| 機能 | バックエンド変更 |
|------|-----------------|
| フィルタリング & ソート | 不要（フロントエンドのみで完結可能） |
| ドラッグ&ドロップ | `Todo`にorderフィールド追加 + 並び順更新API |
| インライン編集 | PATCHエンドポイント追加（部分更新対応） |

現在のPUT `/api/todos/:id`は`completed`のみ更新対応のため、タイトル/説明の編集には拡張が必要です。
