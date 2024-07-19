use std::{fs, io, path::Path};

use gray_matter::{engine::YAML, Matter};
use notify::RecommendedWatcher;
use scraper::{ElementRef, Html};
use serde::{Deserialize, Serialize};

use crate::site::attach_scripts;

#[derive(Serialize, Deserialize, Debug)]
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
    slug: String,
}

pub fn generate_post_loader() -> String {
    // load built-in for post-list
    let mut script: Vec<String> = Vec::new();
    let posts = load_posts();
    match posts {
        Ok(list) => {
            for entry in list {
                match entry {
                    Ok(post) => {
                        script.push(format!(
                            "tribune_data.posts[\"{}\"] = {}",
							&post.slug,
                            serde_json::to_string(&post.metadata).unwrap()
                        ))
                    },
                    Err(_) => todo!(),
                }
            }
            script.join("\n")
        }
        Err(_) => {
            println!("Couldn't generate <post-list> widget because the posts couldn't be loaded.");
            String::new()
        }
    }
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
            slug: path.file_stem().unwrap().to_string_lossy().to_string(),
        })
    } else {
        Err(format!("Could not load post from {path:?}").into())
    }
}

fn load_posts() -> io::Result<Vec<Result<BlogPost, Box<dyn std::error::Error>>>> {
    let mut posts: Vec<Result<BlogPost, Box<dyn std::error::Error>>> = Vec::new();
    let posts_path = Path::new("posts");
    let entries = fs::read_dir(posts_path)?;
    for entry in entries {
        let path = entry?.path();
        if path.is_file() && path.extension().is_some() && path.extension().unwrap() == "md" {
            println!("loading post: {:?}", path);
            posts.push(load_post(&path, Matter::<YAML>::new()))
        }
    }

    Ok(posts)
}

pub fn build_posts() -> Result<(), Box<dyn std::error::Error>> {
    let posts_path = Path::new("posts");
    if !posts_path.exists() || !posts_path.is_dir() {
        return Ok(());
    }

    let posts = load_posts()?;
    // println!("{:?}", posts);

    for entry in posts {
        match entry {
            Ok(post) => {
                let vars = &post.metadata;
                let template = match &vars.template {
                    Some(name) => name,
                    None => "default",
                };
                let title = match &vars.title {
                    Some(text) => text,
                    None => &post.slug,
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
                    format!("build/posts/{}.html", &post.slug.to_string()),
                    new_file_content,
                );
            }
            Err(_) => todo!(),
        }
    }
    Ok(())
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
