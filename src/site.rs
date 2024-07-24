use std::{fs, path::Path};

use filetime::FileTime;
use notify::{RecommendedWatcher, Watcher};
use pathdiff::diff_paths;

use crate::{
    build_dir, create_program_files, get_ignored, posts::build_posts, widgets::build_widgets, GenericResult, IgnoreLevel
};

pub fn build_site() -> GenericResult<()> {
    create_program_files()?;
    // check that index.html exists specifically
    if !Path::new("index.html").exists() {
        panic!("There must be an index.html file in the folder you intend to use Tribune in.");
    }

    // copies all site files into tribune folder
    build_dir(&Path::new(".").canonicalize().unwrap())?;
	build_widgets()?;
    build_posts()?;
    Ok(())
}

pub fn build_site_watcher() -> notify::Result<RecommendedWatcher> {
	// TODO: rewrite - this method just can't handle hot reloading robustly at all
    // Automatically select the best implementation for your platform.
    fn on_change(res: notify::Result<notify::Event>) {
        let ignored_paths = get_ignored(IgnoreLevel::WATCH);
        match res {
            Ok(event) => {
                for path in event.paths {
                    let relative_path =
                        diff_paths(&path, Path::new(".").canonicalize().unwrap()).unwrap();
                    // println!("relative path of event: {:?}", relative_path);
                    // let path_name = relative_path.to_str().unwrap();
                    let mut trigger_reload = true;
                    for ignored in &ignored_paths {
                        // println!("ignoring paths in watcher: {}", ignored);
                        if !Path::exists(Path::new(ignored)) {
                            continue;
                        }

                        // let ignore_path_name = ignored.to_string();
                        // println!("Checking {path_name} against {ignore_path_name}");
                        if relative_path.starts_with(ignored) {
                            trigger_reload = false;
                            break;
                        }
                    }

                    // checks that source is newer than target
                    let target_path = Path::new("build").join(&relative_path);
                    // println!("generated target path: {:?}", &target_path);
                    if let Ok(target_metadata) = fs::metadata(&target_path) {
                        if trigger_reload {
                            let source_metadata = fs::metadata(&relative_path);
                            if let Ok(source_metadata) = source_metadata {
                                let source_file_timestamp =
                                    FileTime::from_last_modification_time(&source_metadata)
                                        .seconds();
                                let target_file_timestamp =
                                    FileTime::from_last_modification_time(&target_metadata)
                                        .seconds();

                                // if source is older than target
                                if source_file_timestamp <= target_file_timestamp {
                                    trigger_reload = false;
                                }
                            }
                        }
                    }

                    if trigger_reload {
                        // println!("reloading on event: {:?} | {:?}", event.kind, path);
                        match build_site() {
                            Ok(()) => {
                                println!("Reloaded on change: {}", &relative_path.to_string_lossy())
                            }
                            Err(err) => println!("There was an error reloading the site: \n{err}"),
                        }
                    }
                }
            }
            Err(e) => println!("watch error: {:?}", e),
        }
    }
    RecommendedWatcher::new(on_change, notify::Config::default())
}
