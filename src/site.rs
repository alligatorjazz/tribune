use fs_extra::{copy_items, dir::CopyOptions};
use notify::{RecommendedWatcher, Watcher};
use pathdiff::diff_paths;
use scraper::{ElementRef, Html, Selector};
use std::{error::Error, fs, path::Path};

use crate::{create_program_files, get_widgets_source, posts::build_posts, PRELOADER};
const DEFAULT_IGNORE: [&str; 6] = [
    "build",
    ".git",
    ".gitignore",
    "tribune",
    "tribune.exe",
    "tribune.lock",
];

const BUILD_IGNORE: [&str; 2] = [
	"templates",
	"posts"
];

const DEBUG_IGNGORE: [&str; 6] = [
    "src",
    "target",
    "Cargo.toml",
    "Cargo.lock",
    "Makefile",
    "preload.js",
];

#[derive(PartialEq, Eq)]
pub enum IgnoreLevel {
	WATCH,
	BUILD
}

const IGNORE_FILE: &str = ".tribuneignore";

pub fn get_ignored(level: IgnoreLevel) -> Vec<String> {
    let mut ignored: Vec<String> = DEFAULT_IGNORE.iter().copied().map(String::from).collect();
	
	// add extra ignores when checking ignore list on build
	if level == IgnoreLevel::BUILD {
		ignored.append(&mut BUILD_IGNORE.iter().copied().map(String::from).collect());
	}

    // add rust files to ignore when debugging
    #[cfg(debug_assertions)]
    ignored.append(&mut DEBUG_IGNGORE.iter().copied().map(String::from).collect());

    // try to load paths from .tribuneignore
    if Path::exists(Path::new(IGNORE_FILE)) {
        let load_paths = |path: &Path| -> Result<Vec<String>, Box<dyn Error>> {
            let data = fs::read(path)?;
            let paths: Vec<String> = String::from_utf8(data)?
                .split('\n')
                .map(String::from)
                .collect();
            Ok(paths)
        };

        let user_ignored = load_paths(Path::new(IGNORE_FILE));
        match user_ignored {
            Ok(mut paths) => ignored.append(&mut paths),
            Err(_) => println!("Error: Could not load paths from tribune ignore."),
        }
    }

    ignored
}

pub fn attach_scripts(vdom: Html) -> Result<String, Box<dyn std::error::Error>> {
    let body_selector = Selector::parse("body")?;
    let body = vdom
        .select(&body_selector)
        .next()
        .expect("Could not read body from vdom.");

    let widgets = get_widgets_source()?;
    println!("building body content...");
    let new_body_content = format!(
        "<body>\n{}\n\n<script>{}\n\n{}</script>\n</body>",
        body.inner_html(),
        PRELOADER,
        widgets
    );
    println!("building root elements...");
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
        if element.value().name.local.to_string() == "head" {
            strings.push(new_body_content.to_string())
        }
    }
    Ok(strings.join("\n"))
}

pub fn build_site() -> Result<(), Box<dyn std::error::Error>> {
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
        for ignored in get_ignored(IgnoreLevel::BUILD) {
            let ignore_path = fs::canonicalize(ignored);
            if (ignore_path.is_ok())
                && fs::canonicalize(entry.path())
                    .unwrap()
                    .starts_with(ignore_path.unwrap())
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
        let options = CopyOptions {
            overwrite: true,
            ..Default::default()
        };

        if copy_file && entry.path().is_dir() && entry.path().to_string_lossy() != "./posts" {
            println!("copying directory: {}", entry.path().to_string_lossy());
            copy_items(&[entry.path()], "build", &options)?;
            continue;
        }

        if copy_file && entry.path().is_file() {
            println!("copying file: {}", entry.path().to_string_lossy());
            match entry.path().extension() {
                Some(extension) => {
                    if extension != "html" {
                        copy_items(&[entry.path().into_os_string()], "build", &options)?;
                        continue;
                    }

                    // attaches widget scripts to html - loading dominator
                    let html_buffer = fs::read(entry.path())?;
                    let html_text = String::from_utf8(html_buffer)?;
                    let new_file_content = attach_scripts(Html::parse_document(&html_text))?;
                    fs::write(Path::new("build").join(entry.path()), new_file_content)?;
                }
                None => {
                    copy_items(&[entry.path().into_os_string()], "build", &options)?;
                }
            }
        }
    }
    build_posts()?;
    Ok(())
}

pub fn build_site_watcher() -> notify::Result<RecommendedWatcher> {
    // Automatically select the best implementation for your platform.
    fn on_change(res: notify::Result<notify::Event>) {
        let ignored_paths = get_ignored(IgnoreLevel::WATCH);
        match res {
            Ok(event) => {
                for path in event.paths {
                    let relative_path = diff_paths(path, Path::new(".")).unwrap();
                    // let path_name = relative_path.to_str().unwrap();

                    let mut trigger_reload = true;
                    for ignored in &ignored_paths {
                        // println!("ignoring paths in watcher: {}", ignored);
                        if !Path::exists(Path::new(ignored)) {
                            continue;
                        }
                        let ignore_path = fs::canonicalize(ignored).unwrap();
                        // let ignore_path_name = ignore_path.to_str().unwrap();
                        // println!("Checking {path_name} against {ignore_path_name}");
                        if relative_path.starts_with(ignore_path) {
                            trigger_reload = false;
                            break;
                        }
                    }

                    if trigger_reload {
                        match build_site() {
                            Ok(()) => {
                                println!("Reloaded on change: {}", relative_path.to_string_lossy())
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
