use std::{fs, io, path::Path};

use gray_matter::{engine::YAML, Matter};
use html_editor::{operation::Htmlifiable, parse, Doctype, Node};
use serde::{Deserialize, Serialize};

use crate::{widgets::attach_widgets, GenericResult};

// TODO: implement publish dates
#[derive(Serialize, Deserialize, Debug)]
pub struct MarkdownPageMetadata {
    title: Option<String>,
    date: Option<String>,
    description: Option<String>,
    template: Option<String>,
}

#[derive(Deserialize, Debug)]
pub struct MarkdownPage {
    pub metadata: MarkdownPageMetadata,
    pub content: String,
    pub slug: String,
}

pub fn generate_post_widget() -> GenericResult<String> {
    // load built-in for post-list
    let mut post_elements: Vec<Node> = Vec::new();
    let posts = load_posts()?;

    for entry in posts {
        match entry {
            Ok(post) => {
                // create post cards
                let mut nodes: Vec<Node> = Vec::new();
                let metadata = post.metadata;
                let href = format!("/posts/{}", post.slug);
                if let Some(title) = metadata.title {
                    nodes.push(Node::new_element(
                        "div",
                        vec![("class", "post-title")],
                        vec![Node::Text(title)],
                    ))
                };

                if let Some(date) = metadata.date {
                    nodes.push(Node::new_element(
                        "div",
                        vec![("class", "post-date")],
                        vec![Node::Text(date)],
                    ));
                }
                if let Some(description) = metadata.description {
                    nodes.push(Node::new_element(
                        "div",
                        vec![("class", "post-description")],
                        vec![Node::Text(description)],
                    ));
                }
                post_elements.push(Node::new_element(
                    "li",
                    vec![],
                    vec![Node::new_element("a", vec![("href", &href)], nodes)],
                ));
            }
            Err(_) => println!(
                "Error loading post cards - check that your frontmatter is formatted correctly!"
            ),
        }
    }

    let post_list = Node::new_element("ul", vec![], post_elements);
    Ok(post_list.html())
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
        return Ok(());
    }

    let template_content = fs::read(template_path)?;
    let tdom: Vec<Node> = parse(&String::from_utf8(template_content)?).unwrap();
    // load markdown into template

    let mut strings: Vec<String> = Vec::new();

    fn process_nodes(
        nodes: Vec<Node>,
        strings: &mut Vec<String>,
        title: &String,
        markdown: &MarkdownPage,
    ) {
        for node in nodes {
            match node {
                Node::Element(element) => {
                    if !element.children.is_empty() {
                        strings.push(format!("<{}>", element.name));
                        process_nodes(element.children, strings, title, markdown);
                        strings.push(format!("</{}>", element.name));
                        continue;
                    }

                    if element.name == "title" {
                        let post_title_text = {
                            if !element.children.is_empty() {
                                format!("{} - ", element.children[0].html())
                            } else {
                                "".to_owned()
                            }
                        };
                        strings.push(format!("<title>{}{}</title>", post_title_text, title));
                        continue;
                    }

                    if element.name.starts_with("markdown-") {
                        let split: Vec<&str> = element.name.split('-').collect();
                        // checks that there's actually an property listed after the hyphen
                        if split.len() < 2 {
                            strings.push(element.html());
                            continue;
                        }

                        let property = split[1];
                        match property {
                            "body" => {
                                strings.push(
                                    Node::new_element(
                                        "div",
                                        vec![("class", "markdown-body")],
                                        vec![Node::Text(markdown::to_html(&markdown.content))],
                                    )
                                    .html(),
                                );
                            }
                            "title" => {
                                let title = {
                                    if markdown.metadata.title.is_some() {
                                        markdown.metadata.title.clone().unwrap()
                                    } else {
                                        markdown.slug.clone()
                                    }
                                };
                                strings.push(
                                    Node::new_element(
                                        "h1",
                                        vec![("class", "markdown-title")],
                                        vec![Node::Text(title)],
                                    )
                                    .html(),
                                );
                            }
                            "date" => {
                                let date = {
                                    if markdown.metadata.date.is_some() {
                                        markdown.metadata.date.clone().unwrap()
                                    } else {
                                        "No Date Found".to_string()
                                    }
                                };
                                strings.push(
                                    Node::new_element(
                                        "div",
                                        vec![("class", "markdown-date")],
                                        vec![Node::Text(date)],
                                    )
                                    .html(),
                                )
                            }
                            "description" => {
                                let description = {
                                    if markdown.metadata.description.is_some() {
                                        markdown.metadata.description.clone().unwrap()
                                    } else {
                                        "No Date Found".to_string()
                                    }
                                };
                                strings.push(
                                    Node::new_element(
                                        "div",
                                        vec![("class", "markdown-description")],
                                        vec![Node::Text(description)],
                                    )
                                    .html(),
                                )
                            }
                            _ => strings.push(element.html()),
                        }
                        continue;
                    }
                    strings.push(element.html())
                }
                Node::Text(text) => strings.push(text),
                Node::Comment(comment) => strings.push(comment),
                Node::Doctype(doctype) => match doctype {
                    Doctype::Html => strings.push("<!DOCTYPE html>".to_owned()),
                    Doctype::Xml { version, encoding } => strings.push(
                        format!(r#"<?xml version="{}" encoding="{}"?>"#, version, encoding)
                            .to_owned(),
                    ),
                },
            }
        }
    }
    process_nodes(tdom, &mut strings, title, &markdown);

    let base_file_content = strings.join("\n");
    let new_file_content = attach_widgets(parse(&base_file_content)?)?;

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
