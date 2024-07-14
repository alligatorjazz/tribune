default:
	cargo build --target aarch64-apple-darwin
	cargo build --target x86_64-pc-windows-gnu
	zip -m tribune-x86_64.zip ./target/x86_64-pc-windows-gnu/debug/tribune.exe
	zip -m tribune-macos.zip ./target/aarch64-apple-darwin/debug/tribune
