import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "fs";
import { JSDOM } from "jsdom";
import { basename, extname, join } from "path";
import { SiteMap, SiteNode } from "tribune-types";
import { DIR } from "./refs";

const PAGE_BOILERPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Access-Control-Allow-Origin" content="*" />
</head>
<body>
	
</body>
</html>
`.trim();

export function createSite(siteTitle: string): void {
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
	mkdirSync(join(DIR.Sites, siteTitle), { recursive: true });

	// write index.html to sites directory
	writeFileSync(join(DIR.Sites, siteTitle, "index.html"), document.documentElement.innerHTML);
}

export function getSiteMap(site: string): SiteMap {
	// TODO: implement site map function
	const siteMap: SiteMap = [];
	const siteDir = join(DIR.Sites, site); // Adjust the path as necessary
	const siteContents = readdirSync(siteDir).filter(
		(file) => extname(file) === ".html" || statSync(join(siteDir, file)).isDirectory()
	);
	const walkFile = (path: string): SiteNode => {
		if (statSync(path).isDirectory()) {
			return {
				route: "/" + basename(path),
				children: readdirSync(path)
					.filter((file) => extname(file) === ".html")
					.map((child) => walkFile(join(path, child))),
				localPath: path
			};
		}

		// extract title from <title> tag
		const base = basename(path, ".html");
		const dom = new JSDOM(readFileSync(path));
		const title = dom.window.document.querySelector("title")?.textContent ?? base;

		if (base === "index") {
			return {
				index: true,
				localPath: path,
				route: path.replace(siteDir, "")
			};
		}

		return {
			title: title,
			route: path.replace(siteDir, ""),
			localPath: path
		};
	};

	siteContents.map((path) => siteMap.push(walkFile(join(siteDir, path))));
	return siteMap;
}
