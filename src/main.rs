
use notify::{RecursiveMode, Watcher};
use std::{path::Path, thread, time::Duration};
use tribune::{
    posts::build_posts,
    site::{build_site, build_site_watcher},
	GenericResult
};

const DEV_URL: &str = "http://localhost:8080";

fn main() -> GenericResult<()> {
    build_site()?;
    build_posts()?;
    println!("Starting watcher...");
    let mut site_watcher = build_site_watcher()?;
    site_watcher.watch(Path::new("."), RecursiveMode::Recursive)?;

    println!("Starting dev server at http://localhost:8080");
    println!("Opening now in your default browser!");
    thread::spawn(|| {
        thread::sleep(Duration::from_secs(1));
        open::that(DEV_URL)
    });
    devserver_lib::run("localhost", 8080, "build", true, "");
    Ok(())
}
