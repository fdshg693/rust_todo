use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use rusqlite::Result;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Todo {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub completed: bool,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateTodo {
    pub title: String,
    pub description: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateTodo {
    pub title: Option<String>,
    pub description: Option<String>,
    pub completed: Option<bool>,
}

// WANTED EXAMPLE: Poolの使い方、genericの使い方
pub type DbPool = Pool<SqliteConnectionManager>;

pub fn create_pool() -> Result<DbPool, r2d2::Error> {
    let manager = SqliteConnectionManager::file("todos.db");
    let pool = Pool::new(manager)?;

    // Initialize database schema
    let conn = pool.get().unwrap();
    conn.execute(
        "CREATE TABLE IF NOT EXISTS todos (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            completed BOOLEAN NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL
        )",
        [],
    )
    .unwrap();

    Ok(pool)
}

// This topic is explained in `.copilot/explanation/rust-error-types.md`
pub fn create_todo(
    pool: &DbPool,
    create_todo: CreateTodo,
) -> Result<Todo, Box<dyn std::error::Error + Send + Sync>> {
    let conn = pool.get()?;
    let id = uuid::Uuid::new_v4().to_string();
    let created_at = chrono::Utc::now().to_rfc3339();
    let description = create_todo.description.clone().unwrap_or_default();

    conn.execute(
        "INSERT INTO todos (id, title, description, completed, created_at) VALUES (?1, ?2, ?3, ?4, ?5)",
        [&id, &create_todo.title, &description, &"0".to_string(), &created_at],
    )?;

    Ok(Todo {
        id,
        title: create_todo.title,
        description: create_todo.description,
        completed: false,
        created_at,
    })
}

pub fn get_todos(pool: &DbPool) -> Result<Vec<Todo>, Box<dyn std::error::Error + Send + Sync>> {
    let conn = pool.get()?;
    let mut stmt = conn.prepare(
        "SELECT id, title, description, completed, created_at FROM todos ORDER BY created_at DESC",
    )?;

    // WANTED EXAMPLE:　stmt.query_mapの使い方
    let todos = stmt.query_map([], |row| {
        Ok(Todo {
            id: row.get(0)?,
            title: row.get(1)?,
            description: {
                let desc: String = row.get(2)?;
                if desc.is_empty() {
                    None
                } else {
                    Some(desc)
                }
            },
            completed: row.get::<_, i32>(3)? != 0,
            created_at: row.get(4)?,
        })
    })?;

    let mut result = Vec::new();
    for todo in todos {
        result.push(todo?);
    }
    Ok(result)
}

pub fn get_todo(
    pool: &DbPool,
    id: &str,
) -> Result<Option<Todo>, Box<dyn std::error::Error + Send + Sync>> {
    let conn = pool.get()?;
    let mut stmt = conn
        .prepare("SELECT id, title, description, completed, created_at FROM todos WHERE id = ?1")?;

    let mut todos = stmt.query_map([id], |row| {
        Ok(Todo {
            id: row.get(0)?,
            title: row.get(1)?,
            description: {
                let desc: String = row.get(2)?;
                if desc.is_empty() {
                    None
                } else {
                    Some(desc)
                }
            },
            completed: row.get::<_, i32>(3)? != 0,
            created_at: row.get(4)?,
        })
    })?;

    match todos.next() {
        Some(todo) => Ok(Some(todo?)),
        None => Ok(None),
    }
}

pub fn update_todo(
    pool: &DbPool,
    id: &str,
    update: UpdateTodo,
) -> Result<Option<Todo>, Box<dyn std::error::Error + Send + Sync>> {
    let conn = pool.get()?;

    // Check if todo exists first
    if get_todo(pool, id)?.is_none() {
        return Ok(None);
    }

    // Build dynamic update query
    let mut updates = Vec::new();
    let mut params: Vec<String> = Vec::new();

    if let Some(title) = update.title {
        updates.push("title = ?");
        params.push(title);
    }
    if let Some(description) = update.description {
        updates.push("description = ?");
        params.push(description);
    }
    if let Some(completed) = update.completed {
        updates.push("completed = ?");
        params.push(if completed {
            "1".to_string()
        } else {
            "0".to_string()
        });
    }

    if updates.is_empty() {
        return get_todo(pool, id);
    }

    params.push(id.to_string());
    let query = format!("UPDATE todos SET {} WHERE id = ?", updates.join(", "));

    let param_refs: Vec<&dyn rusqlite::ToSql> =
        params.iter().map(|p| p as &dyn rusqlite::ToSql).collect();
    conn.execute(&query, param_refs.as_slice())?;

    get_todo(pool, id)
}

pub fn delete_todo(
    pool: &DbPool,
    id: &str,
) -> Result<bool, Box<dyn std::error::Error + Send + Sync>> {
    let conn = pool.get()?;
    let rows_affected = conn.execute("DELETE FROM todos WHERE id = ?1", [id])?;
    Ok(rows_affected > 0)
}
