import { useEffect, useRef } from "react";

export function PreviewFrame() {
	console.log("creating site preview...");
	const frame = useRef<HTMLIFrameElement>(null);

	useEffect(() => {
		window.api.onAutoReload(() => {
			console.log("change detected: reloading frame");
			frame.current?.contentWindow?.postMessage("reload", "http://localhost:3000");
		});
	}, []);

	// unset all iframe styles
	// useEffect(() => {
	// 	if (frame.current) {
	// 		frame.current.style.all = "unset";
	// 	}
	// }, []);

	return (
		<iframe
			className="w-full h-full"
			ref={frame}
			src="http://localhost:3000"
			title="Site Preview"
		></iframe>
	);
}
