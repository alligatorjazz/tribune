use serde::Deserialize;
use std::{
    fs,
    io::{self, stdout, Write},
    path::Path,
};
pub mod posts;
pub mod site;
const PRELOADER: &str = include_str!("../preload.js");

fn copy_dir_all(src: impl AsRef<Path>, dst: impl AsRef<Path>) -> io::Result<()> {
    fs::create_dir_all(&dst)?;
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let ty = entry.file_type()?;
        if ty.is_dir() {
            copy_dir_all(entry.path(), dst.as_ref().join(entry.file_name()))?;
        } else {
            fs::copy(entry.path(), dst.as_ref().join(entry.file_name()))?;
        }
    }
    Ok(())
}

pub fn create_program_files() -> Result<(), Box<dyn std::error::Error>> {
    // check if tribune has been run / tribune.lock exists
    if !Path::exists(Path::new("tribune.lock")) {
        println!("Hey! I see it's your first time running Tribune.");
        println!("Tribune needs access to a folder in your site called \"build\" to do its thing.");
        println!("Every time you run Tribune, it's going to wipe the \"build\" folder and make it over again.");
        println!("If you don't have a folder in your site called \"build\", you've got nothing to worry about! If you do, make sure you rename it to something else before you continue. Once you're ready, press enter.");
        print!("Continue? >");
        stdout().flush().unwrap();
        let mut input = String::new();
        io::stdin().read_line(&mut input).unwrap();
        fs::write("tribune.lock", "todo").unwrap();
    }

    // wipe build folder if it exists
    println!("Creating build folder...");
    if Path::exists(Path::new("build")) {
        fs::remove_dir_all("build")?;
    }

    Ok(fs::create_dir_all("build")?)
}



pub fn get_widgets_source() -> io::Result<String> {
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

// TODO: open server in default browser