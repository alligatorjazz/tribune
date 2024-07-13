use fs_extra::{copy_items, dir};
use notify::{FsEventWatcher, RecursiveMode, Watcher};
use pathdiff::diff_paths;
use std::{fs, io, path::Path};

// TODO: remove target later
const IGNOREPATHS: &[&str] = &[".tribune", ".git", "target", "Cargo.toml", "Makefile", "Cargo.lock", "src", ".gitignore"];

fn create_program_files() -> io::Result<()> {
    // create build folder
    fs::create_dir_all(".tribune")
    // TODO: create config
}

fn build_site() -> Result<(), Box<dyn std::error::Error>> {
    create_program_files()?;
    // check that index.html exists specifically
    if !Path::new("index.html").exists() {
        panic!("There must be an index.html file in the folder you intend to use Tribune in.");
    }

    // copies all site files into tribune folder
    let root = fs::read_dir(".")?;
    for dir_entry in root {
        let entry = dir_entry?;
        let mut copy_file = true;
        for ignored in IGNOREPATHS {
            let ignore_path = fs::canonicalize(ignored).unwrap();
            if fs::canonicalize(entry.path()).unwrap().starts_with(ignore_path) {
                copy_file = false;
                break;
            }
        }

        if copy_file {
           copy_items(&[entry.path().into_os_string()], ".tribune", &dir::CopyOptions::new())?;
        }
    }

    Ok(())
}

fn build_watcher() -> Result<FsEventWatcher, notify::Error> {
    // Automatically select the best implementation for your platform.
    notify::recommended_watcher(|res: Result<notify::Event, notify::Error>| match res {
        Ok(event) => {
            for path in event.paths {
                let relative_path = diff_paths(path, Path::new(".")).unwrap();
                let path_name = relative_path.to_str().unwrap();

                let mut trigger_reload = true;
                for ignored in IGNOREPATHS {
                    let ignore_path = fs::canonicalize(ignored).unwrap();
                    let ignore_path_name = ignore_path.to_str().unwrap();
                    println!("Checking {path_name} against {ignore_path_name}");
                    if relative_path.starts_with(ignore_path) {
                        trigger_reload = false;
                        break;
                    }
                }

                if trigger_reload {
                    println!("Reloading site...");
                    build_site().unwrap();
                }
            }
        }
        Err(e) => println!("watch error: {:?}", e),
    })
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    build_site()?;
    println!("Starting watcher...");
    let mut watcher = build_watcher()?;
    watcher.watch(Path::new("."), RecursiveMode::Recursive)?;
    println!("Starting server...");
    devserver_lib::run("localhost", 8080, ".tribune", true, "");
    Ok(())
}
