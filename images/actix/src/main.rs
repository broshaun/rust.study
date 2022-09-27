mod apple;
use base64;
use actix_files::{NamedFile};
use actix_multipart::{Multipart};
use actix_web::{get, post, put, Responder};
use actix_web::{web, App, HttpServer};
use actix_web::{HttpRequest, Result};
use futures::{StreamExt, TryStreamExt};
use objectid::ObjectId;
use serde::{Deserialize, Serialize};
use std::io::Write;
use std::path::PathBuf;
use regex::Regex;
use std::cell::RefCell;
use apple::conf::{web::WEB,files::Static};
use apple::utils::{answer::Rsp};



#[actix_web::main]
async fn main() -> std::io::Result<()> {

    let addr = WEB::https();
    println!("启动服务: http://{:?}",addr);
    HttpServer::new(move || {
        App::new()
            .service(hello)
            .service(imgs)
            .service(save_file)
            .service(save_base64str)
            .default_service(web::route().to(not_found))
    })
    .bind(addr)?
    .run()
    .await
}

async fn not_found() -> impl Responder {
    return Rsp::<String>::NotFound.json();
}

#[get("/")]
async fn hello() -> impl Responder {
    "Wecome to Actix Web ! This images server ."
}


// #[get("/stream")]
// async fn stream() -> HttpResponse {
//     let body = once(ok::<_, Error>(web::Bytes::from_static(b"test")));
//     let imgs_path = Conf::base().images();
//     let file_path = imgs_path.join("62189e423838623c51b7dcc7.mp3");
//     let a  = match NamedFile::open(file_path) {
        


//         HttpResponse::Ok()
//         .content_type("application/json")
//         .streaming(body)

 
// }



/**
 * 查找图片
 * rust 正则查找 \\S+\\.(png|jpg|gif|bmp|psd|tiff|tga|eps)$
*/
#[get(r"/photo/{file:\S+\.(png|jpg|jpeg|gif|bmp|psd|tiff|tga|eps)$}")]
async fn imgs(req: HttpRequest) -> Result<NamedFile> {
    let filename: PathBuf = req.match_info().query("file").parse().unwrap();
    let imgs_path = Static::find().image_path();
    let file_path = imgs_path.join(filename);
    let isfile = match NamedFile::open(file_path) {
        Ok(file) => file,
        Err(_) => NamedFile::open("static/images/not_found.jpg").unwrap(),
    };
    Ok(isfile)
}

// #[put(r"/photo/")]
#[post(r"/photo/upload/")]
async fn save_file(mut payload: Multipart) -> impl Responder {
    let mut new_filename = RefCell::new(String::new());
    // iterate over multipart stream
    while let Ok(Some(mut field)) = payload.try_next().await {
        // let content_type = field.content_disposition().unwrap();
        // println!("content_type,{}", content_type);
        let conten = match field.content_disposition() {
            Some(c) => c,
            None  => {
                return Rsp::NoContent::<String>.json();
            }
        };

        new_filename = match conten.get_filename() {
            Some(filename) => {
                let re = Regex::new(r"png|jpg|jpeg|gif|bmp|psd|tiff|tga|eps$").unwrap();
                let after = re.find(&filename);
                let suffix = match after {
                    Some(m) => &filename[m.start()..m.end()],
                    None => {
                        return Rsp::Format::<String>.json()
                    }
                };
                let oid = ObjectId::new().unwrap().to_string();
                let name = format!("{}.{}", &oid, suffix);
                RefCell::new(String::from(name))
            }
            None => return Rsp::Ok(new_filename).json()
        };
        let imgs_path = Static::find().image_path();
        let a = new_filename.borrow_mut();
        let pathfile = imgs_path.join(a.to_string());
        // println!("{:?}",pathfile);
        // File::create is blocking operation, use threadpool
        let mut f = web::block(|| std::fs::File::create(pathfile))
            .await
            .unwrap();

        // Field in turn is stream of *Bytes* object
        while let Some(chunk) = field.next().await {
            let data = chunk.unwrap();
            // filesystem operations are blocking, we have to use threadpool
            f = web::block(move || f.write_all(&data).map(|_| f))
                .await
                .unwrap();
        }
    }
    return Rsp::Ok(new_filename).json();
}

#[derive(Debug, Deserialize, Serialize)]
struct Body {
    base64str: String,
    md5_suffix: Option<String>,
    
}

#[post(r"/photo/")]
async fn save_base64str(mut payload: web::Payload) -> impl Responder {
   
    let mut body = web::BytesMut::new();
    while let Some(chunk) = payload.next().await {
        match chunk {
            Ok(c) => {
                body.extend_from_slice(&c)
            }
            Err(e) => {
                return Rsp::Format::<String>.json();
            }
        }

        
    };
    let js = match serde_json::from_slice::<Body>(&body) {
        Ok(j)  => {
            j
        },
        Err(e) => {
            return Rsp::Format::<String>.json();
        }
    };

    let basestr = js.base64str.clone();
    // let basestr = image_base64::to_base64(r"F:\Coder\images\static\images\6214598a376432bb7e470ccd.jpg");
    // println!("{:?}",basestr);

    let image = match base64::decode(basestr) {
        Ok(img) => img,
        Err(e) => {
            return Rsp::Format::<String>.json();
        }
    };

    let filename = match js.md5_suffix.clone() {
        Some(f) => {
            f
        }
        None => {
            return Rsp::KeyNull::<String>.json();
        }
    };

    let pathimgs = Static::find().image_path();
    let pathfile = pathimgs.join(&filename);
    println!("新文件{:?}",pathfile);
    let a = &image[..];
    let mut file  = match std::fs::File::create(pathfile) {
        Ok(f)  => f,
        Err(e) =>  {
            return Rsp::Format::<String>.json();
        }
    };
    
    match file.write_all(a) {
        Ok(_) => { 
            Rsp::Ok(filename).json()
        }
        Err(e) => {
            return Rsp::Format::<String>.json();
        }
    }
}
