default:
	cargo clean
	cargo build --target aarch64-apple-darwin --release
	cargo build --target x86_64-pc-windows-gnu --release
	zip -j tribune-windows.zip ./target/x86_64-pc-windows-gnu/release/tribune.exe
	zip -j tribune-macos.zip ./target/aarch64-apple-darwin/release/tribune
macdev:
	cargo build --target aarch64-apple-darwin --release
	cp ./target/aarch64-apple-darwin/release/tribune .
