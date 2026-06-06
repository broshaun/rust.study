use serde::{Deserialize, Serialize};
use sqlx::sqlite::{SqliteConnectOptions, SqlitePoolOptions};
use sqlx::{FromRow, SqlitePool};
use std::str::FromStr;

#[derive(Clone)]
pub struct AppState {
    pub db: SqlitePool,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Group {
    pub id: String,
    pub group_name: String,
    pub group_avatar: String,
    pub group_notice: String,
    pub updated_at: String,
    pub admin_invite_only: bool,
    pub administrator: String,
}

impl AppState {
    pub async fn new() -> Result<Self, sqlx::Error> {
        let options = SqliteConnectOptions::from_str("sqlite:app.db")?
            .create_if_missing(true);

        let db = SqlitePoolOptions::new()
            .max_connections(5)
            .connect_with(options)
            .await?;

        Self::init_db(&db).await?;

        Ok(Self { db })
    }

    async fn init_db(db: &SqlitePool) -> Result<(), sqlx::Error> {
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS groups (
                id TEXT PRIMARY KEY NOT NULL,
                group_name TEXT NOT NULL DEFAULT '',
                group_avatar TEXT NOT NULL DEFAULT '',
                group_notice TEXT NOT NULL DEFAULT '',
                updated_at TEXT NOT NULL DEFAULT '',
                admin_invite_only INTEGER NOT NULL DEFAULT 0,
                administrator TEXT NOT NULL DEFAULT '[]'
            )
            "#,
        )
        .execute(db)
        .await?;

        Ok(())
    }

    pub async fn upsert_group(&self, group: &Group) -> Result<(), sqlx::Error> {
        sqlx::query(
            r#"
            INSERT INTO groups (
                id,
                group_name,
                group_avatar,
                group_notice,
                updated_at,
                admin_invite_only,
                administrator
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                group_name = excluded.group_name,
                group_avatar = excluded.group_avatar,
                group_notice = excluded.group_notice,
                updated_at = excluded.updated_at,
                admin_invite_only = excluded.admin_invite_only,
                administrator = excluded.administrator
            "#,
        )
        .bind(&group.id)
        .bind(&group.group_name)
        .bind(&group.group_avatar)
        .bind(&group.group_notice)
        .bind(&group.updated_at)
        .bind(group.admin_invite_only)
        .bind(&group.administrator)
        .execute(&self.db)
        .await?;

        Ok(())
    }

    pub async fn get_group(&self, group_id: &str) -> Result<Option<Group>, sqlx::Error> {
        sqlx::query_as::<_, Group>(
            r#"
            SELECT
                id,
                group_name,
                group_avatar,
                group_notice,
                updated_at,
                admin_invite_only,
                administrator
            FROM groups
            WHERE id = ?
            LIMIT 1
            "#,
        )
        .bind(group_id)
        .fetch_optional(&self.db)
        .await
    }

    pub async fn list_groups(&self) -> Result<Vec<Group>, sqlx::Error> {
        sqlx::query_as::<_, Group>(
            r#"
            SELECT
                id,
                group_name,
                group_avatar,
                group_notice,
                updated_at,
                admin_invite_only,
                administrator
            FROM groups
            ORDER BY updated_at DESC
            "#,
        )
        .fetch_all(&self.db)
        .await
    }

    pub async fn remove_group(&self, group_id: &str) -> Result<bool, sqlx::Error> {
        let result = sqlx::query(
            r#"
            DELETE FROM groups
            WHERE id = ?
            "#,
        )
        .bind(group_id)
        .execute(&self.db)
        .await?;

        Ok(result.rows_affected() > 0)
    }
}