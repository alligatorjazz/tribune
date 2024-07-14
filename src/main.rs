use fs_extra::{copy_items, dir};
use notify::{FsEventWatcher, RecursiveMode, Watcher};
use pathdiff::diff_paths;
use scraper::{ElementRef, Html, Selector};
use std::{fs, io, path::Path};

// TODO: remove target later
const IGNOREPATHS: &[&str] = &[
    ".tribune",
    ".git",
    "target",
    "Cargo.toml",
    "Makefile",
    "Cargo.lock",
    "src",
    ".gitignore",
    "preload.js"
];

const WIDGET_PATH: &str = "widgets";

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
        // TODO: special case for html
        let entry = dir_entry?;
        let mut copy_file = true;
        for ignored in IGNOREPATHS {
            let ignore_path = fs::canonicalize(ignored).unwrap();
            if fs::canonicalize(entry.path())
                .unwrap()
                .starts_with(ignore_path)
            {
                copy_file = false;
                break;
            }
        }

        if !copy_file {
            continue;
        }

        // if the file is either not .html or a widget
		// if the file is a directory
		if copy_file && entry.path().is_dir() {
			copy_items(
                &[entry.path()],
                ".tribune",
                &dir::CopyOptions::new(),
            )?;
			continue;
		}
        if copy_file && entry.path().extension().unwrap().to_str() != Some("html") {
            copy_items(
                &[entry.path().into_os_string()],
                ".tribune",
                &dir::CopyOptions::new(),
            )?;
            continue;
        }

        // attaches widget scripts to html - loading dominator
        let html_buffer = fs::read(entry.path())?;
        let html_text = String::from_utf8(html_buffer)?;
        let vdom = Html::parse_document(&html_text);
        let body_selector = Selector::parse("body")?;
        let body = vdom.select(&body_selector).next().unwrap();

        let widgets = {
            let widget_files = fs::read_dir("widgets")?;
            // generates include calls for each widget
            let mut inclusions: Vec<String> = [].to_vec();
            for f in widget_files {
                let file = f.unwrap();
                let path = file.path();
                let stem = &path.file_stem().unwrap().to_str().unwrap();
                let name = &path.file_name().unwrap().to_str().unwrap();
                inclusions.push(format!(
                    "include({{tag: '{}', path: '/widgets/{}'}})",
                    stem, name
                ))
            }
            inclusions.join("\n")
        };
        let new_body_content = format!(
            "<body>\n{}\n\n<script>{}\n\n{}</script>\n</body>",
            body.inner_html(),
            include_str!("../preload.js"),
            widgets
        );

        let new_file_content = {
            let mut root_elements: Vec<ElementRef> = Vec::new();
            for child in vdom.root_element().child_elements() {
                let element = child.value();
                let tag_name = &element.name.local.to_string();
                // println!("Qualified element name: {tag_name:?}");
                if tag_name != "body" {
                    root_elements.push(child)
                }
            }

            let mut strings: Vec<String> = Vec::new();
            for element in root_elements {
				strings.push(element.html());
				if (element.value().name.local.to_string() == "head") {
					strings.push(new_body_content.to_string())
				}   
            }
            strings.join("\n")
        };

        fs::write(Path::new(".tribune").join(entry.path()), new_file_content)?;
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
