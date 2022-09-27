
pub mod conf;
pub mod model;
pub mod utils;
pub type Result<T> = std::result::Result<T, Box<dyn std::error::Error>>;