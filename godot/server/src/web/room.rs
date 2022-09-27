
use super::*;
use model::room;
use utils::{answer,helper::mgo};

#[derive(Debug, Serialize, Deserialize)]
pub struct UpRoom {
    key: i32,
    ip: String,
}
/**
 * 更新在线状态
 */
pub async fn update(
    state: Extension<Arc<State>>,
    Json(payload): Json<UpRoom>,
) -> impl IntoResponse {

    let rsp: answer::Rsp<()>;
    let mgo_room = mgo::Mgo::<room::Room>::con(&state.db, "room");
    let filter = doc! {"key":payload.key};
    let mut room = match mgo_room.first(Some(filter), None).await {
        Ok(oproom) => match oproom {
            Some(room) => room,
            None => room::Room::new(payload.key),
        },
        Err(err) => {
            println!("{:?}", err);
            rsp = answer::Rsp::Exception;
            return rsp.json();
        }
    };

    let room = match room.expired(payload.ip) {
        Ok(r) => r,
        Err(err) => {
            println!("{:?}", err);
            rsp = answer::Rsp::Exception;
            return rsp.json();
        }
    };

    match mgo_room.save(doc! {"key":payload.key}, room.clone()).await {
        Ok(opt) => opt,
        Err(err) => {
            println!("{:?}", err);
            rsp = answer::Rsp::Exception;
            return rsp.json();
        }
    };

    match room.udp_send().await {
        Ok(()) => {
            rsp = answer::Rsp::Ok(());
            return rsp.json();
        }
        Err(err) => {
            println!("发送错误{:?}", err);
        }
    };
    rsp = answer::Rsp::Ok(());
    return rsp.json();
}

/**
 * 离开房间
 */
pub async fn leave(state: Extension<Arc<State>>, Json(payload): Json<UpRoom>) -> impl IntoResponse {
    let rsp: answer::Rsp<()>;
    let mgo_room = mgo::Mgo::<room::Room>::con(&state.db, "room");
    let filter = doc! {"key":&payload.key};
    let mut room = match mgo_room.first(Some(filter.clone()), None).await {
        Ok(oproom) => match oproom {
            Some(room) => room,
            None => {
                let key = payload.key;
                room::Room {
                    key,
                    ip_list: Vec::new(),
                }
            }
        },
        Err(err) => {
            println!("{:?}", err);
            rsp = answer::Rsp::Exception;
            return rsp.json();
        }
    };

    let room = room.delete(payload.ip);

    match mgo_room.save(filter, room.clone()).await {
        Ok(opt) => opt,
        Err(err) => {
            println!("{:?}", err);
            rsp = answer::Rsp::Exception;
            return rsp.json();
        }
    };

    match room.udp_send().await {
        Ok(()) => {
            rsp = answer::Rsp::Ok(());
            return rsp.json();
        }
        Err(err) => {
            println!("发送错误{:?}", err);
        }
    }

    rsp = answer::Rsp::Ok(());
    return rsp.json();
}
