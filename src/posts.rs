use std::{fs, io, path::Path};

use gray_matter::{engine::YAML, Matter};
use scraper::{ElementRef, Html};
use serde::{Deserialize, Serialize};

use crate::{attach_scripts, GenericResult};

#[derive(Serialize, Deserialize, Debug)]
pub struct MarkdownPageMetadata {
    title: Option<String>,
    publish_date: Option<String>,
    description: Option<String>,
    template: Option<String>,
    tags: Option<Vec<String>>,
}

#[derive(Deserialize, Debug)]
pub struct MarkdownPage {
    pub metadata: MarkdownPageMetadata,
    pub content: String,
    pub slug: String,
}

pub fn generate_post_loader() -> String {
    // load built-in for post-list
    let mut script: Vec<String> = Vec::new();
    let posts = load_posts();
    match posts {
        Ok(list) => {
            for entry in list {
                match entry {
                    Ok(post) => script.push(format!(
                        "tribune_data.posts[\"{}\"] = {}",
                        &post.slug,
                        serde_json::to_string(&post.metadata).unwrap()
                    )),
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

pub fn load_markdown(
    path: &Path,
    parser: Matter<YAML>,
) -> Result<MarkdownPage, Box<dyn std::error::Error>> {
    let read = fs::read(path)?;
    let file_content = String::from_utf8(read)?;
    let raw_matter = parser.parse_with_struct::<MarkdownPageMetadata>(&file_content);
    if raw_matter.is_some() {
        let front_matter = raw_matter.unwrap();
        Ok(MarkdownPage {
            content: front_matter.content,
            metadata: front_matter.data,
            slug: path.file_stem().unwrap().to_string_lossy().to_string(),
        })
    } else {
        Err(format!("Could not load markdown from {path:?}").into())
    }
}

fn load_posts() -> io::Result<Vec<Result<MarkdownPage, Box<dyn std::error::Error>>>> {
    let mut posts: Vec<Result<MarkdownPage, Box<dyn std::error::Error>>> = Vec::new();
    let posts_path = Path::new("posts");
    let entries = fs::read_dir(posts_path)?;
    for entry in entries {
        let path = entry?.path();
        if path.is_file() && path.extension().is_some() && path.extension().unwrap() == "md" {
            // println!("loading post: {:?}", path);
            posts.push(load_markdown(&path, Matter::<YAML>::new()))
        }
    }

    Ok(posts)
}

pub fn build_markdown(to: &Path, markdown: MarkdownPage) -> GenericResult<()> {
	// println!("building markdown...");
    let vars = &markdown.metadata;
    let template = match &vars.template {
        Some(name) => name,
        None => "default",
    };

    let title = match &vars.title {
        Some(text) => text,
        None => &markdown.slug,
    };

	
    let template_path = Path::new("templates").join(format!("{template}.html"));
	// println!("loading template {} for {} at {:?}", template, title, template_path);
	if !template_path.exists() {
		println!("Template {} not found.", template);
		return Ok(())
	}

    let template_content = fs::read(template_path)?;
    let tdom = Html::parse_document(
        &String::from_utf8(template_content)?,
    );
	// println!("template loaded");

    // load markdown into template
    let mut root_elements: Vec<ElementRef> = Vec::new();
    for child in tdom.root_element().child_elements() {
        // let element = child.value();
        // let tag_name = &element.name.local.to_string();
        // println!("Qualified element name: {tag_name:?}");
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
                    strings.push(format!("<title>{} - {}</title>", child.inner_html(), title));
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
                if child.value().name() == "markdown-body" {
                    strings.push("<article>".to_owned());
                    strings.push(markdown::to_html(&markdown.content));
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

	println!("about to write to {to:?}");
    // TODO: get relative path for build
	
    let out_path = {
		let mut p = to.to_path_buf();
		p.set_extension("html");
		p
	};
	
	fs::create_dir_all(out_path.parent().unwrap())?;
    match fs::write(&out_path, new_file_content) {
        Ok(_) => Ok(()),
        Err(err) => {
            // println!("Could not write markdown file to {:?}.\n{}", out_path, err);
            Err(Box::new(err))
        }
    }
}

pub fn build_posts() -> GenericResult<()> {
    let posts_path = Path::new("posts");
    if !posts_path.exists() || !posts_path.is_dir() {
        return Ok(());
    }

    let posts = load_posts()?;

    for entry in posts {
        let post = entry?;
        let filename = format!("{}.html", post.slug);
        build_markdown(&Path::new("build").join(posts_path).join(&filename), post)?
    }
	
    Ok(())
}