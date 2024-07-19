default:
	cargo build --target aarch64-apple-darwin --release
	cargo build --target x86_64-pc-windows-gnu --release
	zip -m tribune-x86_64.zip ./target/x86_64-pc-windows-gnu/release/tribune.exe
	zip -m tribune-macos.zip ./target/aarch64-apple-darwin/release/tribune
