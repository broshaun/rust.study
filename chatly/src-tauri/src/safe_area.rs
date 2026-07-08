use serde::Serialize;


#[derive(Debug, Serialize)]
pub struct SafeArea {

    pub top: f64,

    pub bottom: f64,

    pub left: f64,

    pub right: f64,

}



#[tauri::command]
pub fn get_safe_area() -> SafeArea {

    #[cfg(target_os = "android")]
    {
        return android_safe_area();
    }


    #[cfg(target_os = "ios")]
    {
        return ios_safe_area();
    }


    // Windows / macOS / Linux
    SafeArea {

        top:0.0,

        bottom:0.0,

        left:0.0,

        right:0.0,

    }

}



#[cfg(target_os = "android")]
fn android_safe_area() -> SafeArea {

    // TODO:
    // Android WindowInsets 需要 JNI
    // 纯 Rust 无法直接访问 Activity


    SafeArea {

        top:0.0,

        bottom:0.0,

        left:0.0,

        right:0.0,

    }

}



#[cfg(target_os = "ios")]
fn ios_safe_area() -> SafeArea {

    // TODO:
    // iOS 需要 objc2 UIKit


    SafeArea {

        top:0.0,

        bottom:0.0,

        left:0.0,

        right:0.0,

    }

}