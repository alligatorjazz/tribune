use std::path::Path;

use notify::{RecursiveMode, Watcher};
use tribune::{posts::{build_post_watcher, build_posts}, site::{build_site, build_site_watcher}};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    build_site()?;
    build_posts()?;
    println!("Starting watcher...");
    let mut site_watcher = build_site_watcher()?;
    site_watcher.watch(Path::new("."), RecursiveMode::Recursive)?;
    let mut post_watcher = build_post_watcher()?;
    post_watcher.watch(Path::new("./posts"), RecursiveMode::Recursive)?;
	println!("Starting server...");
    devserver_lib::run("localhost", 8080, "build", true, "");
	println!("Hosting server at http://localhost:8080");
    Ok(())
}
