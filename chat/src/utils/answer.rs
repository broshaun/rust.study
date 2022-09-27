use actix_web::web;
use serde_json::{json,Value};
use serde::Serialize;


#[allow(dead_code)]
#[derive(Serialize)]
pub enum Rsp<T> {
    Next{msg:Option<String>},
    Exchange{msg:Option<String>},
    Ok{msg:Option<String>,data:Option<T>},
    Customize{code:u8,msg:String,data:Option<T>},
    LoginFail{msg:Option<String>},
    NoContent{msg:Option<String>},
    AuthFail{msg:Option<String>},
    SignFail{msg:Option<String>},
    KeyNull{msg:Option<String>},
    NotFound{msg:Option<String>}
}


impl<T> Rsp<T>
where
    T: std::fmt::Debug + Serialize,
{
    pub fn to_json(&self) -> web::Json<Value> {
        match self {
            Self::Next{msg} => {
                match msg {
                    Some(a) => {
                        web::Json(json!({"code":100,"message":a,"data": ""}))
                    }
                    None =>{
                        web::Json(json!({"code":100,"message":"继续","data": ""}))
                    }
                }
                
            }
            Self::Exchange{msg} => {
                match msg {
                    Some(a) => {
                        return web::Json(json!({"code":101,"message":a,"data": "" }));
                    },
                    None  => {
                        web::Json(json!({"code":101,"message":"切换协议","data": ""}))
                    }
                }
            }
            Self::Ok{msg,data} => {
                let message = match msg {
                    Some(a)=>{
                        a
                    }
                    None =>{
                        ""
                    }
                };
                match data {
                    Some(a) => {
                        web::Json(json!({"code":200,"message":message,"data": a }))
                    }
                    None => {
                        web::Json(json!({"code":200,"message":message,"data": "" }))
                    }
                }  
            }
            Self::Customize{code,msg,data} => {
                match data {
                    Some(a) => {
                        web::Json(json!({"code":code,"message":msg,"data": a }))
                    }
                    None => {
                        web::Json(json!({"code":code,"message":msg,"data": "" }))
                    }
                }  
            }
            Self::LoginFail{msg} => {
                match msg {
                    Some(a) => {
                        web::Json(json!({"code": 203, "message": a, "data": ""}))
                    }
                    None => {
                        web::Json(json!({"code": 203, "message": "密码或账号错误", "data": ""}))
                    }
                }
            }
           
            Self::NoContent{msg} => {
                match msg {
                    Some(a) => {
                        web::Json(json!({"code": 204, "message": a, "data": ""}))
                    }
                    None => {
                        web::Json(json!({"code": 204, "message": "无内容", "data": ""}))
                    }
                }
            }
            Self::AuthFail{msg} => {
                match msg {
                    Some(a) => {
                        web::Json(json!({"code": 332, "message": a, "data": ""}))
                    }
                    None => {
                        web::Json(json!({"code": 332, "message": "请输入 Headers Authorization: {token}", "data": ""}))
                    }
                }
            }
            Self::SignFail{msg} => {
                match msg {
                    Some(a) => {
                        web::Json(json!({"code": 333, "message": a, "data": ""}))
                    }
                    None => {
                        web::Json(json!({"code": 333, "message": "验签失效，请重新登录！", "data": ""}))
                    }
                }
            }
            Self::KeyNull{msg} => {
                match msg {
                    Some(a) => {
                        web::Json(json!({"code": 333, "message": a, "data": ""}))
                    }
                    None => {
                        web::Json(json!({"code": 333, "message": "缺少字段和值!", "data": ""}))
                    }
                }
            }
            Self::NotFound{msg} => {
                match msg {
                    Some(a) => {
                        web::Json(json!({"code": 404, "message": a, "data": ""}))
                    }
                    None => {
                        web::Json(json!({"code": 404, "message": "找不到页面", "data": ""}))
                    }
                }
            }
        }
    }
}
