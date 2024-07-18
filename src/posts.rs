use std::{fs, path::Path};

use gray_matter::{engine::YAML, Matter};
use notify::RecommendedWatcher;
use scraper::{ElementRef, Html};

use crate::{site::attach_scripts, BlogPostData};

pub fn build_posts() -> Result<(), Box<dyn std::error::Error>> {
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
                    None => path.file_stem().unwrap().to_str().unwrap(),
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


pub fn build_post_watcher() -> Result<RecommendedWatcher, notify::Error> {
    // Automatically select the best implementation for your platform.
    notify::recommended_watcher(|res: Result<notify::Event, notify::Error>| match res {
        Ok(_) => {
            build_posts().unwrap();
        }
        Err(e) => println!("watch error: {:?}", e),
    })
}