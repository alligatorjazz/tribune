use std::{fs, io, path::Path};
use notify::{FsEventWatcher, RecursiveMode, Watcher};
use pathdiff::diff_paths;

const WATCH_IGNOREDIRS: &[&str] = &[".tribune", ".git"];

fn create_program_files() -> io::Result<()> {
	// create build folder
	fs::create_dir_all(".tribune")
	// TODO: create config
}

fn build_site() -> io::Result<()>{
	create_program_files()?;
	match fs::read("index.html") {
		Ok(raw_buffer) => {
			let content = String::from_utf8(raw_buffer).expect("Could not convert site to string.");
			fs::write(".tribune/index.html", content)?

		},
		Err(err) => panic!("{err}")
	}

	Ok(())
}

fn build_watcher() -> Result<FsEventWatcher, notify::Error> {

	// Automatically select the best implementation for your platform.
    notify::recommended_watcher(|res: Result<notify::Event, notify::Error>| {
        match res {
           Ok(event) => {
				for path in event.paths {
					let relative_path = diff_paths(path, Path::new(".")).unwrap();
					let path_name = relative_path.to_str().unwrap();
					
					for ignored in WATCH_IGNOREDIRS {
						let ignore_path = fs::canonicalize(ignored).unwrap();
						let ignore_path_name = ignore_path.to_str().unwrap();
						println!("Checking {path_name} against {ignore_path_name}");
						if relative_path.starts_with(ignore_path) {
							println!("Event in ignored path {ignored}, ignoring");
							break;
						} else {
							build_site().unwrap();
						}
					}
				}
		   },
           Err(e) => println!("watch error: {:?}", e),
        }
    })
}

fn main() -> Result<(), Box<dyn std::error::Error>>{
	build_site()?;
	println!("Starting watcher...");
	let mut watcher = build_watcher()?;
	watcher.watch(Path::new("."), RecursiveMode::Recursive)?;
	println!("Starting server...");
	devserver_lib::run("localhost", 8080, ".tribune", true, "");
	Ok(())
}
