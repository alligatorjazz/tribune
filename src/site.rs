use std::path::Path;

use notify::RecommendedWatcher;

use crate::{
    build_dir, build_file, create_program_files, get_ignored, posts::build_posts, BuildType,
    GenericResult, IgnoreLevel,
};

pub fn build_site(wipe: bool) -> GenericResult<()> {
    create_program_files(wipe)?;
    // check that index.html exists specifically
    if !Path::new("index.html").exists() {
        panic!("There must be an index.html file in the folder you intend to use Tribune in.");
    }

    // copies all site files into tribune folder
    build_dir(&Path::new(".").canonicalize().unwrap())?;
    build_posts()?;
    Ok(())
}

pub fn build_watcher() -> GenericResult<RecommendedWatcher> {
    // Automatically select the best implementation for your platform.
    let watcher =
        notify::recommended_watcher(|res: Result<notify::Event, notify::Error>| match res {
            Ok(event) => {
                for path in event.paths {
                    if path.is_dir() {
                        continue;
                    }

                    // rebuild entire site on template change
                    // TODO: make it so this isn't neccesary lmao - just get the list of files
                    // that actually use the templates / widgets being changed and only rebuild them
                    if let Ok(template_path) = Path::new("templates").canonicalize() {
                        if path.starts_with(template_path) {
                            let _ = build_site(false);
                            break;
                        }
                    }

                    if let Ok(widget_path) = Path::new("widgets").canonicalize() {
                        if path.starts_with(widget_path) {
                            let _ = build_site(false);
                            break;
                        }
                    }

                    let mut copy_file = true;
                    let ignored_paths = get_ignored(IgnoreLevel::WATCH);
                    for ignored_path in ignored_paths {
                        if let Ok(ignored) = Path::new(&ignored_path).canonicalize() {
                            if path.starts_with(ignored) {
                                copy_file = false;
                                break;
                            }
                        }
                    }

                    if !copy_file {
                        // println!("not copying path {path:?} - ignored");
                        continue;
                    }

                    // println!("building path {path:?}");
                    if let Some(extension) = path.extension() {
                        let _ = match extension.to_str().unwrap() {
                            "html" => build_file(&path, BuildType::HTML),
                            "md" | "mdx" => build_file(&path, BuildType::Markdown),
                            _ => build_file(&path, BuildType::Other),
                        };
                    } else {
                        let _ = build_file(&path, BuildType::Other);
                    }

                    println!("Changed {path:?}, refreshing")
                }
            }
            Err(e) => println!("Watch Error: {:?}", e),
        })?;
    Ok(watcher)
}
