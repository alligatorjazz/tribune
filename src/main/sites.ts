import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { JSDOM } from "jsdom";
import { DIR } from "./refs";

const PAGE_BOILERPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
	
</body>
</html>
`.trim();

export function createSite(siteTitle: string): void {
	console.log("creating site...");

	// parse boilerplate
	const parser = new JSDOM(PAGE_BOILERPLATE);
	const document = parser.window.document;

	// add site title
	const title = document.createElement("title");
	title.innerHTML = siteTitle;
	document.head.appendChild(title);

	// TEST: create h1
	const header = document.createElement("h1");
	header.innerHTML = siteTitle;
	document.body.appendChild(header);

	// create sites directory if doesn't exist
	mkdirSync(path.join(DIR.Sites, siteTitle), { recursive: true });

	// write index.html to sites directory
	writeFileSync(
		path.join(DIR.Sites, siteTitle, "index.html"),
		document.documentElement.innerHTML
	);
}
