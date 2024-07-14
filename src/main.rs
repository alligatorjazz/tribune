use fs_extra::{copy_items, dir::CopyOptions};
use gray_matter::engine::YAML;
use gray_matter::Matter;
use notify::{RecommendedWatcher, RecursiveMode, Watcher};
use pathdiff::diff_paths;
use scraper::{ElementRef, Html, Selector};
use serde::Deserialize;
use std::{fs, io, path::Path};

// TODO: remove target later
const IGNOREPATHS: &[&str] = &[
    "build",
    ".git",
    "target",
    "Cargo.toml",
    "Makefile",
    "Cargo.lock",
    "src",
    ".gitignore",
    "preload.js",
    "templates",
    "tribune",
	"tribune.exe"
];

// const WIDGET_PATH: &str = "widgets";
#[derive(Deserialize, Debug)]
struct BlogPostData {
    title: Option<String>,
    template: Option<String>,
}

fn create_program_files() -> io::Result<()> {
    // create build folder
    fs::create_dir_all("build")
    // TODO: create config
}
fn attach_scripts(vdom: Html) -> Result<String, Box<dyn std::error::Error>> {
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
fn build_posts() -> Result<(), Box<dyn std::error::Error>> {
    let posts_path = Path::new("posts");
    if !posts_path.exists() || !posts_path.is_dir() {
        return Ok(());
    }

    let result = fs::read_dir(posts_path);
    match result {
        Ok(entries) => {
            let files = entries
                .filter_map(|entry| entry.ok())
                .filter(|file| file.path().is_file());
            let markdown_files = files.filter(|file| {
                file.path().extension().is_some() && file.path().extension().unwrap() == "md"
            });
            let parser = Matter::<YAML>::new();
            for file in markdown_files {
                let file_name = file.file_name();
                println!("compiling post: {file_name:?}");
				let path = file.path();
                let read = fs::read(&path);
                if read.is_err() {
                    println!("Could not read {file_name:?}.");
                    continue;
                }
                let file_content = String::from_utf8(read.unwrap());
                if file_content.is_err() {
                    println!("Could not load {file_name:?} as string.");
                    continue;
                }
                let raw_matter = parser.parse_with_struct::<BlogPostData>(&file_content.unwrap());
                if raw_matter.is_none() {
                    println!("Could not load frontmatter for {file_name:?}.");
                    continue;
                }
				let front_matter = raw_matter.unwrap();
                // selecting template
                let vars = &front_matter.data;
                let template = match &vars.template {
                    Some(name) => name,
                    None => "default",
                };
                let title = match &vars.title {
                    Some(text) => text,
                    None => {path.file_stem().unwrap().to_str().unwrap()},
                };

                let template_path = format!("templates/{}.html", template);
                let template_content =
                    fs::read(template_path).expect("Error loading blog template.");
                let tdom = Html::parse_document(
                    &String::from_utf8(template_content).expect("Could not load template dom."),
                );

                // load markdown into template
                let mut root_elements: Vec<ElementRef> = Vec::new();
                for child in tdom.root_element().child_elements() {
                    let element = child.value();
                    let tag_name = &element.name.local.to_string();
                    println!("Qualified element name: {tag_name:?}");
                    root_elements.push(child);
                }

                let mut strings: Vec<String> = Vec::new();
                for element in root_elements {
                    let name = element.value().name.local.to_string();
                    if name == "head" && element.has_children() {
                        strings.push("<head>".to_owned());
                        for child in element.child_elements() {
                            let child_name = child.value().name.local.to_string();
                            if child_name == "title" {
                                strings.push(format!(
                                    "<title>{} - {}</title>",
                                    child.inner_html(),
                                    title
                                ));
                            } else {
                                strings.push(child.html())
                            }
                        }
                        strings.push("</head>".to_string())
                    } else if name == "body" {
                        println!("found body element - inserting article");
                        strings.push("<body>".to_owned());
                        for child in element.child_elements() {
                            // println!("processing element {}", child.value().name());
                            if child.value().name() == "post-body" {
                                strings.push("<article>".to_owned());
                                strings.push(markdown::to_html(&front_matter.content));
                                strings.push("</article>".to_owned());
                            } else {
                                strings.push(child.html())
                            }
                        }
                        strings.push("</body>".to_owned())
                    } else {
                        strings.push(element.html());
                    }
                }

                let base_file_content = strings.join("\n");
                let new_file_content = attach_scripts(Html::parse_document(&base_file_content))?;
				let _ = fs::create_dir_all("build/posts");
                let _ = fs::write(
                    format!(
                        "build/posts/{}.html",
                        file.path().file_stem().unwrap().to_string_lossy()
                    ),
                    new_file_content,
                );
            }
            Ok(())
        }
        Err(err) => {
            println!("{err}");
            Err(Box::new(err))
        }
    }
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

        if copy_file && entry.path().is_dir() && entry.path().to_string_lossy() != "./posts"  {
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

fn build_watcher() -> Result<RecommendedWatcher, notify::Error> {
    // Automatically select the best implementation for your platform.
    notify::recommended_watcher(|res: Result<notify::Event, notify::Error>| match res {
        Ok(event) => {
            for path in event.paths {
                let relative_path = diff_paths(path, Path::new(".")).unwrap();
                // let path_name = relative_path.to_str().unwrap();

                let mut trigger_reload = true;
                for ignored in IGNOREPATHS {
                    let ignore_path = fs::canonicalize(ignored).unwrap();
                    // let ignore_path_name = ignore_path.to_str().unwrap();
                    // println!("Checking {path_name} against {ignore_path_name}");
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
    // build_posts()?;
    println!("Starting watcher...");
    let mut watcher = build_watcher()?;
    watcher.watch(Path::new("."), RecursiveMode::Recursive)?;
    println!("Starting server...");
    devserver_lib::run("localhost", 8080, "build", true, "");
	println!("Hosting server at http://localhost:8080");
    Ok(())
}
