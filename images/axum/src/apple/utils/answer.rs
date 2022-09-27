use axum::Json;
use serde::Serialize;
use serde_json::{json, Value};

#[allow(dead_code)]
pub enum Rsp<T> {
    Ok(T),
    Next,
    Exchange,
    LoginFail,
    NoContent,
    Format,
    SignFail,
    KeyNull,
    Repeat,
    NotFound,
    Exception,
}

impl<T> Rsp<T>
where
    T: Serialize,
{
    pub fn json(&self) -> Json<Value> {
        match self {
            Rsp::Next => Json(json!({"code":100,"message":"继续","data": ""})),
            Rsp::Ok(data) => Json(json!({"code": 200, "message": "", "data": data})),
            Rsp::Exchange => Json(json!({"code":101,"message":"切换协议","data": ""})),
            Rsp::LoginFail => Json(json!({"code": 203, "message": "密码或账号错误", "data": ""})),
            Rsp::NoContent => Json(json!({"code": 204, "message": "无内容", "data": ""})),
            Rsp::Format => Json(json!({"code": 332, "message": "无效格式", "data": ""})),
            Rsp::SignFail => Json(json!({"code": 333, "message": "验签失效,请重新登录!", "data":""})),
            Rsp::KeyNull => Json(json!({"code": 333, "message": "缺少字段和值!", "data": ""})),
            Rsp::Repeat => Json(json!({"code": 336, "message": "数据已存在！", "data": ""})),
            Rsp::NotFound => Json(json!({"code": 404, "message": "找不到页面", "data": ""})),
            Rsp::Exception => Json(json!({"code": 500, "message": "Debug!!!", "data": ""})),
        }
    }
}
