use crate::{posts::generate_post_widget, GenericResult};
use html_editor::{operation::Htmlifiable, Node};
use std::{fs, path::Path};
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
                println!("Tribune couldn't read all the widgets in your `./widgets` folder - make sure it has the permissions to view it and that there's no funky (i.e. non-HTML) file types in there.\n{}", err);
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

            // println!("widget html:\n{}", widget_element.html());

            let name = &widget.name;
            let mut target_indexes: Vec<usize> = Vec::new();

            for (i, node) in nodes.iter_mut().enumerate() {
                let result = node.as_element_mut();
                if result.is_some() {
                    let target = result.unwrap();
                    // TODO: check if this works? if not just set every attribute individually
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
