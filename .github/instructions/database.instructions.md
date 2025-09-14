# Database Instructions

## Overview
The application uses SQLite as its database with R2D2 connection pooling for efficient connection management. All database operations are centralized in the `database.rs` module.

## Database Schema

### Current Schema
```sql
CREATE TABLE todos (
    id TEXT PRIMARY KEY,        -- UUID v4 format
    title TEXT NOT NULL,        -- Todo title
    description TEXT,           -- Optional description (can be empty)
    completed BOOLEAN NOT NULL DEFAULT 0,  -- 0 = false, 1 = true
    created_at TEXT NOT NULL    -- RFC3339 timestamp format
);
```

### Data Types and Constraints
- **id**: UUID v4 as TEXT, primary key
- **title**: Required text field, cannot be NULL
- **description**: Optional text, can be empty string or contain description
- **completed**: Boolean stored as INTEGER (0/1), defaults to 0 (false)
- **created_at**: ISO 8601 timestamp string in RFC3339 format

## Connection Management

### Pool Configuration
```rust
pub type DbPool = Pool<SqliteConnectionManager>;

pub fn create_pool() -> Result<DbPool, r2d2::Error> {
    let manager = SqliteConnectionManager::file("todos.db");
    let pool = Pool::new(manager)?;
    
    // Schema initialization happens here
    let conn = pool.get().unwrap();
    conn.execute(/* CREATE TABLE */, []).unwrap();
    
    Ok(pool)
}
```

### Connection Usage Pattern
```rust
pub fn database_operation(pool: &DbPool) -> Result<T, Box<dyn std::error::Error + Send + Sync>> {
    let conn = pool.get()?;  // Get connection from pool
    
    // Use connection for operations
    let result = conn.execute(/* query */, /* params */)?;
    
    Ok(result)  // Connection automatically returned to pool
}
```

## CRUD Operations

### Create (INSERT)
```rust
pub fn create_todo(pool: &DbPool, create_todo: CreateTodo) -> Result<Todo, Box<dyn std::error::Error + Send + Sync>> {
    let conn = pool.get()?;
    let id = uuid::Uuid::new_v4().to_string();
    let created_at = chrono::Utc::now().to_rfc3339();
    
    conn.execute(
        "INSERT INTO todos (id, title, description, completed, created_at) VALUES (?1, ?2, ?3, ?4, ?5)",
        [&id, &create_todo.title, &description, &"0", &created_at],
    )?;
    
    // Return the created todo
}
```

### Read (SELECT)
```rust
pub fn get_todos(pool: &DbPool) -> Result<Vec<Todo>, Box<dyn std::error::Error + Send + Sync>> {
    let conn = pool.get()?;
    let mut stmt = conn.prepare("SELECT id, title, description, completed, created_at FROM todos ORDER BY created_at DESC")?;
    
    let todos = stmt.query_map([], |row| {
        Ok(Todo {
            id: row.get(0)?,
            title: row.get(1)?,
            description: {
                let desc: String = row.get(2)?;
                if desc.is_empty() { None } else { Some(desc) }
            },
            completed: row.get::<_, i32>(3)? != 0,
            created_at: row.get(4)?,
        })
    })?;
    
    // Collect results
}
```

### Update (UPDATE)
```rust
pub fn update_todo(pool: &DbPool, id: &str, update: UpdateTodo) -> Result<Option<Todo>, Box<dyn std::error::Error + Send + Sync>> {
    let conn = pool.get()?;
    
    // Build dynamic query based on provided fields
    let mut updates = Vec::new();
    let mut params: Vec<String> = Vec::new();
    
    if let Some(title) = update.title {
        updates.push("title = ?");
        params.push(title);
    }
    // ... handle other optional fields
    
    let query = format!("UPDATE todos SET {} WHERE id = ?", updates.join(", "));
    conn.execute(&query, params_as_refs)?;
}
```

### Delete (DELETE)
```rust
pub fn delete_todo(pool: &DbPool, id: &str) -> Result<bool, Box<dyn std::error::Error + Send + Sync>> {
    let conn = pool.get()?;
    let rows_affected = conn.execute("DELETE FROM todos WHERE id = ?1", [id])?;
    Ok(rows_affected > 0)
}
```

## Data Type Mappings

### Rust to SQLite
```rust
// String/Text
let title: String = "Todo title".to_string();
// -> TEXT in SQLite

// Option<String> to TEXT
let description = match create_todo.description {
    Some(desc) => desc,
    None => String::new(),  // Empty string for None
};

// bool to INTEGER
let completed_int = if completed { "1" } else { "0" };
// -> BOOLEAN (stored as INTEGER 0/1) in SQLite

// UUID to TEXT
let id = uuid::Uuid::new_v4().to_string();
// -> TEXT PRIMARY KEY in SQLite

// DateTime to TEXT
let created_at = chrono::Utc::now().to_rfc3339();
// -> TEXT in RFC3339 format in SQLite
```

### SQLite to Rust
```rust
// TEXT to String
let title: String = row.get(1)?;

// TEXT to Option<String>
let description: Option<String> = {
    let desc: String = row.get(2)?;
    if desc.is_empty() { None } else { Some(desc) }
};

// INTEGER to bool
let completed: bool = row.get::<_, i32>(3)? != 0;

// TEXT to String (for timestamps)
let created_at: String = row.get(4)?;
```

## Query Patterns

### Parameterized Queries (Always Use)
```rust
// Correct - parameterized
conn.execute("SELECT * FROM todos WHERE id = ?1", [&id])?;

// NEVER do this - SQL injection risk
// conn.execute(&format!("SELECT * FROM todos WHERE id = '{}'", id))?;
```

### Prepared Statements
```rust
let mut stmt = conn.prepare("SELECT * FROM todos WHERE completed = ?1")?;
let todos = stmt.query_map([&completed_value], |row| {
    // Row mapping logic
})?;
```

### Dynamic Queries
```rust
// For updates with optional fields
let mut updates = Vec::new();
let mut params: Vec<String> = Vec::new();

if let Some(title) = update.title {
    updates.push("title = ?");
    params.push(title);
}

if !updates.is_empty() {
    let query = format!("UPDATE todos SET {} WHERE id = ?", updates.join(", "));
    params.push(id.to_string());
    
    let param_refs: Vec<&dyn rusqlite::ToSql> = params.iter()
        .map(|p| p as &dyn rusqlite::ToSql)
        .collect();
    conn.execute(&query, param_refs.as_slice())?;
}
```

## Error Handling

### Standard Error Type
```rust
type DbResult<T> = Result<T, Box<dyn std::error::Error + Send + Sync>>;

pub fn operation(pool: &DbPool) -> DbResult<Todo> {
    let conn = pool.get()?;  // R2D2 error
    let result = conn.execute(/* query */)?;  // SQLite error
    Ok(result)
}
```

### Error Conversion
Errors are automatically converted:
- R2D2 connection errors -> `Box<dyn Error>`
- SQLite errors -> `Box<dyn Error>`
- UUID parsing errors -> `Box<dyn Error>`

## Performance Considerations

### Connection Pool Sizing
- Default R2D2 pool size is usually adequate
- Connections are automatically managed
- Don't hold connections longer than necessary

### Query Optimization
- Use prepared statements for repeated queries
- Use appropriate indexes (SQLite automatically indexes PRIMARY KEY)
- Limit result sets when possible
- Use transactions for multiple related operations

### Batch Operations
```rust
// For multiple inserts, consider using a transaction
let conn = pool.get()?;
let tx = conn.transaction()?;

for todo in todos {
    tx.execute(/* INSERT */, /* params */)?;
}

tx.commit()?;
```

## Schema Evolution

### Adding New Columns
```sql
-- Add migration logic to create_pool() function
ALTER TABLE todos ADD COLUMN priority INTEGER DEFAULT 1;
```

### Handling Schema Changes
1. Update `CREATE TABLE` statement in `create_pool()`
2. Add migration logic for existing databases
3. Update Rust structs (`Todo`, `CreateTodo`, `UpdateTodo`)
4. Update all query functions
5. Test with existing data

## Testing Database Operations

### Manual Testing
```bash
# Run application
cargo run

# Database file is created as todos.db
# Use SQLite CLI to inspect:
sqlite3 todos.db
.schema
SELECT * FROM todos;
```

### Integration Testing
Database operations can be tested by creating temporary databases or using in-memory SQLite (`:memory:`).