use futures::stream::TryStreamExt;
use mongodb::bson::{doc, oid::ObjectId, Document};
use mongodb::options::{FindOneOptions, FindOptions, ReplaceOptions, UpdateModifications};
use mongodb::{Collection, Database};
use serde::de::DeserializeOwned;
use serde::Serialize;
use std::{error, str};
use crate::apple::Result;


pub mod mgo;
