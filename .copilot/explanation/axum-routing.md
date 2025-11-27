# Axumルーティングのメソッドチェーン解説

## 質問
`get`のあとに`post`や`put`をつなげているのがよく分からない

## 解説

### コード例
```rust
.route("/", get(get_todos_handler).post(create_todo_handler))
.route("/:id", get(get_todo_handler).put(update_todo_handler).delete(delete_todo_handler))
```

### メソッドチェーンの仕組み

Axumでは、`get()`、`post()`、`put()`、`delete()` などの関数は **`MethodRouter`** という型を返します。

```rust
pub fn get<H, T>(handler: H) -> MethodRouter<S>
```

この`MethodRouter`型には、他のHTTPメソッドを追加するためのメソッドが定義されています：

```rust
impl MethodRouter {
    pub fn post(self, handler: H) -> Self { ... }
    pub fn put(self, handler: H) -> Self { ... }
    pub fn delete(self, handler: H) -> Self { ... }
    // ... 他のHTTPメソッドも同様
}
```

### なぜこのような設計なのか

1. **同じパスに複数のHTTPメソッドを定義できる**
   - REST APIでは同じURLに対して異なるHTTPメソッドで異なる操作をすることが一般的
   - 例: `/api/todos` に対して
     - `GET` → 一覧取得
     - `POST` → 新規作成

2. **コードの可読性が高い**
   - 関連するエンドポイントをまとめて定義できる

3. **型安全性を維持**
   - チェーンの各メソッドが `MethodRouter` を返すため、コンパイル時に型チェックが行われる

### 展開された形

上記のコードは、以下のように解釈できます：

```rust
// "/" パスに対して：
// - GET リクエスト → get_todos_handler を呼び出す
// - POST リクエスト → create_todo_handler を呼び出す

// "/:id" パスに対して：
// - GET リクエスト → get_todo_handler を呼び出す
// - PUT リクエスト → update_todo_handler を呼び出す
// - DELETE リクエスト → delete_todo_handler を呼び出す
```

### 別の書き方

同じ結果を、`on()` メソッドを使って書くこともできます：

```rust
use axum::routing::MethodFilter;

Router::new()
    .route("/", 
        axum::routing::on(MethodFilter::GET, get_todos_handler)
            .on(MethodFilter::POST, create_todo_handler)
    )
```

ただし、`get().post()` の形式の方が簡潔で読みやすいため、一般的にはこちらが推奨されます。
