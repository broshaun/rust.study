use super::*;
use model::{stats,room,roles,user};
use utils::{answer,helper::mgo};

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginUser {
    account: String,
    password: String,
}
pub async fn login(state: Extension<Arc<State>>,Json(payload): Json<LoginUser>) -> impl IntoResponse {
    let rsp: answer::Rsp<Vec<roles::Roles>>;
    let mgo_user = mgo::Mgo::<user::User>::con(&state.db, "user");
    let filter = Some(doc! {"account": payload.account});
    let opuser = match mgo_user.first(filter, None).await {
        Ok(usr) => usr,
        Err(err) => {
            println!("{:?}", err);
            rsp = answer::Rsp::LoginFail;
            return rsp.json();
        }
    };
    let user = match opuser {
        Some(usr) => usr,
        None => {
            rsp = answer::Rsp::LoginFail;
            return rsp.json();
        }
    };

    if user.password != payload.password {
        rsp = answer::Rsp::LoginFail;
        return rsp.json();
    }

    let mgo_roles = mgo::Mgo::<roles::Roles>::con(&state.db, "roles");
    let filter = Some(doc! {"user_id": user._id});
    match mgo_roles.find(filter, None).await {
        Ok(a) => {
            rsp = answer::Rsp::Ok(a);
            rsp.json()
        }
        Err(a) => {
            println!("{:?}", a);
            rsp = answer::Rsp::Format;
            rsp.json()
        }
    }
}


pub async fn up_stats(
    state: Extension<Arc<State>>,
    Json(payload): Json<roles::Roles>,
) -> impl IntoResponse {
    let rsp: answer::Rsp<u64>;
    let mgo_roles = mgo::Mgo::<roles::Roles>::con(&state.db, "roles");

    
    
    let sts = match payload.stats {
        Some(s)=>s,
        None=>{
            rsp = answer::Rsp::Ok(0);
            return rsp.json();
        }
    };

    let b = bson::to_bson(&sts).unwrap();
    let update = doc!{"$set":{"stats":b}};

    let upcount = match  mgo_roles.update(payload._id, update).await {
        Ok(rs) => rs,
        Err(err) => {
            println!("{:?}", err);
            rsp = answer::Rsp::Exception;
            return rsp.json();
        }
    };


    rsp = answer::Rsp::Ok(upcount);
    return rsp.json();
    
}


pub async fn up_action(
    state: Extension<Arc<State>>,
    Json(payload): Json<roles::Roles>,
) -> impl IntoResponse {
    let rsp: answer::Rsp<u64>;
    let mgo_roles = mgo::Mgo::<roles::Roles>::con(&state.db, "roles");

    
    
    let sts = match payload.action {
        Some(s)=>s,
        None=>{
            rsp = answer::Rsp::Ok(0);
            return rsp.json();
        }
    };

    let b = bson::to_bson(&sts).unwrap();
    let update = doc!{"$set":{"action":b}};
    let upcount = match  mgo_roles.update(payload._id, update).await {
        Ok(rs) => rs,
        Err(err) => {
            println!("{:?}", err);
            rsp = answer::Rsp::Exception;
            return rsp.json();
        }
    };


    rsp = answer::Rsp::Ok(upcount);
    return rsp.json();
    
}