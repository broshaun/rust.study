use crate::utils::answer::Rsp;
use actix_web::{options, post, web, HttpRequest, Responder};
use chrono::prelude::*;
use jwts::jws::{Algorithm, Key, Token};
use jwts::{Claims, ValidationConfig};
use serde::{Deserialize, Serialize};

static SECRET: &[u8; 16] = b"XF4lp8hvRIshEstD";
/**
 * 聊天回话标识
 */
#[derive(Debug, Deserialize, Serialize)]
pub struct Session {
    pub uid: String,
}

/**
* 解析Authorization,获取session数据
*/
pub fn parse<T>(req: HttpRequest) -> Result<Session, Rsp<String>> {
    let key = Key::new(SECRET, Algorithm::HS256);

    let token = match req.headers().get("authorization") {
        Some(str) => str.to_str().ok().unwrap(),
        None => {
            return Err(Rsp::<String>::AuthFail{msg: None});
        }
    };
    let verified: Token<Claims> = match Token::verify_with_key(token, &key) {
        Err(_) => {
            return Err(Rsp::<String>::SignFail { msg: None });
        }
        Ok(vf) => vf,
    };
    let config = ValidationConfig {
        iat_validation: true,
        nbf_validation: true,
        exp_validation: true,
        expected_iss: None,
        expected_sub: Some("chat".to_owned()),
        expected_aud: None,
        expected_jti: None,
    };

    match verified.validate_claims(&config) {
        Err(_) => {
            return Err(Rsp::<String>::SignFail{msg:None})
        }
        _ => {}
    };
    let c1 = verified.payload;
    let s1 = Session {
        uid: c1.jti.unwrap(),
    };
    return Ok(s1);
}

/**
* 获取新的聊天Token（发送帐号标识）
*/
#[post("/new_chat/")]
async fn new_session(session: web::Json<Session>) -> impl Responder {
    let tmp = Local::now().timestamp() as u64;
    let key = Key::new(SECRET, Algorithm::HS256);
    let mut claims = Claims::new();
    claims.jti = Some(session.uid.to_string());// 用戶标识
    claims.sub = Some("chat".to_owned()); // 场景
    claims.exp = Some(tmp + 1000000); //JWT到期的時間
    let mut token = Token::with_payload(claims);
    let token = match token.sign(&key) {
        Ok(str) => str,
        Err(_) => {
            return Rsp::<String>::SignFail{msg:None}.to_json();
        }
    };
    return Rsp::<String>::Ok{msg:None,data:Some(token)}.to_json();
}

/**
* 会话详情
*/
#[options("/token_verify/")]
async fn token_verify(req: HttpRequest) -> impl Responder {
    let key = Key::new(SECRET, Algorithm::HS256);
    let token = match req.headers().get("authorization") {
        Some(str) => str.to_str().ok().unwrap(),
        None => {
            return Rsp::<String>::AuthFail{msg:None}.to_json();
        }
    };
    let verified: Token<Claims> = match Token::verify_with_key(token, &key) {
        Err(_) => {
            return Rsp::<String>::SignFail{msg:None}.to_json();
        }
        Ok(vf) => vf,
    };

    let config = ValidationConfig {
        iat_validation: true,
        nbf_validation: true,
        exp_validation: true,
        expected_iss: None,
        expected_sub: Some("chat".to_owned()),
        expected_aud: None,
        expected_jti: None,
    };

    match verified.validate_claims(&config) {
        Err(_) => {
            return Rsp::<String>::SignFail{msg:None}.to_json();
        }
        _ => {}
    };
    let c1 = verified.payload;
    let s1 = Session {
        uid: c1.jti.unwrap(),
    };
    return Rsp::<Session>::Ok{msg:None,data:Some(s1)}.to_json();
}
