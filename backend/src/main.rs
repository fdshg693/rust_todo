mod database;
mod handlers;

use database::create_pool;

#[tokio::main]
async fn main() {
    // Initialize database pool
    let db_pool = match create_pool() {
        Ok(pool) => pool,
        Err(e) => {
            eprintln!("Failed to initialize database pool: {e}");
            return;
        }
    };

    // Create router
    let app = handlers::create_router(db_pool);

    println!("🚀 TODO Server starting at http://localhost:3030");

    // Start server
    let listener = tokio::net::TcpListener::bind("127.0.0.1:3030")
        .await
        .expect("Failed to bind to port 3030");

    axum::serve(listener, app)
        .await
        .expect("Failed to start server");
}
