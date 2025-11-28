# Backend Overview - Rust TODO Application

## Project Summary
A modern Rust-based REST API backend for a TODO application using Axum web framework with SQLite database. The backend demonstrates best practices in async Rust development, type safety, and REST API design.

**Project Location:** `/backend/`
**Language:** Rust (Edition 2021)
**Version:** 0.1.0

---

## Architecture Overview

### Technology Stack

**Core Technologies:**
| Component | Technology | Version |
|-----------|-----------|---------|
| Web Framework | Axum | 0.7 |
| Async Runtime | Tokio | 1.0 |
| Database | SQLite | 3.x (via rusqlite 0.31) |
| Connection Pool | r2d2 + r2d2_sqlite | 0.8 + 0.24 |
| Serialization | Serde + Serde JSON | 1.0 |
| HTTP Utilities | Tower + Tower-HTTP | 0.4 + 0.5 |
| ID Generation | UUID (v4) | 1.0 |
| DateTime | Chrono | 0.4 |

**Server Configuration:**
- Host: 127.0.0.1
- Port: 3030
- Protocol: HTTP/1.1 & HTTP/2
- CORS: Enabled (permissive layer)

---

## Directory Structure

```
backend/
├── src/
│   ├── main.rs              # Application entry point and server initialization
│   ├── database.rs          # Database models, connection pool, and CRUD operations
│   ├── handlers.rs          # API route handlers and router configuration
├── Cargo.toml               # Rust dependencies and project metadata
├── Cargo.lock               # Locked dependency versions
├── target/                  # Compiled binaries and build artifacts
└── todos.db                 # SQLite database file (auto-created)
```

---

## Module Organization

### 1. main.rs - Application Bootstrap
**Lines:** 31
**Responsibility:** Initialize application and start server

**Key Responsibilities:**
- Create database connection pool via `create_pool()`
- Build Axum router with routes and middleware
- Bind TCP listener to configured address
- Start async server with Tokio runtime

**Execution Flow:**
```
1. Initialize database pool (creates schema if needed)
2. Create HTTP router with all routes and middleware
3. Bind listener to 127.0.0.1:3030
4. Start accepting incoming HTTP requests
```

**Key Functions:**
- `#[tokio::main]` - Tokio async runtime entry point

---

### 2. database.rs - Data Access Layer
**Lines:** 193
**Responsibility:** Database operations, connection management, CRUD functions

#### Data Models

**Todo Struct**
```rust
pub struct Todo {
    pub id: String,              // UUID-based unique identifier
    pub title: String,           // Todo title (required)
    pub description: Option<String>,  // Optional detailed description
    pub completed: bool,         // Completion status
    pub created_at: String,      // ISO 8601 timestamp
}
```

**CreateTodo Struct** (Request DTO)
```rust
pub struct CreateTodo {
    pub title: String,
    pub description: Option<String>,
}
```

**UpdateTodo Struct** (Request DTO - all fields optional)
```rust
pub struct UpdateTodo {
    pub title: Option<String>,
    pub description: Option<String>,
    pub completed: Option<bool>,
}
```

#### Database Schema

```sql
CREATE TABLE IF NOT EXISTS todos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
)
```

#### CRUD Functions

| Function | Parameters | Returns | Purpose |
|----------|-----------|---------|---------|
| `create_pool()` | - | `DbPool` | Initialize SQLite connection pool and create schema |
| `create_todo(pool, data)` | Pool, CreateTodo | `Result<Todo>` | Insert new todo with UUID and current timestamp |
| `get_todos(pool)` | Pool | `Result<Vec<Todo>>` | Retrieve all todos (ordered by created_at DESC) |
| `get_todo(pool, id)` | Pool, ID | `Result<Option<Todo>>` | Retrieve single todo by ID |
| `update_todo(pool, id, update)` | Pool, ID, UpdateTodo | `Result<Option<Todo>>` | Partially update todo (only provided fields) |
| `delete_todo(pool, id)` | Pool, ID | `Result<bool>` | Delete todo by ID, return success status |

#### Error Handling Pattern

Uses `Result<T, Box<dyn std::error::Error + Send + Sync>>` for:
- Cross-layer error propagation (r2d2, rusqlite, UUID generation)
- Thread-safe error handling in async contexts
- Maintaining flexibility across multiple error types

---

### 3. handlers.rs - HTTP API Layer
**Lines:** 102
**Responsibility:** HTTP request routing, handler implementations, CORS configuration

#### Router Configuration

**Route Nesting:**
- All TODO operations nested under `/api/todos` base path
- Static file serving from `/static` directory
- CORS layer applied globally for cross-origin requests

#### API Endpoints

| Method | Path | Handler Function | Status Code | Response |
|--------|------|------------------|-------------|----------|
| GET | `/api/todos` | `get_todos_handler` | 200 | Array of todos (JSON) |
| POST | `/api/todos` | `create_todo_handler` | 201 | Created todo object (JSON) |
| GET | `/api/todos/:id` | `get_todo_handler` | 200/404 | Todo object or error message |
| PUT | `/api/todos/:id` | `update_todo_handler` | 200/404 | Updated todo object or error |
| DELETE | `/api/todos/:id` | `delete_todo_handler` | 200/404 | Success message or error |

#### Handler Implementation Patterns

**State Injection:**
```rust
State<DbPool> - Database pool injected into all handlers
```

**Parameter Extraction:**
- `Path<String>` - Extract URL path parameters (e.g., todo ID)
- `Json<T>` - Parse and validate JSON request body

**Response Patterns:**
- `Json<T>` - Serialize response to JSON with 200 OK
- Custom status codes for creation (201) and errors (404, 500)
- Error responses with descriptive messages

---

## Data Flow Diagram

```
HTTP Request
    ↓
Router (handlers.rs)
    ↓
Handler Function (extract state, path, body)
    ↓
Database Function (database.rs)
    ↓
SQLite Database (todos.db)
    ↓
(Response flows back up)
```

---

## Build & Development

### Commands

**Build:**
```bash
cargo build
```

**Run:**
```bash
cargo run
```

**Development (with auto-reload):**
```bash
cargo watch -x run
```

**Format Code:**
```bash
cargo fmt
```

**Lint Code:**
```bash
cargo clippy
```

**Run Tests:**
```bash
cargo test
```

---

## Design Patterns Used

### 1. **Connection Pooling Pattern**
- r2d2 manages reusable SQLite connections
- Improves performance by reusing connections across requests
- Prevents connection exhaustion

### 2. **Type-Safe Error Handling**
- `Result<T, Box<dyn Error + Send + Sync>>` enables async-friendly error propagation
- Maintains type safety while handling multiple error types
- Suitable for concurrent execution in Tokio runtime

### 3. **Dependency Injection**
- Database pool injected via Axum `State<DbPool>`
- Handlers receive pool as parameter
- Enables testability and decoupling

### 4. **Repository Pattern (CRUD)**
- `database.rs` module encapsulates all database operations
- Provides clean interface to higher layers
- Centralizes data access logic

### 5. **Data Transfer Objects (DTO)**
- `CreateTodo` and `UpdateTodo` separate API contracts from internal models
- `UpdateTodo` with `Option<T>` fields enables partial updates
- API layer independent from database models

### 6. **Async/Await & Concurrency**
- All handlers are async functions
- Tokio runtime handles task scheduling
- Tower middleware enables concurrent request processing
- Non-blocking database access

### 7. **RESTful API Design**
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Resource-based URLs (`/api/todos`, `/api/todos/{id}`)
- Proper HTTP status codes (200, 201, 404, 500)
- JSON request/response payloads

---

## Key Features

✓ **Type Safety** - Rust's strong type system prevents entire classes of bugs
✓ **Performance** - Async/await with Tokio enables high concurrency
✓ **Database** - SQLite for simple deployment, r2d2 for connection management
✓ **Async-First** - Built from ground up for async operations
✓ **Error Handling** - Explicit error handling without exceptions
✓ **CORS Support** - Cross-origin requests enabled
✓ **Static Files** - Serve frontend assets from `/static` directory
✓ **REST API** - Clean, standard REST endpoint design

---

## Important Implementation Details

### Database Initialization
- Schema created automatically on first run in `create_pool()`
- Uses SQLite file-based storage at `backend/todos.db`
- Connection pool size managed by r2d2 defaults

### Request Flow Example: Create Todo
```
POST /api/todos with JSON body
    ↓
create_todo_handler extracts Json<CreateTodo>
    ↓
Call database::create_todo(pool, data)
    ↓
Generate UUID and current timestamp
    ↓
Execute INSERT SQL statement
    ↓
Return Todo struct as JSON (201 Created)
```

### Partial Updates
- `UpdateTodo` uses `Option<T>` for all fields
- Only provided fields are updated in database
- Unspecified fields remain unchanged

### Error Propagation
- Database errors bubble up as `Box<dyn Error>`
- Handlers convert to appropriate HTTP responses
- Type system ensures all errors are handled

---

## Configuration Points

**Server Address:** `main.rs` - `127.0.0.1:3030`
**Database File:** `main.rs` - `todos.db` (automatic creation)
**Static Files Path:** `handlers.rs` - `/static` directory
**CORS Settings:** `handlers.rs` - Permissive layer

---

## Dependencies Summary

**Direct Dependencies:** 10 total
- Web framework and async runtime
- Database access and connection pooling
- Serialization/deserialization
- HTTP utilities and middleware
- ID generation and datetime handling

**Transitive Dependencies:** 100+ (managed by Cargo.lock)

---

## Next Steps for Development

1. **Add Authentication** - Implement user accounts and permission checks
2. **Add Tests** - Unit tests for handlers and database functions
3. **Database Migrations** - Use tool like sqlx for schema versioning
4. **Logging** - Add tracing/logging for production monitoring
5. **Validation** - Add request validation layer (validator crate)
6. **Documentation** - Add OpenAPI/Swagger documentation
7. **Error Handling** - Create custom error types with custom JSON responses
8. **Rate Limiting** - Add rate limiting middleware for API protection

---