use notify::{RecursiveMode, Watcher};
use std::{env, path::Path};
use tribune::{
    get_ignored,
    posts::generate_rss_feed,
    site::{build_site, build_watcher},
    widgets::get_pages_with_element,
    GenericResult,
};

const DEV_URL: &str = "http://localhost:8080";

fn main() -> GenericResult<()> {
    build_site(true)?;
    generate_rss_feed()?;
    println!(
        "nav-bar widget users: {:?}",
        get_pages_with_element(&env::current_dir().unwrap(), "nav-bar")
    );
    println!("Starting watcher...");
    println!(
        "Ignoring files: {:?}",
        get_ignored(tribune::IgnoreLevel::Watch)
    );
    let mut site_watcher = build_watcher().unwrap();
    site_watcher
        .watch(
            &Path::new(".").canonicalize().unwrap(),
            RecursiveMode::Recursive,
        )
        .unwrap();
    println!("Opening now in your default browser!");
    open::that(DEV_URL).unwrap();
    println!("Starting dev server at http://localhost:8080");
    devserver_lib::run("localhost", 8080, "build", true, "");
    Ok(())
}
