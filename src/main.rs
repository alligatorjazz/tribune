use std::{fs, io};

fn print_dir() {
    // printing files in current working directory
    let paths = fs::read_dir(".").unwrap().map(|res| res.map(|file| file.path()));

    for path in paths {
        let filename = path.expect("Could not get path name.");
        let output = filename.to_str().expect("Could not convert path to string.");
        println!("{output}");
    }
}

fn create_program_files() -> io::Result<()> {
	// create build folder
	fs::create_dir_all(".tribune")
	// TODO: create config
}

// fn read_and_copy() {
// 	// checks for a file called index.html and then appends a string to it
// 	let signature = "<sig>Tribune was here!</sig>";
// 	match fs::read("index.html") {
// 		Ok(raw_buffer) => {
// 			let content = String::from_utf8(raw_buffer)
// 				.expect("Could not convert the file contents to a string.");
// 			println!("Detected index.html file. Contents:\n{content}");
// 			fs::write(".tribune/dist/index.html", format!("{content}\n\n{signature}")).expect("Could not write modified index.html.");

// 		},
// 		Err(err) => panic!("{err}")
// 	}
// }

fn main() {
	print_dir();
	create_program_files().unwrap();

}
