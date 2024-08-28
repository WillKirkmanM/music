use std::fs;
use std::path::PathBuf;
use std::sync::Arc;
use std::time::Duration;

use diesel::connection::SimpleConnection;
use diesel::prelude::*;
use diesel::r2d2::{self, ConnectionManager};
use diesel::RunQueryDsl;
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use dotenvy::dotenv;
use diesel::sqlite::SqliteConnection;
use std::error::Error;

#[derive(Debug)]
pub struct ConnectionOptions {
    pub enable_wal: bool,
    pub enable_foreign_keys: bool,
    pub busy_timeout: Option<Duration>,
}

impl diesel::r2d2::CustomizeConnection<SqliteConnection, diesel::r2d2::Error> for ConnectionOptions {
    fn on_acquire(&self, conn: &mut SqliteConnection) -> Result<(), diesel::r2d2::Error> {
        (|| {
            if self.enable_wal {
                conn.batch_execute("PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL;")?;
            }
            if self.enable_foreign_keys {
                conn.batch_execute("PRAGMA foreign_keys = ON;")?;
            }
            if let Some(d) = self.busy_timeout {
                conn.batch_execute(&format!("PRAGMA busy_timeout = {};", d.as_millis()))?;
            }
            Ok(())
        })()
        .map_err(diesel::r2d2::Error::QueryError)
    }
}

pub type DbPool = Arc<r2d2::Pool<ConnectionManager<SqliteConnection>>>;

pub fn establish_connection() -> DbPool {
    dotenv().ok();

    let database_url = get_database_path().to_str().unwrap().to_string();
    let manager = ConnectionManager::<SqliteConnection>::new(database_url);
    let pool = r2d2::Pool::builder()
        .connection_customizer(Box::new(ConnectionOptions {
            enable_wal: true,
            enable_foreign_keys: true,
            busy_timeout: Some(Duration::from_secs(30)),
        }))
        .build(manager)
        .expect("Failed to create pool.");

    Arc::new(pool)
}


pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!("./migrations");

pub fn run_migrations() -> Result<(), Box<dyn Error + Send + Sync + 'static>> {
    let pool = establish_connection();
    let mut conn = pool.get().expect("Failed to get a connection from the pool");

    conn.run_pending_migrations(MIGRATIONS)?;

    Ok(())
}

pub fn redo_migrations() -> Result<(), Box<dyn Error + Send + Sync + 'static>> {
    let pool = establish_connection();
    let mut conn = pool.get().expect("Failed to get a connection from the pool");

    conn.revert_last_migration(MIGRATIONS)?;
    conn.run_pending_migrations(MIGRATIONS)?;

    Ok(())
}

pub fn migrations_ran() -> bool {
    let pool = establish_connection();
    let mut conn = pool.get().expect("Failed to get a connection from the pool");
    diesel::sql_query("SELECT 1 FROM diesel_schema_migrations LIMIT 1")
        .execute(&mut conn)
        .is_ok()
}

pub fn get_database_path() -> PathBuf {
    let mut path = dirs::data_local_dir().unwrap_or_else(|| PathBuf::from("."));
    path.push("ParsonLabs");
    path.push("Music");
    path.push("Database");
    if let Err(e) = fs::create_dir_all(&path) {
        eprintln!("Failed to create directories: {}", e);
    }
    path.push("music.db");
    if !path.exists() {
        if let Err(e) = fs::File::create(&path) {
            eprintln!("Failed to create database file: {}", e);
        }
    }
    path
}