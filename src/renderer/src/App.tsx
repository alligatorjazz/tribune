import { useState } from "react";
import { PreviewFrame } from "./components/PreviewFrame";

export function App(): JSX.Element {
	const siteTitle = "Testy Test";
	const [showPreview, setShowPreview] = useState(false);
	console.log(`preview: ${showPreview}`);
	return (
		<main>
			<h1>hey, guy!</h1>
			<button onClick={() => window.api.createSite(siteTitle)}>create site</button>
			<button
				onClick={() => {
					window.api.startServer(siteTitle);
					setShowPreview(true);
				}}
			>
				start server
			</button>
			<button onClick={() => window.api.stopServer()}>stop server</button>
			{showPreview && <PreviewFrame />}
		</main>
	);
}
