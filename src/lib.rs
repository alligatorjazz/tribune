use std::{
    fs,
    io::{self, stdout, Write},
    path::{Path, PathBuf},
};

use error::BuildError;
use gray_matter::{engine::YAML, Matter};
use html_editor::{parse, Node};
use markdown::{build_markdown, load_markdown};
use pathdiff::diff_paths;
use serde::{Deserialize, Serialize};
use walkdir::WalkDir;
use widgets::attach_widgets;

pub mod error;
pub mod markdown;
pub mod posts;
pub mod site;
pub mod widgets;

#[derive(PartialEq, Eq)]
pub enum IgnoreLevel {
    Watch,
    Markdown,
    Build,
}

#[derive(PartialEq, Eq, Debug)]
pub enum BuildType {
    HTML,
    Markdown,
    Other,
}

pub type GenericResult<T> = Result<T, Box<dyn std::error::Error>>;

const CONFIG_FILE_PATH: &str = "tribuneconfig.json";

#[derive(Serialize, Deserialize, Debug)]
struct RSSConfig {
    title: Option<String>,
    link: Option<String>,
    description: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Config {
    rss: Option<RSSConfig>,
}

const DEFAULT_IGNORE: [&str; 9] = [
    "build",
    ".git",
    ".gitignore",
    "tribune",
    "tribune.exe",
    "tribuneconfig.json",
    ".vscode",
    ".DS_Store",
    "widgets",
];

const MARKDOWN_IGNORE: [&str; 3] = ["templates", ".tribuneignore", "widgets"];
const BUILD_IGNORE: [&str; 1] = ["posts"];

const DEBUG_IGNGORE: [&str; 10] = [
    "src",
    "target",
    "Cargo.toml",
    "Cargo.lock",
    "Makefile",
    "preload.js",
    "README.md",
    "load.js",
    "tribune-macos.zip",
    "tribune-x86_64.zip",
];

const IGNORE_FILE: &str = ".tribuneignore";

pub fn get_ignored(level: IgnoreLevel) -> Vec<String> {
    let mut ignored: Vec<String> = DEFAULT_IGNORE.iter().copied().map(String::from).collect();

    if level == IgnoreLevel::Markdown {
        ignored.append(&mut MARKDOWN_IGNORE.iter().copied().map(String::from).collect());
    }

    if level == IgnoreLevel::Build {
        ignored.append(&mut MARKDOWN_IGNORE.iter().copied().map(String::from).collect());
        ignored.append(&mut BUILD_IGNORE.iter().copied().map(String::from).collect());
    }

    // add rust files to ignore when debugging
    #[cfg(debug_assertions)]
    ignored.append(&mut DEBUG_IGNGORE.iter().copied().map(String::from).collect());

    // try to load paths from .tribuneignore
    if Path::exists(Path::new(IGNORE_FILE)) {
        let load_paths = |path: &Path| -> Result<Vec<String>, Box<dyn std::error::Error>> {
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

fn create_config() -> GenericResult<()> {
    Ok(fs::write(
        CONFIG_FILE_PATH,
        r#"
		{
			"rss": {
				// "title": "your blog's title!",
				// "link": "your blog's link!",
				// "description": "your blog's description!"
			}
		}
	"#,
    )?)
}

pub fn read_config() -> GenericResult<Config> {
    let buffer = fs::read(CONFIG_FILE_PATH)?;
    let config: Config = serde_json::from_slice(&buffer)?;
    Ok(config)
}

pub fn create_program_files(wipe: bool) -> GenericResult<()> {
    // check if tribune has been run / tribuneconfig.json exists
    if !Path::exists(Path::new("tribuneconfig.json")) {
        println!("Hey! I see it's your first time running Tribune.");
        println!("Tribune needs access to a folder in your site called \"build\" to do its thing.");
        println!("Every time you run Tribune, it's going to wipe the \"build\" folder and recreate it again.");
        println!("If you don't have a folder in your site called \"build\", you've got nothing to worry about!");
        println!("If you do, make sure you rename it to something else before you continue. Once you're ready, press enter.");
        print!("Continue? >");
        stdout().flush().unwrap();
        let mut input = String::new();
        io::stdin().read_line(&mut input).unwrap();
        create_config().unwrap();
    }

    // wipe build folder if it exists
    // println!("Creating build folder...");
    if Path::exists(Path::new("build")) && wipe {
        fs::remove_dir_all("build")?;
    }

    Ok(fs::create_dir_all("build/widgets")?)
}

pub fn get_build_path(path: &Path) -> Result<PathBuf, BuildError> {
    let root = Path::new(".").canonicalize().unwrap();
    // checks that path is within site folder
    if !path.starts_with(&root) {
        return Err(BuildError::OutOfBounds {
            path: path.to_path_buf(),
            root: root.to_path_buf(),
        });
    }
    match diff_paths(path, root) {
        Some(diff_path) => Ok(Path::new("build").join(diff_path)),
        None => Err(BuildError::Unknown {
            path: path.to_path_buf(),
        }),
    }
}

pub fn load_vdom(path: &Path) -> GenericResult<Vec<Node>> {
    let buffer = fs::read(path)?;
    let string = String::from_utf8(buffer)?;
    Ok(parse(&string)?)
}

pub fn build_file(path: &Path, build_type: BuildType) -> GenericResult<()> {
    let build_path = get_build_path(path)?;
    let parser = Matter::<YAML>::new();
    match build_type {
        BuildType::HTML => {
            let page_with_scripts = attach_widgets(load_vdom(path)?)?;
            fs::write(build_path, page_with_scripts)?
        }
        BuildType::Markdown => build_markdown(&build_path, &load_markdown(path, &parser)?)?,
        BuildType::Other => {
            // make all intermediate folders before continuing
            match build_path.parent() {
                Some(dir_path) => {
                    fs::create_dir_all(dir_path)?;
                    let copy_result = fs::copy(path, &build_path);
                    if copy_result.is_err() {
                        println!("Failed to copy {:?} to {:?}", path, build_path)
                    }
                }
                None => println!(
                    "Could not create directory for built file ({:?} -> {:?})",
                    path, build_path
                ),
            }
        }
    }
    Ok(())
}

pub fn build_dir(dir: &Path) -> GenericResult<()> {
    for dir_entry in WalkDir::new(dir) {
        match dir_entry {
            Ok(entry) => {
                let path = entry.path();
                let mut copy_path = true;
                for ignored in get_ignored(IgnoreLevel::Build) {
                    let ignore_path = fs::canonicalize(ignored);
                    if ignore_path.is_ok()
                        && fs::canonicalize(path)
                            .unwrap()
                            .starts_with(ignore_path.unwrap())
                    {
                        copy_path = false;
                        break;
                    }
                }

                if copy_path && path.is_file() {
                    println!("building file: {:?}", path);
                    let build_type = match path.extension() {
                        Some(extension) => match extension.to_str() {
                            Some("html") => BuildType::HTML,
                            Some("md") | Some("mdx") => BuildType::Markdown,
                            _ => BuildType::Other,
                        },
                        None => BuildType::Other,
                    };
                    build_file(path, build_type)?
                }
            }
            Err(err) => println!("Could not build file: {}", err),
        }
    }

    println!("finished build for dir {:?}", dir);
    Ok(())
}
