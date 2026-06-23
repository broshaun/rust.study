use dashmap::DashMap;
use serde::Serialize;
use std::{future::Future, sync::Arc, time::Instant};
use tokio_util::{sync::CancellationToken, task::TaskTracker};

#[derive(Clone)]
pub struct TaskManager {
    tracker: TaskTracker,
    tasks: Arc<DashMap<String, TaskEntry>>,
}

struct TaskEntry {
    token: CancellationToken,
    started_at: Instant,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum TaskStatus {
    Running,
    Cancelling,
}

#[derive(Debug, Serialize)]
pub struct TaskInfo {
    pub name: String,
    pub status: TaskStatus,
    pub running_secs: u64,
}

impl TaskManager {
    pub fn new() -> Self {
        Self {
            tracker: TaskTracker::new(),
            tasks: Arc::new(DashMap::new()),
        }
    }

    pub fn spawn<F, Fut>(&self, name: impl Into<String>, job: F) -> Result<(), String>
    where
        F: FnOnce(CancellationToken) -> Fut + Send + 'static,
        Fut: Future<Output = ()> + Send + 'static,
    {
        let name = name.into();
        if self.tasks.contains_key(&name) {
            return Err(format!("task already exists: {name}"));
        }
        let token = CancellationToken::new();
        self.tasks.insert(
            name.clone(),
            TaskEntry {
                token: token.clone(),
                started_at: Instant::now(),
            },
        );
        let tasks = self.tasks.clone();
        self.tracker.spawn(async move {
            job(token).await;
            tasks.remove(&name);
        });
        Ok(())
    }

    pub fn cancel(&self, name: &str) -> Result<(), String> {
        self.tasks
            .get(name)
            .ok_or_else(|| format!("task not found: {name}"))?
            .token
            .cancel();
        Ok(())
    }

    pub fn cancel_all(&self) {
        for task in self.tasks.iter() {
            task.token.cancel();
        }
    }

    pub fn list(&self) -> Vec<TaskInfo> {
        self.tasks
            .iter()
            .map(|item| {
                let task = item.value();
                TaskInfo {
                    name: item.key().clone(),
                    status: if task.token.is_cancelled() {
                        TaskStatus::Cancelling
                    } else {
                        TaskStatus::Running
                    },
                    running_secs: task.started_at.elapsed().as_secs(),
                }
            })
            .collect()
    }

    pub async fn shutdown(&self) {
        self.cancel_all();
        self.tracker.close();
        self.tracker.wait().await;
    }
}
