use super::*;

#[derive(Debug)]
pub struct Static {
    path: PathBuf,
}

impl Static {
    pub fn find() -> Self {
        Self {
            path: PathBuf::from(Path::new(".")),
        }
    }
    pub fn image_path(&self) -> PathBuf {
        let base = self.path.clone();
        base.join("static").join("images")
    }

    pub fn imgs_404(&self) -> PathBuf {
        let base = self.path.clone();
        base.join("static").join("404").join("not_found.jpg")
    }
}
