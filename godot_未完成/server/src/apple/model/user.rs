use super::*;

#[derive(Debug, Serialize, Deserialize)]
pub(crate) struct User {
    pub _id: ObjectId,
    pub account: String,
    pub password: String,
}
impl User {
    pub(crate) fn new(account: String, password: String) -> Self {
        Self {
            _id: ObjectId::new(),
            account,
            password,
        }
    }
}
