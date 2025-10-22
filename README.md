# Rust TODO Application

A full-stack TODO application built with Rust (backend) and Vue.js (frontend).

## 🚀 Features

- ✅ Create, read, update, and delete TODO items
- 📝 Mark tasks as complete/incomplete
- 🎨 Modern Vue.js 3 frontend with TypeScript
- ⚡ Fast and efficient Rust backend with Axum
- 💾 SQLite database for data persistence
- 🔄 RESTful API architecture

## 🛠️ Tech Stack

### Backend
- **Rust** - Systems programming language
- **Axum** - Web framework
- **SQLite** - Database (via rusqlite)
- **Tokio** - Async runtime
- **Tower-HTTP** - CORS and static file serving

### Frontend
- **Vue.js 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Pinia** - State management library
- **Webpack** - Module bundler

## 📋 Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) (latest stable version)
- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## 🚀 Getting Started

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Build and run the server:
```bash
cargo run
```

The server will start at `http://localhost:3030`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Build the frontend:
```bash
npm run build
```

For development with hot-reload:
```bash
npm run dev
```

## 📡 API Endpoints

### GET `/api/todos`
Get all TODO items

### POST `/api/todos`
Create a new TODO item
```json
{
  "title": "Task title",
  "description": "Task description"
}
```

### PUT `/api/todos/:id`
Update a TODO item
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "completed": true
}
```

### DELETE `/api/todos/:id`
Delete a TODO item

## 🗂️ Project Structure

```
rust_todo/
├── backend/
│   ├── src/
│   │   ├── main.rs          # Application entry point
│   │   ├── database.rs      # Database connection and queries
│   │   └── handlers.rs      # API route handlers
│   └── Cargo.toml           # Rust dependencies
├── frontend/
│   ├── src/
│   │   ├── main.ts          # Vue app entry point
│   │   ├── App.vue          # Root component
│   │   ├── components/      # Vue components
│   │   ├── stores/          # Pinia stores for state management
│   │   │   └── todo.ts      # Todo store with API calls
│   │   └── types/           # TypeScript type definitions
│   ├── package.json         # Node dependencies
│   └── webpack.config.js    # Webpack configuration
└── README.md
```

## 🏪 State Management with Pinia

This application uses Pinia for centralized state management. The todo store (`frontend/src/stores/todo.ts`) manages:

- **State**: todos, loading status, and error messages
- **Getters**: computed properties like completed/active todos count
- **Actions**: async API calls (fetchTodos, addTodo, toggleTodo, deleteTodo)

Benefits of using Pinia:
- Centralized state management
- TypeScript support out of the box
- Devtools integration for debugging
- Simpler API compared to Vuex

## 🔧 Development

### Backend Development

The backend uses Rust's cargo watch for auto-reloading during development:
```bash
cargo install cargo-watch
cargo watch -x run
```

### Frontend Development

Run the development server with hot-reload:
```bash
npm run dev
```

## 📝 Database

The application uses SQLite with the following schema:

```sql
CREATE TABLE todos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
)
```

The database file (`todos.db`) is automatically created in the backend directory on first run.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🐛 Troubleshooting

### Port Already in Use
If port 3030 is already in use, you can change it in `backend/src/main.rs`:
```rust
let listener = tokio::net::TcpListener::bind("127.0.0.1:YOUR_PORT")
```

### CORS Issues
CORS is configured in `backend/src/handlers.rs`. Adjust the allowed origins if needed.

### Build Errors
- Make sure all dependencies are up to date
- Try cleaning the build cache: `cargo clean` (backend) or `rm -rf node_modules && npm install` (frontend)

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub.
