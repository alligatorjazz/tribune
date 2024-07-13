use std::{fs, io};
fn create_program_files() -> io::Result<()> {
	// create build folder
	fs::create_dir_all(".tribune")
	// TODO: create config
}

fn build_site() -> io::Result<()>{
	create_program_files()?;
	match fs::read("index.html") {
		Ok(raw_buffer) => {
			let content = String::from_utf8(raw_buffer).expect("Could not convert site to string.");
			fs::write(".tribune/index.html", content)?

		},
		Err(err) => panic!("{err}")
	}

	Ok(())
}

fn main() -> io::Result<()>{
	build_site()?;
	devserver_lib::run("localhost", 8080, ".tribune", true, "");
	Ok(())
}
