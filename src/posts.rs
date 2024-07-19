use std::{fs, path::Path};

use gray_matter::{engine::YAML, Matter};
use notify::RecommendedWatcher;
use scraper::{ElementRef, Html};
use serde::Deserialize;

use crate::site::attach_scripts;

#[derive(Deserialize, Debug)]
pub struct BlogPostMetadata {
    title: Option<String>,
    publish_date: Option<String>,
    description: Option<String>,
    template: Option<String>,
}

#[derive(Deserialize, Debug)]
pub struct BlogPost {
    metadata: BlogPostMetadata,
    content: String,
}

fn generate_list_widget() -> String {
    // load built-in for post-list
    todo!()
}

fn load_post(path: &Path, parser: Matter<YAML>) -> Result<BlogPost, Box<dyn std::error::Error>> {
    let read = fs::read(path)?;
    let file_content = String::from_utf8(read)?;
    let raw_matter = parser.parse_with_struct::<BlogPostMetadata>(&file_content);
    if raw_matter.is_some() {
        let front_matter = raw_matter.unwrap();
        Ok(BlogPost {
            content: front_matter.content,
            metadata: front_matter.data,
        })
    } else {
        Err(format!("Could not load post from {path:?}").into())
    }
}

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
            
            for file in markdown_files {
				let path = file.path();
                let post = load_post(&path, Matter::<YAML>::new())?;
                let vars = &post.metadata;
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
                                strings.push(markdown::to_html(&post.content));
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
