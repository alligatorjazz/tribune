use std::{fs, path::Path};

use walkdir::WalkDir;

use crate::GenericResult;

pub fn get_widgets_source() -> GenericResult<String> {
    let widget_files = fs::read_dir("widgets");
    match widget_files {
        Ok(raw_files) => {
            // generates include calls for each widget
            let mut inclusions: Vec<String> = [].to_vec();
            for f in raw_files {
                let file = f.unwrap();
                let path = file.path();
                let stem = &path.file_stem().unwrap().to_str().unwrap();
                let name = &path.file_name().unwrap().to_str().unwrap();
                inclusions.push(format!(
                    "include({{tag: '{}', path: '/widgets/{}'}})",
                    stem, name
                ))
            }
            Ok(inclusions.join("\n"))
        }
        Err(_) => {
            println!("No widgets found.");
            Ok(String::from(""))
        }
    }
}


pub fn build_widgets() -> GenericResult<()> {
	println!("building widgets");	
	let widget_path = Path::new("widgets");
	if !Path::exists(widget_path) {
		println!("No widgets found.");
		return Ok(());
	}

	for dir_entry in WalkDir::new("widgets") {
		match dir_entry {
			Ok(entry) => {
				let path = entry.path();
				if path == Path::new("widgets") {
					continue;
				}
				let extension_is_valid: bool = match path.extension() {
					Some(extension) => extension == "html",
					_ => false
				};
				
				if !extension_is_valid {
					println!("Couldn't load widget at path {:?} - widgets need to be html files.", path);
					continue;
				}

				let build_widget_path = Path::new("build/widgets");
				fs::create_dir_all(build_widget_path)?;
				fs::copy(path, build_widget_path.join(path.file_name().unwrap()))?;

			},
			Err(err) => println!("An unknown widget failed to load - make sure Tribune has permission to read files in this folder.\n{:?}", err)
		}
	}

	Ok(())
}