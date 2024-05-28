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

	return <iframe ref={frame} src="http://localhost:3000" title="Site Preview"></iframe>;
}
