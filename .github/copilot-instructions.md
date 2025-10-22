# GitHub Copilot Instructions for Rust TODO Project

## Project Overview

This is a full-stack TODO application with:
- **Backend**: Rust with Axum web framework, SQLite database
- **Frontend**: Vue.js 3 with TypeScript and Webpack

## Code Style Guidelines

### Rust Backend

1. **Naming Conventions**
   - Use snake_case for functions, variables, and modules
   - Use PascalCase for types, structs, and enums
   - Use SCREAMING_SNAKE_CASE for constants

2. **Error Handling**
   - Prefer `Result<T, E>` for functions that can fail
   - Use `?` operator for error propagation
   - Provide descriptive error messages

3. **Async/Await**
   - Use `async fn` for handlers and I/O operations
   - Use Tokio runtime features appropriately
   - Avoid blocking operations in async contexts

4. **Database**
   - Use connection pooling (r2d2) for database access
   - Always use parameterized queries to prevent SQL injection
   - Handle database errors gracefully

5. **API Responses**
   - Return proper HTTP status codes (200, 201, 404, 500, etc.)
   - Use JSON for request/response bodies
   - Include descriptive error messages in error responses

### Vue.js Frontend

1. **Component Structure**
   - Use Composition API with `<script setup lang="ts">`
   - Keep components focused and single-responsibility
   - Use TypeScript for type safety

2. **Naming Conventions**
   - Use PascalCase for component files (e.g., `TodoItem.vue`)
   - Use camelCase for variables and functions
   - Use kebab-case in templates for component references

3. **State Management**
   - Use reactive references (`ref`, `reactive`) for local state
   - Keep API calls in parent components when possible
   - Pass data down via props, emit events up

4. **TypeScript**
   - Define interfaces for all data structures
   - Use explicit types for function parameters and return values
   - Avoid using `any` type

## Architecture Patterns

### Backend Structure

```
backend/src/
├── main.rs       # Entry point, server initialization
├── database.rs   # Database connection pool and SQL queries
└── handlers.rs   # HTTP route handlers and business logic
```

- **main.rs**: Initialize database pool, create router, start server
- **database.rs**: All database operations (CRUD for todos)
- **handlers.rs**: Axum routes and request/response handling

### Frontend Structure

```
frontend/src/
├── main.ts              # Vue app initialization
├── App.vue              # Root component
├── components/
│   ├── TodoList.vue    # Displays list of todos
│   ├── TodoItem.vue    # Individual todo item
│   └── AddTodo.vue     # Form to add new todo
└── types/
    └── todo.ts         # TypeScript interfaces
```

## Common Tasks

### Adding a New API Endpoint

1. Add the handler function in `handlers.rs`
2. Add the route to the router in `create_router()`
3. Update frontend API calls if needed
4. Update README.md with new endpoint documentation

### Adding a New Component

1. Create `.vue` file in `frontend/src/components/`
2. Use `<script setup lang="ts">` for Composition API
3. Define props and emits with TypeScript types
4. Import and use in parent component

### Database Schema Changes

1. Update the schema in `database.rs`
2. Delete `todos.db` to recreate with new schema
3. Update Rust structs that represent the data
4. Update TypeScript interfaces in `frontend/src/types/`

## Testing Suggestions

- Test all API endpoints using tools like curl or Postman
- Check CORS configuration for cross-origin requests
- Verify database operations with different data types
- Test error handling with invalid inputs
- Check TypeScript compilation with `npm run build`

## Dependencies

### Backend (Cargo.toml)
- `axum`: Web framework
- `tokio`: Async runtime
- `rusqlite`: SQLite database
- `serde`, `serde_json`: JSON serialization
- `tower-http`: CORS and static file serving
- `r2d2`, `r2d2_sqlite`: Connection pooling

### Frontend (package.json)
- `vue`: Vue.js framework
- `typescript`: Type checking
- `webpack`: Module bundler
- `vue-loader`: Vue single-file component support

## Security Considerations

- Use parameterized queries to prevent SQL injection
- Validate all user inputs on the backend
- Set appropriate CORS policies
- Use HTTPS in production
- Don't commit sensitive data (API keys, passwords)

## Performance Tips

- Use connection pooling for database access
- Minimize database queries (batch when possible)
- Implement proper indexing on frequently queried columns
- Optimize webpack bundle size for frontend
- Use lazy loading for large components

## Debugging

### Backend
- Use `println!()` or `dbg!()` for debugging
- Check server logs for errors
- Use `RUST_BACKTRACE=1` for detailed error traces

### Frontend
- Use browser DevTools console
- Check Network tab for API request/response
- Use Vue DevTools extension for component inspection

## Best Practices

1. **Keep code DRY**: Extract common functionality into helper functions
2. **Document complex logic**: Add comments for non-obvious code
3. **Handle all error cases**: Don't panic in production code
4. **Type everything**: Leverage TypeScript and Rust's type systems
5. **Test incrementally**: Test changes after each modification
6. **Follow REST conventions**: Use appropriate HTTP methods and status codes
7. **Keep components small**: Each component should have a single responsibility
8. **Version control**: Commit frequently with descriptive messages
