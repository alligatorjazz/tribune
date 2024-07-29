use std::{fs, path::Path};

use gray_matter::{engine::YAML, Matter};
use html_editor::{operation::Htmlifiable, Node};

use crate::{
    markdown::{build_markdown, load_markdown, MarkdownPage},
    GenericResult,
};

pub fn generate_post_widget() -> GenericResult<String> {
    // load built-in for post-list
    let mut post_elements: Vec<Node> = Vec::new();
    let posts = get_posts()?;

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

fn get_posts() -> GenericResult<Vec<GenericResult<MarkdownPage>>> {
    let mut posts: Vec<GenericResult<MarkdownPage>> = Vec::new();
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

pub fn build_posts() -> GenericResult<()> {
    let posts_path = Path::new("posts");
    if !posts_path.exists() || !posts_path.is_dir() {
        return Ok(());
    }

    let posts = get_posts()?;

    for entry in posts {
        let post = entry?;
        let filename = format!("{}.html", post.slug);
        build_markdown(&Path::new("build").join(posts_path).join(&filename), post)?
    }

    Ok(())
}
