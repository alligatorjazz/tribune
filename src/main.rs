use std::{fs, io};

fn main() ->io::Result<()>{
	let paths = fs::read_dir(".")?
		.map(|res| res.map(|file| file.path()));

	for path in paths {
		let filename = path.unwrap();
		let output = filename.to_str().unwrap();
		println!("{output}");
	}

	Ok(())
}
