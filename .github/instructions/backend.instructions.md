# Rust Backend Instructions

## Overview
The backend is a REST API server built with Axum, providing CRUD operations for a TODO application with SQLite persistence.

## Architecture Guidelines

### Module Organization
- `main.rs`: Application entry point, server setup, and database pool initialization
- `handlers.rs`: HTTP request handlers, routing, and response formatting
- `database.rs`: Data models, database operations, and connection management

### Key Patterns to Follow

#### Error Handling
```rust
// Use Result types consistently
pub fn example_operation(pool: &DbPool) -> Result<Todo, Box<dyn std::error::Error + Send + Sync>> {
    let conn = pool.get()?;
    // ... operation
    Ok(result)
}

// In handlers, convert to HTTP status codes
match database::example_operation(&pool) {
    Ok(result) => Ok(Json(result)),
    Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
}
```

#### Database Operations
```rust
// Use the pool pattern consistently
let conn = pool.get()?;
let mut stmt = conn.prepare("SELECT ... FROM todos WHERE ...")?;
// Use parameterized queries
stmt.query_map([&param], |row| { ... })?;
```

#### Handler Functions
```rust
// Follow this signature pattern for handlers
async fn handler_name(
    State(pool): State<DbPool>,
    Path(id): Path<String>,
    Json(data): Json<RequestType>,
) -> Result<Json<ResponseType>, (StatusCode, Json<Value>)> {
    // Implementation
}
```

## Database Schema Reference
```sql
CREATE TABLE todos (
    id TEXT PRIMARY KEY,        -- UUID v4
    title TEXT NOT NULL,
    description TEXT,           -- Can be empty string for None
    completed BOOLEAN NOT NULL DEFAULT 0,  -- 0 = false, 1 = true
    created_at TEXT NOT NULL    -- RFC3339 format
);
```

## API Conventions

### Request/Response Types
- Use `CreateTodo` for POST requests (no id, created_at)
- Use `UpdateTodo` for PUT requests (all fields optional)
- Use `Todo` for responses (complete object)

### Status Codes
- 200 OK: Successful GET, PUT operations
- 201 Created: Successful POST operations
- 404 Not Found: Resource not found
- 500 Internal Server Error: Database or server errors

### URL Patterns
- `GET /api/todos` - List all todos
- `POST /api/todos` - Create new todo
- `GET /api/todos/:id` - Get specific todo
- `PUT /api/todos/:id` - Update specific todo
- `DELETE /api/todos/:id` - Delete specific todo

## Development Practices

### Adding New Endpoints
1. Define data types in `database.rs`
2. Implement database operations in `database.rs`
3. Add handler function in `handlers.rs`
4. Add route to router in `create_router()`

### Database Best Practices
- Always use parameterized queries
- Handle connection pool errors with `?` operator
- Use prepared statements for complex queries
- Convert SQLite boolean integers (0/1) to Rust bool

### Type Conversions
```rust
// Boolean handling for SQLite
completed: row.get::<_, i32>(3)? != 0,  // Read from DB
&if completed { "1" } else { "0" }.to_string()  // Write to DB

// Option<String> handling for description
description: {
    let desc: String = row.get(2)?;
    if desc.is_empty() { None } else { Some(desc) }
}
```

## Testing Commands
```bash
# Check compilation
cargo check

# Run with output
cargo run

# Format code
cargo fmt

# Lint code
cargo clippy
```

## Common Modifications

### Adding New Fields to Todo
1. Update `Todo`, `CreateTodo`, `UpdateTodo` structs
2. Modify database schema creation in `create_pool()`
3. Update all database query functions
4. Update handlers to handle new fields

### Adding New Entity Type
1. Create new structs in `database.rs`
2. Add table creation to `create_pool()`
3. Implement CRUD operations
4. Add handlers in `handlers.rs`
5. Add routes to `create_router()`