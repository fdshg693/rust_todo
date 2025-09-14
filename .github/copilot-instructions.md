# GitHub Copilot Instructions for Rust TODO Application

## Project Overview

This is a full-stack TODO application with a Rust backend API and React frontend. When working on this project, follow these guidelines to maintain code quality and consistency.

## General Guidelines

### Code Style and Standards
- **Rust Code**: Follow standard Rust conventions (snake_case, proper error handling, prefer `?` operator)
- **React Code**: Use functional components with hooks, prefer const declarations
- **Error Handling**: Always handle errors gracefully, use Result types in Rust
- **Database Operations**: Use the existing R2D2 connection pool pattern
- **API Design**: Follow RESTful conventions for new endpoints

### Architecture Principles
- Keep database operations in `database.rs` module
- Keep HTTP handlers in `handlers.rs` module  
- Maintain separation between frontend and backend concerns
- Use existing patterns for new similar functionality

### Development Workflow
- Test Rust changes with `cargo check` before committing
- Build frontend with `npm run build` after React changes
- Ensure the full application runs with `cargo run`
- API should remain backward-compatible when possible

## Key Components to Understand

### Backend (Rust)
- **Main Server** (`src/main.rs`): Entry point, database pool initialization, server startup
- **Handlers** (`src/handlers.rs`): HTTP request routing and response handling
- **Database** (`src/database.rs`): Data models, database operations, and connection management

### Frontend (React)
- **React App** (`frontend/src/App.js`): Main application component
- **Build System**: Webpack configuration for bundling
- **Static Assets**: Served directly by the Rust backend

### Database Schema
```sql
CREATE TABLE todos (
    id TEXT PRIMARY KEY,        -- UUID v4
    title TEXT NOT NULL,
    description TEXT,           -- Optional
    completed BOOLEAN NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL    -- RFC3339 timestamp
);
```

## Common Tasks and Patterns

### Adding New API Endpoints
1. Add route in `handlers.rs` `create_router()` function
2. Implement handler function following existing patterns
3. Add corresponding database operation in `database.rs` if needed
4. Use proper error handling with StatusCode returns

### Database Operations
- Use the existing `DbPool` type alias
- Return `Result<T, Box<dyn std::error::Error + Send + Sync>>` for database functions
- Use parameterized queries to prevent SQL injection
- Follow the existing pattern for connection retrieval: `pool.get()?`

### Frontend Development
- Build with `npm run build` to update static files
- Use existing CSS patterns and class names
- Follow React hooks patterns established in the codebase
- API calls should use the `/api/todos` base path

## Testing and Validation

### Before Committing
1. Run `cargo check` to verify Rust code compiles
2. Run `cargo clippy` for linting suggestions
3. Run `cargo fmt` to format Rust code
4. Build frontend: `cd frontend && npm run build`
5. Test full application: `cargo run` and verify at http://localhost:3030

### When Adding Features
- Ensure new endpoints follow RESTful conventions
- Maintain consistent error response formats
- Test CRUD operations thoroughly
- Verify frontend updates correctly reflect backend changes

## Dependencies and Libraries

### Rust Backend Dependencies
- `axum`: Web framework - use for routing and handlers
- `rusqlite`: SQLite database - use for direct database operations
- `r2d2`/`r2d2_sqlite`: Connection pooling - use existing pool patterns
- `serde`: Serialization - use for JSON request/response handling
- `tokio`: Async runtime - use for async operations
- `uuid`: ID generation - use v4 for new entities
- `chrono`: Date/time - use for timestamps

### Frontend Dependencies
- `react`: UI framework - use functional components
- `webpack`: Build tool - existing configuration should suffice
- `babel`: Transpilation - configured for modern JS and JSX

## File Modifications Guidelines

### When modifying `src/main.rs`:
- Keep the server initialization simple
- Don't add business logic here
- Database pool creation should remain centralized

### When modifying `src/handlers.rs`:
- Add new routes to the appropriate router
- Follow existing error handling patterns
- Use extractors for request data (Path, State, Json)
- Return appropriate HTTP status codes

### When modifying `src/database.rs`:
- Add new functions following existing naming conventions
- Use prepared statements for database queries
- Handle Option/Result types consistently
- Keep transaction handling simple and explicit

### When modifying frontend files:
- Maintain existing CSS class patterns
- Use existing state management approaches
- Follow React component structure established in App.js
- Build after changes to update static files

## Security Considerations
- Always use parameterized queries for database operations
- Validate input data before database operations
- Use existing CORS configuration patterns
- Don't expose sensitive information in error messages

## Performance Guidelines
- Use the existing connection pool for database operations
- Avoid N+1 query patterns in database operations
- Keep API responses focused and minimal
- Use existing async patterns for I/O operations