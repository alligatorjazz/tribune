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
    // TODO: sort by date
    for post in posts {
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

    let post_list = Node::new_element("ul", vec![], post_elements);
    Ok(post_list.html())
}

pub fn get_posts() -> GenericResult<Vec<MarkdownPage>> {
    let mut posts: Vec<MarkdownPage> = Vec::new();
    let posts_path = Path::new("posts");
    let entries = fs::read_dir(posts_path)?;
    for entry in entries {
        let path = entry?.path();
        if path.is_file() && path.extension().is_some() && path.extension().unwrap() == "md" {
            // println!("loading post: {:?}", path);
            if let Ok(page) = load_markdown(&path, Matter::<YAML>::new()) {
                posts.push(page)
            } else {
                println!("Error loading file {path:?} as markdown, skipping")
            }
        }
    }

    Ok(posts)
}

pub fn get_posts_with_template(template: &str) -> GenericResult<Vec<MarkdownPage>> {
    let all_posts = get_posts()?;
    let mut posts_with_template: Vec<MarkdownPage> = Vec::new();
    for post in all_posts {
        if post.metadata.template == Some(template.to_string()) {
            posts_with_template.push(post)
        }
    }

    Ok(posts_with_template)
}
pub fn build_posts(posts: Vec<MarkdownPage>) -> GenericResult<()> {
    let posts_path = Path::new("posts");

    for post in posts {
        println!("building post: {:?}", post.slug);
        let filename = format!("{}.html", post.slug);
        build_markdown(&Path::new("build").join(posts_path).join(&filename), post)?
    }

    Ok(())
}
