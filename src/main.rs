use notify::{RecursiveMode, Watcher};
use std::path::Path;
use tribune::{
    get_ignored,
    markdown::get_markdown_pages,
    posts::generate_rss_feed,
    site::{build_site, build_watcher},
    GenericResult,
};

const DEV_URL: &str = "http://localhost:8080";

fn main() -> GenericResult<()> {
    build_site(true)?;
    println!("Starting watcher...");
    println!(
        "Ignoring files: {:?}",
        get_ignored(tribune::IgnoreLevel::WATCH)
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
    for page in get_markdown_pages(Path::new(".")) {
        println!("page found: {}", page)
    }
    generate_rss_feed()?;
    devserver_lib::run("localhost", 8080, "build", true, "");
    Ok(())
}
