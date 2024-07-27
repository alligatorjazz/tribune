use std::path::Path;

use crate::{build_dir, create_program_files, posts::build_posts, GenericResult};

pub fn build_site() -> GenericResult<()> {
    create_program_files()?;
    // check that index.html exists specifically
    if !Path::new("index.html").exists() {
        panic!("There must be an index.html file in the folder you intend to use Tribune in.");
    }

    // copies all site files into tribune folder
    build_dir(&Path::new(".").canonicalize().unwrap())?;
    build_posts()?;
    Ok(())
}
