use super::*;

#[derive(Clone)]
pub struct Mgo<T> {
    col: Collection<T>,
}

impl<T> Mgo<T>
where
    T: Serialize,
    T: DeserializeOwned,
    T: Unpin,
    T: Send,
    T: Sync,
{
    pub fn con(db: &Database, col: &str) -> Self {
        Self {
            col: db.collection::<T>(&col),
        }
    }

    pub async fn insert(&self, col: T) -> Result<Option<ObjectId>> {
        let options = None;
        match self.col.insert_one(col, options).await {
            Ok(id) => Ok(id.inserted_id.as_object_id()),
            Err(err) => Err(err.into()),
        }
    }

    pub async fn delete(&self, id: ObjectId) -> Result<u64> {
        let options = None;
        match self.col.delete_one(doc! {"_id":&id}, options).await {
            Ok(rst) => Ok(rst.deleted_count),
            Err(err) => Err(err.into()),
        }
    }

    pub async fn update(&self, id: ObjectId, update:Document) -> Result<u64> {
        let options = None;
        let update = UpdateModifications::Document(update);
        match self.col.update_one(doc! {"_id":&id}, update, options).await {
            Ok(rst) => Ok(rst.modified_count),
            Err(err) => Err(err.into()),
        }
    }

    pub async fn save(&self, query: Document, col: T) -> Result<u64> {
        // let a = doc!{"_id":id};
        let options = ReplaceOptions::builder().upsert(true).build();
        match self.col.replace_one(query, col, options).await {
            Ok(rst) => Ok(rst.matched_count),
            Err(err) => Err(err.into()),
        }
    }

    pub async fn echo(&self, id: ObjectId) -> Result<Option<T>> {
        let options = None;
        let filter = doc! {"_id":&id};
        match self.col.find_one(filter, options).await {
            Ok(this) => Ok(this),
            Err(err) => Err(err.into()),
        }
    }

    pub async fn first(
        &self,
        filter: Option<Document>,
        options: Option<FindOneOptions>,
    ) -> Result<Option<T>> {
        match self.col.find_one(filter, options).await {
            Ok(this) => Ok(this),
            Err(err) => Err(err.into()),
        }
    }

    pub async fn find(
        &self,
        filter: Option<Document>,
        options: Option<FindOptions>,
    ) -> Result<Vec<T>> {
        match self.col.find(filter, options).await {
            Ok(mut cur) => {
                let mut vector: Vec<T> = Vec::new();
                while let Some(usr) = cur.try_next().await.unwrap() {
                    vector.push(usr);
                }
                Ok(vector)
            }
            Err(err) => Err(err.into()),
        }
    }
}
