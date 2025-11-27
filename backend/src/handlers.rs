use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::Json,
    routing::{get},
    Router,
};
use tower_http::{cors::CorsLayer, services::ServeDir};
use serde_json::{json, Value};

use crate::database::{DbPool, CreateTodo, UpdateTodo, Todo};

pub fn create_router(db_pool: DbPool) -> Router {
    // This topic is explained in `.copilot/explanation/axum-routing.md`
    let api_routes = Router::new()
        .route("/", get(get_todos_handler).post(create_todo_handler))
        .route("/:id", get(get_todo_handler).put(update_todo_handler).delete(delete_todo_handler))
        .with_state(db_pool);

    Router::new()
        .nest("/api/todos", api_routes)
        .nest_service("/", ServeDir::new("static"))
        .layer(CorsLayer::permissive())
}


async fn get_todos_handler(State(pool): State<DbPool>) -> Result<Json<Vec<Todo>>, StatusCode> {
    match crate::database::get_todos(&pool) {
        Ok(todos) => Ok(Json(todos)),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

async fn create_todo_handler(
    State(pool): State<DbPool>,
    Json(create_todo): Json<CreateTodo>,
) -> Result<(StatusCode, Json<Todo>), (StatusCode, Json<Value>)> {
    match crate::database::create_todo(&pool, create_todo) {
        Ok(todo) => Ok((StatusCode::CREATED, Json(todo))),
        Err(_) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"error": "Failed to create todo"})),
        )),
    }
}

async fn get_todo_handler(
    State(pool): State<DbPool>,
    Path(id): Path<String>,
) -> Result<Json<Todo>, (StatusCode, Json<Value>)> {
    match crate::database::get_todo(&pool, &id) {
        Ok(Some(todo)) => Ok(Json(todo)),
        Ok(None) => Err((
            StatusCode::NOT_FOUND,
            Json(json!({"error": "Todo not found"})),
        )),
        Err(_) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"error": "Failed to get todo"})),
        )),
    }
}

async fn update_todo_handler(
    State(pool): State<DbPool>,
    Path(id): Path<String>,
    Json(update): Json<UpdateTodo>,
) -> Result<Json<Todo>, (StatusCode, Json<Value>)> {
    match crate::database::update_todo(&pool, &id, update) {
        Ok(Some(todo)) => Ok(Json(todo)),
        Ok(None) => Err((
            StatusCode::NOT_FOUND,
            Json(json!({"error": "Todo not found"})),
        )),
        Err(_) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"error": "Failed to update todo"})),
        )),
    }
}

async fn delete_todo_handler(
    State(pool): State<DbPool>,
    Path(id): Path<String>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    match crate::database::delete_todo(&pool, &id) {
        Ok(true) => Ok(Json(json!({"message": "Todo deleted successfully"}))),
        Ok(false) => Err((
            StatusCode::NOT_FOUND,
            Json(json!({"error": "Todo not found"})),
        )),
        Err(_) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"error": "Failed to delete todo"})),
        )),
    }
}