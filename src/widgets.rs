use crate::{get_ignored, posts::generate_post_widget, GenericResult, IgnoreLevel};
use html_editor::{operation::Htmlifiable, Node};
use std::{
    fs,
    path::{Path, PathBuf},
};
use walkdir::WalkDir;

#[derive(Debug, PartialEq, Eq)]
pub struct Widget {
    name: String,
    content: String,
}

pub fn load_widget(widget_path: &Path) -> GenericResult<Widget> {
    let buffer = fs::read(widget_path)?;
    let name = String::from_utf8(widget_path.file_stem().unwrap().as_encoded_bytes().to_vec())?;
    let content = String::from_utf8(buffer)?;
    Ok(Widget { name, content })
}

pub fn attach_widgets(mut vdom: Vec<Node>) -> GenericResult<String> {
    let mut widgets: Vec<Widget> = vec![Widget {
        name: "post-list".to_string(),
        content: generate_post_widget()?,
    }];

    for dir_entry in WalkDir::new("widgets") {
        match dir_entry {
            Ok(entry) => {
                let path = entry.path();
                if path.is_dir() {
                    continue;
                }

                let extension_is_valid = {
                    let extension = path.extension();
                    if let Some(extension) = extension {
                        extension == "html"
                    } else {
                        false
                    }
                };
                if !extension_is_valid {
                    continue;
                }

                widgets.push(load_widget(path)?);
            }
            Err(err) => {
                println!("Tribune couldn't read all the widgets in your `./widgets` folder - make sure it has the permissions to view it and that there's no non-HTML file types in there.\n{}", err);
            }
        }
    }

    for widget in widgets {
        fn place_widgets(widget: &Widget, nodes: &mut [Node]) {
            let widget_element = Node::new_element(
                "div",
                vec![("data-widget", &widget.name)],
                vec![Node::Text(format!("\n{}\n", widget.content.clone()))],
            );

            let name = &widget.name;
            let mut target_indexes: Vec<usize> = Vec::new();

            for (i, node) in nodes.iter_mut().enumerate() {
                let result = node.as_element_mut();
                if result.is_some() {
                    let target = result.unwrap();
                    if &target.name == name {
                        target_indexes.push(i);
                        continue;
                    }

                    if !target.children.is_empty() {
                        place_widgets(widget, &mut target.children)
                    }
                }
            }

            for index in target_indexes {
                nodes[index] = widget_element.clone();
            }
        }

        place_widgets(&widget, &mut vdom)
    }

    Ok(vdom.html())
}

pub fn get_pages_with_element(dir: &Path, tag: &str) -> Vec<PathBuf> {
    let mut paths: Vec<PathBuf> = vec![];
    for dir_entry in WalkDir::new(dir) {
        let Ok(entry) = dir_entry else {
            println!("There was an error accessing at least one directory in your site folder - ensure Tribune has the correct permissions.");
            continue;
        };
        let path = entry.path();
        let mut is_valid = true;
        // special ignore check that actuallly INCLUDES the post folder

        for ignored in get_ignored(IgnoreLevel::Build) {
            let Ok(ignore_path) = fs::canonicalize(ignored) else {
                continue;
            };
            if fs::canonicalize(path).unwrap().starts_with(ignore_path) {
                is_valid = false;
                break;
            }
        }

        let Some(extension) = path.extension() else {
            continue;
        };

        if is_valid && path.is_file() && extension == "html" {
            let Ok(bytes) = fs::read(path) else {
                println!("Couldn't load bytes for {:?}", path);
                continue;
            };

            let Ok(content) = String::from_utf8(bytes) else {
                println!("Couldn't load content for {:?}", path);
                continue;
            };

            // TODO: replace this crude pattern match with an actual html search
            let pattern = format!("<{tag}>");
            if content.contains(&pattern) {
                paths.push(path.to_path_buf())
            }
        }
    }

    paths
}
