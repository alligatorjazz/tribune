use std::{fs, path::Path};

use gray_matter::{engine::YAML, Matter};
use html_editor::{operation::Htmlifiable, Node};
use rss::{ChannelBuilder, GuidBuilder, Item};
use url::Url;

use crate::{
    markdown::{build_markdown, load_markdown, MarkdownPage},
    read_config, GenericResult,
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
    let parser = Matter::<YAML>::new();
    let posts_path = Path::new("posts");
    let entries = fs::read_dir(posts_path)?;
    for entry in entries {
        let path = entry?.path();
        if path.is_file() && path.extension().is_some() && path.extension().unwrap() == "md" {
            // println!("loading post: {:?}", path);
            if let Ok(page) = load_markdown(&path, &parser) {
                posts.push(page)
            } else {
                println!("Error loading file {path:?} as markdown, skipping")
            }
        }
    }

    Ok(posts)
}

// TODO: find a way to get *all* markdown files with a given template, not just posts
pub fn get_posts_with_template(template: &str) -> GenericResult<Vec<MarkdownPage>> {
    let all_posts = get_posts()?;
    let mut posts_with_template: Vec<MarkdownPage> = Vec::new();
    for post in all_posts {
        if let Some(post_template) = &post.metadata.template {
            if post_template == &template.to_string() {
                posts_with_template.push(post)
            }
        }
    }

    println!(
        "changing users of template {}: {:?}",
        template,
        [&posts_with_template]
    );
    Ok(posts_with_template)
}

// TODO: fix bug where posts are not being rebuilt on template change
pub fn build_posts(posts: Vec<MarkdownPage>) -> GenericResult<()> {
    let build_dir = {
        let path = Path::new("build").join("posts");
        fs::create_dir_all(&path)?;
        path
    };

    for post in posts {
        let filename = format!("{}.html", post.slug);
        build_markdown(&build_dir.join(&filename), &post)?
    }

    Ok(())
}

pub fn generate_rss_feed() -> GenericResult<()> {
    println!("generating rss feed...");
    let Ok(config) = read_config() else {
        println!("Could not read Tribune config.");
        return Ok(());
    };

    let Some(rss) = config.rss else {
        println!("Could not read RSS data from Tribune config.");
        return Ok(());
    };

    let Some(title) = rss.title else {
        println!("You need to specify a title for your RSS feed for Tribune to build one. Set one in tribuneconfig.json.");
        return Ok(());
    };

    let Some(link) = rss.link else {
        println!("You need to specify your site's URL (usually https://[your-username].neocities.org) in the \"link\" field of your RSS config for Tribune to build the RSS feed properly. You can set this in tribuneconfig.json.");
        return Ok(());
    };

    let items: Vec<Item> = {
        let mut result: Vec<Item> = vec![];
        let posts = get_posts()?;
        for post in posts {
            let mut item = Item::default();
            item.set_title(post.metadata.title);
            item.set_pub_date(post.metadata.date);
            item.set_description(post.metadata.description);

            let Ok(raw_post_link) = Url::parse(&link) else {
                println!("Your RSS \"link\" property is malformed. Make sure it's a valid URL - you can check this in tribuneconfig.json.");
                return Ok(());
            };

            let post_link = raw_post_link.join("posts/")?.join(&post.slug)?.to_string();
            // TODO: find out why isPermalink refuses to be set
            item.set_link(post_link.clone());
            let guid = GuidBuilder::default()
                .value(post_link)
                .permalink(true)
                .build();

            item.set_guid(guid);
            result.push(item);
        }

        result
    };

    let channel = ChannelBuilder::default()
        .title(title)
        .link(&link)
        .description(if rss.description.is_some() {
            rss.description.unwrap()
        } else {
            format!("The RSS feed for {}", &link)
        })
        .items(items)
        .build();

    Ok(fs::write("build/rss.xml", channel.to_string())?)
}
