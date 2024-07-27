use std::path::PathBuf;

use thiserror::Error;

#[derive(Error, Debug)]
pub enum BuildError {
    #[error(
        "Could not build file at {path:?} because it is outside the site root folder ({root:?})"
    )]
    OutOfBounds { path: PathBuf, root: PathBuf },

    #[error("Could not find widget")]
    WidgetNotFound,

    #[error("Failed to build file at {path:?} due to unknown error")]
    Unknown { path: PathBuf },
}
