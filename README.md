# Rust TODO Application

A full-stack TODO application built with Rust and React, featuring a REST API backend and a modern web frontend.

## 🏗️ Architecture

This application consists of two main components:

- **Backend**: Rust REST API server using Axum framework with SQLite database
- **Frontend**: React application with modern JavaScript tooling

## 🛠️ Tech Stack

### Backend (Rust)
- **Framework**: [Axum](https://github.com/tokio-rs/axum) - Modern async web framework
- **Database**: SQLite with [rusqlite](https://github.com/rusqlite/rusqlite) 
- **Connection Pooling**: R2D2 for database connection management
- **Serialization**: Serde for JSON handling
- **Runtime**: Tokio for async operations
- **UUID**: UUID v4 for unique identifiers
- **DateTime**: Chrono for timestamp handling

### Frontend (React)
- **Framework**: React 19.x
- **Build Tool**: Webpack 5
- **Transpiler**: Babel with ES6+ and JSX support
- **Styling**: Vanilla CSS with modern styling

## 📁 Project Structure

```
rust_todo/
├── src/                    # Rust backend source code
│   ├── main.rs            # Application entry point and server setup
│   ├── handlers.rs        # HTTP request handlers and routing
│   └── database.rs        # Database operations and models
├── frontend/              # React frontend application
│   ├── src/              # Frontend source code
│   │   ├── App.js        # Main React component
│   │   ├── index.js      # React DOM rendering
│   │   └── components/   # Reusable React components
│   ├── package.json      # Frontend dependencies and scripts
│   └── webpack.config.js # Webpack build configuration
├── static/               # Built frontend assets served by backend
│   ├── index.html       # Main HTML file with embedded styles
│   └── bundle.js        # Compiled JavaScript bundle
├── Cargo.toml           # Rust dependencies and project metadata
└── .gitignore          # Git ignore patterns
```

## 🚀 Getting Started

### Prerequisites

- [Rust](https://rustup.rs/) (latest stable version)
- [Node.js](https://nodejs.org/) (for frontend development)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/fdshg693/rust_todo.git
   cd rust_todo
   ```

2. **Backend Setup**
   ```bash
   # Install Rust dependencies and check compilation
   cargo check
   
   # Run the backend server (will create todos.db automatically)
   cargo run
   ```
   The API server will start at `http://localhost:3030`

3. **Frontend Setup** (for development)
   ```bash
   cd frontend
   
   # Install Node.js dependencies
   npm install
   
   # Build frontend for production (outputs to ../static/)
   npm run build
   
   # Or run in development mode with hot reload
   npm run dev
   ```

### Running the Application

1. **Start the backend server**:
   ```bash
   cargo run
   ```

2. **Access the application**:
   Open your browser and navigate to `http://localhost:3030`

The backend automatically serves the static frontend files and provides the API endpoints.

## 📡 API Endpoints

The REST API provides the following endpoints:

| Method | Endpoint          | Description                    |
|--------|-------------------|--------------------------------|
| GET    | `/api/todos`      | Get all todos                  |
| POST   | `/api/todos`      | Create a new todo              |
| GET    | `/api/todos/:id`  | Get a specific todo by ID      |
| PUT    | `/api/todos/:id`  | Update a specific todo         |
| DELETE | `/api/todos/:id`  | Delete a specific todo         |

### Data Models

**Todo Object**:
```json
{
  "id": "uuid-string",
  "title": "Todo title",
  "description": "Optional description",
  "completed": false,
  "created_at": "2024-01-01T12:00:00Z"
}
```

**Create Todo Request**:
```json
{
  "title": "New todo",
  "description": "Optional description"
}
```

**Update Todo Request**:
```json
{
  "title": "Updated title (optional)",
  "description": "Updated description (optional)",
  "completed": true
}
```

## 🗄️ Database

The application uses SQLite as its database with the following schema:

```sql
CREATE TABLE todos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
);
```

The database file (`todos.db`) is automatically created in the project root when the server starts.

## 🧪 Development

### Building

```bash
# Build the Rust backend
cargo build

# Build the frontend
cd frontend && npm run build
```

### Code Style

The project follows standard Rust conventions:
- Use `cargo fmt` for code formatting
- Use `cargo clippy` for linting
- Follow Rust naming conventions (snake_case for functions/variables)

## 🔧 Configuration

- **Server Port**: The server runs on port 3030 by default (configured in `src/main.rs`)
- **Database**: SQLite database file is created as `todos.db` in the project root
- **CORS**: The API has permissive CORS settings for development

## 📝 Contributing

1. Ensure code compiles with `cargo check`
2. Format code with `cargo fmt`
3. Run linting with `cargo clippy`
4. Build frontend with `npm run build` in the frontend directory
5. Test the full application by running `cargo run` and accessing `http://localhost:3030`

## 📄 License

This project is licensed under the MIT License.