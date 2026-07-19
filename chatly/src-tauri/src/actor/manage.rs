/*
TaskManagerActor

Usage:
1. let manager = TaskManagerActor::new();

2. Add task:
   manager.spawn_task("heartbeat".into(), async {
       loop {
           // async work
       }
   });

3. Query:
   manager.list_tasks();
   manager.get_task("heartbeat");

4. Stop:
   manager.stop_task("heartbeat");
   manager.stop_all().await;

Features:
- Dynamic async task management
- Task cancellation
- Task status tracking
- Last status update timestamp

Suitable for:
MQTT / WebSocket / heartbeat / sync / background service
*/

use dashmap::DashMap;
use serde::Serialize;
use std::{
    future::Future,
    sync::Arc,
    time::{SystemTime, UNIX_EPOCH},
};
use tokio_util::{sync::CancellationToken, task::TaskTracker};

#[derive(Clone, Debug, Serialize)]
pub enum TaskStatus {
    Running,
    Stopped,
    Finished,
}

struct TaskInfo {
    token: CancellationToken,
    status: TaskStatus,
    updated_at: u64,
}

#[derive(Clone, Debug, Serialize)]
pub struct TaskView {
    pub name: String,
    pub status: TaskStatus,
    pub updated_at: u64,
}

#[derive(xtra::Actor)]
pub struct TaskManagerActor {
    tracker: TaskTracker,
    tasks: Arc<DashMap<String, TaskInfo>>,
}

impl TaskManagerActor {
    pub fn new() -> Self {
        Self {
            tracker: TaskTracker::new(),
            tasks: Arc::new(DashMap::new()),
        }
    }

    pub fn spawn_task<F>(&self, name: String, task: F)
    where
        F: Future<Output = ()> + Send + 'static,
    {
        if self.tasks.contains_key(&name) {
            return;
        }

        let token = CancellationToken::new();
        let cancel = token.clone();
        let tasks = self.tasks.clone();

        self.tasks.insert(
            name.clone(),
            TaskInfo {
                token,
                status: TaskStatus::Running,
                updated_at: Self::now(),
            },
        );

        self.tracker.spawn(async move {
            tokio::select! {
                _ = task => {
                    if let Some(mut item) = tasks.get_mut(&name) {
                        item.status = TaskStatus::Finished;
                        item.updated_at = Self::now();
                    }
                }

                _ = cancel.cancelled() => {
                    if let Some(mut item) = tasks.get_mut(&name) {
                        item.status = TaskStatus::Stopped;
                        item.updated_at = Self::now();
                    }
                }
            }
        });
    }

    pub fn stop_task(&self, name: &str) {
        if let Some(task) = self.tasks.get(name) {
            task.token.cancel();
        }
    }

    pub fn get_task(&self, name: &str) -> Option<TaskView> {
        self.tasks.get(name).map(|task| TaskView {
            name: name.to_string(),
            status: task.status.clone(),
            updated_at: task.updated_at,
        })
    }

    pub fn list_tasks(&self) -> Vec<TaskView> {
        self.tasks
            .iter()
            .map(|item| TaskView {
                name: item.key().clone(),
                status: item.status.clone(),
                updated_at: item.updated_at,
            })
            .collect()
    }

    pub async fn stop_all(&self) {
        for task in self.tasks.iter() {
            task.token.cancel();
        }

        self.tracker.close();
        self.tracker.wait().await;
    }

    fn now() -> u64 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs()
    }
}
