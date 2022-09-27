use axum::{
    extract::{ContentLengthLimit, Multipart, Path,BodyStream,Json,Query},
    http::header::{HeaderMap, HeaderName, HeaderValue},
    response::IntoResponse,
    response::Html,
    routing::{get, post},
    Router
};
use std::{fs,str::{self, FromStr},net};
mod apple;
use apple::conf::{files::Static,web::WEB};
use apple::utils::answer::Rsp;
use serde::{Serialize, Deserialize};
use futures::StreamExt;
use std::io::Write;
use bytes::BytesMut;
use regex::Regex;
use std::collections::HashMap;







#[tokio::main]
async fn main() {
    let app = Router::new()
        .route(r"/", get(root))
        .route(r"/photo/", post(save_base64str).put(save_image))
        .route(r"/photo/upload/", post(save_image))
        .route(r"/photo/:id", get(show_image))
        .route(r"/show_upload/", get(show_upload))
        .route(r"/images/", post(save_base64str).put(save_image).delete(imgs_delete).get(imgs_show).options(imgs_list));
        
        
    let add = WEB::https();
    let add = net::SocketAddr::from_str(&add).unwrap();
    axum::Server::bind(&add).serve(app.into_make_service()).await.unwrap();
}



async fn root() -> &'static str {
    "Wecome to images Axum server."
}


// 上传表单
async fn show_upload() -> Html<&'static str> {
    Html(
        r#"
        <!doctype html>
        <html>
            <head>
            <meta charset="utf-8">
                <title>上传文件(仅支持图片上传)</title>
            </head>
            <body>
                <form action="/save_image" method="post" enctype="multipart/form-data">
                    <label>
                    上传文件(仅支持图片上传)：
                        <input type="file" name="file">
                    </label>
                    <button type="submit">上传文件</button>
                </form>
            </body>
        </html>
        "#,
    )
}

// 上传图片
async fn save_image(ContentLengthLimit(mut multipart): ContentLengthLimit<Multipart,{1024 * 1024 * 20}>) -> impl IntoResponse {
    let mut filename:String="01.unk".to_owned();
    match multipart.next_field().await {
        Ok(f)=>{
            if let Some(file) = f {
                //文件类型
                let content_type = match file.content_type() {
                    Some(typ)=> typ.to_string(),
                    None=> {
                        return Rsp::Format::<String>.json();
                    }
                }; 
                // 校验是否为图片
                if content_type.starts_with("image/") {
                    //提取"/"的index位置
                    let index = content_type.find("/").map(|i| i).unwrap_or(usize::max_value());
                    //文件扩展名
                    let ext_name= &content_type[index + 1..];
                    //文件内容,md5验证
                    let data = match file.bytes().await{
                        Ok(bts)=> bts,
                        Err(err)=>{
                            println!("{:?}",err);
                            return Rsp::Format::<String>.json();
                        }
                    };
                    
                    let digest = md5::compute(&data);
                    //最终保存在服务器上的文件名
                    filename = format!("{:?}.{}", digest,ext_name.replace("jpeg","jpg"));
                    let path = Static::find().image_path();
                    let save_filename = path.join(&filename);
                    //保存上传的文件
                    if let Err(err)= tokio::fs::write(&save_filename, &data).await.map_err(|err| err.to_string()){
                        println!("{:?}",err);
                        return Rsp::Format::<String>.json();
                    };
                }
            }
        }
        Err(err)=>{
            println!("{:?}",err);
            return Rsp::Format::<String>.json();
        }
    }
    Rsp::Ok(filename).json()
}


#[derive(Debug, Serialize, Deserialize)]
struct Body {
    base64str: String,
    md5_suffix: Option<String>,
}
async fn save_base64str(mut stream: BodyStream) -> impl IntoResponse {
    let mut bmt = BytesMut::new();
    while let Some(chunk) = stream.next().await {
        match chunk {
            Ok(bts) => {
                bmt.extend_from_slice(&bts)
            }
            Err(err) => {
                println!("{:?}",err);
                return Rsp::Format::<String>.json();
            }
        }
    };

    let body:Body = match serde_json::from_slice(&bmt) {
        Ok(by)  => by,
        Err(err) => {
            println!("{:?}",err);
            return Rsp::Format::<String>.json();
        }
    };
    let basestr = body.base64str.clone();
    let img_buf = match base64::decode(basestr) {
        Ok(img) => img,
        Err(err) => {
            println!("{:?}",err);
            return Rsp::Format::<String>.json();
        }
    };
    let new_filename = match body.md5_suffix.clone() {
        Some(ofname) => {
            let re = match Regex::new(r"png|jpg|jpeg|gif|bmp|psd|tiff|tga|eps$"){
                Ok(com)=> com,
                Err(err)=>{
                    println!("{:?}",err);
                    return Rsp::Exception::<String>.json();
                }
            };
            let after = re.find(&ofname);
            let suffix = match after {
                Some(m) => &ofname[m.start()..m.end()],
                None => {
                    return Rsp::Format::<String>.json()
                }
            };
            let digest = md5::compute(&img_buf);
            format!("{:?}.{}",digest,suffix.replace("jpeg","jpg"))
        }
        None => {
            return Rsp::KeyNull::<String>.json();
        }
    };
    let img_path = Static::find().image_path();
    let img_path = img_path.join(&new_filename);
    let mut file  = match std::fs::File::create(img_path) {
        Ok(f)  => f,
        Err(err) =>  {
            println!("{:?}",err);
            return Rsp::Format::<String>.json();
        }
    };
    match file.write_all(&img_buf) {
        Ok(_) => { 
            Rsp::Ok(new_filename).json()
        }
        Err(err) => {
            println!("{:?}",err);
            return Rsp::Format::<String>.json();
        }
    }
}

/**
 * 显示图片
 */
async fn imgs_show(Query(params): Query<HashMap<String, String>>) -> (HeaderMap, Vec<u8>) {
    let imgs_find = Static::find();
    let file_name;
    let file_path;
    match params.get("file_name") {
        Some(f)=>{
            file_name = f.clone();
            file_path = imgs_find.image_path().join(&file_name);
        }
        None => {
            file_name = "404.unk".to_owned();
            file_path = imgs_find.imgs_404();
        }
    }
    let index = file_name.find(".").map(|i| i).unwrap_or(usize::max_value());
    let ext_name = &file_name[index + 1..]; //文件扩展名
    let content_type = format!("image/{}", ext_name);
    let mut headers = HeaderMap::new();
    let a = HeaderValue::from_str(&content_type);
    let hval = match a {
        Ok(v)=>v,
        Err(_)=>{
            headers.insert(
                HeaderName::from_static("content-type"),
                HeaderValue::from_str("image/jpg").unwrap()
            );
            let rst = fs::read(imgs_find.imgs_404()).unwrap();
            return (headers, rst)
        }
    };
    headers.insert(
        HeaderName::from_static("content-type"),
        hval
    );
    let rst = fs::read(&file_path);
    match rst {
        Ok(buf)=>{
            return (headers, buf)
        }
        Err(_)=>{
            headers.insert(
                HeaderName::from_static("content-type"),
                HeaderValue::from_str("image/jpg").unwrap()
            );
            let rst = fs::read(imgs_find.imgs_404()).unwrap();
            return (headers, rst)
        }
    }
}

async fn show_image(Path(id): Path<String>) -> (HeaderMap, Vec<u8>) {
    let imgs_find = Static::find();

    let file_name=id;
    let file_path=imgs_find.image_path().join(&file_name);
    

    let index = file_name.find(".").map(|i| i).unwrap_or(usize::max_value());
    let ext_name = &file_name[index + 1..];//文件扩展名
    let content_type = format!("image/{}", ext_name);
    let mut headers = HeaderMap::new();
    let a = HeaderValue::from_str(&content_type);
    let hval = match a {
        Ok(v)=>v,
        Err(_)=>{
            headers.insert(
                HeaderName::from_static("content-type"),
                HeaderValue::from_str("image/jpg").unwrap()
            );
            let rst = fs::read(imgs_find.imgs_404()).unwrap();
            return (headers, rst)
        }
    };
    headers.insert(
        HeaderName::from_static("content-type"),
        hval
    );

    let rst = fs::read(&file_path);
    
    match rst {
        Ok(buf)=>{
            return (headers, buf)
        }
        Err(_)=>{
            headers.insert(
                HeaderName::from_static("content-type"),
                HeaderValue::from_str("image/jpg").unwrap()
            );
            let rst = fs::read(imgs_find.imgs_404()).unwrap();
            return (headers, rst)
        }
    }
}



/**
 * 图片列表
 */
async fn imgs_list() -> impl IntoResponse {
    let imgs_path = Static::find().image_path();
    let paths = match fs::read_dir(imgs_path) {
        Ok(pth)=>pth,
        Err(err)=>{
            println!("{:?}",err);
            return Rsp::Exception::<String>.json();
        }
    };
        
    let mut pt_list = Vec::new();
    for path in paths {
        match path  {
            Ok(path)=>{
                let a = path.file_name().into_string().unwrap();
                pt_list.push(a);
            }
            Err(err)=>{
                println!("{:?}",err);
                return Rsp::Format::<String>.json();
            }
        }
    };

    Rsp::Ok(pt_list).json()
}

#[derive(Debug, Serialize, Deserialize)]
struct Del{
    filename:String
}
async fn imgs_delete(Json(payload): Json<Del>) -> impl IntoResponse {
    let imgs_path = Static::find().image_path();
    let imgs_path=imgs_path.join(payload.filename);
    match fs::remove_file(imgs_path){
        Ok(())=>{
            Rsp::Ok(true).json()
        }
        Err(err)=>{
            println!("{:?}",err);
            return Rsp::Format::<bool>.json();
        }
    }
}

