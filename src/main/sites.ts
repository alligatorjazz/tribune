import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "fs";
import { JSDOM } from "jsdom";
import { basename, extname, join } from "path";
import { DIR } from "./refs";
import { readFile, rename, writeFile } from "fs/promises";
import { SiteMap, SiteNode } from "../shared";

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

	// create site directories if they don't exist
	mkdirSync(join(DIR.Sites, siteTitle, "src"), { recursive: true });
	mkdirSync(join(DIR.Sites, siteTitle, "widgets"), { recursive: true });
	mkdirSync(join(DIR.Sites, siteTitle, "posts"), { recursive: true });
	mkdirSync(join(DIR.Sites, siteTitle, "build"), { recursive: true });

	// write index.html to sites directory
	writeFileSync(
		join(getSiteFolders(siteTitle).srcDir, "index.html"),
		document.documentElement.innerHTML
	);
}

export function getSiteMap(site: string): SiteMap {
	const siteMap: SiteMap = [];
	const { srcDir } = getSiteFolders(site); // Adjust the path as necessary
	const siteContents = readdirSync(srcDir).filter(
		(file) => extname(file) === ".html" || statSync(join(srcDir, file)).isDirectory()
	);
	const walkFile = (path: string): SiteNode => {
		if (statSync(path).isDirectory()) {
			return {
				route: "/" + basename(path),
				children: readdirSync(path).map((child) => walkFile(join(path, child))),
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
				route: path.replace(srcDir, "")
			};
		}

		return {
			title: title,
			route: path.replace(srcDir, ""),
			localPath: path
		};
	};

	siteContents.map((path) => siteMap.push(walkFile(join(srcDir, path))));
	// console.log(JSON.stringify(siteMap, null, 4));
	return siteMap;
}

export async function getSourceCode(localPath: string) {
	return (await readFile(localPath, { encoding: "utf-8" })).toString();
}

export async function saveSourceCode(localPath: string, content: string) {
	await writeFile(localPath, content);
}

export async function renameSourceCode(oldPath: string, newPath: string) {
	return await rename(oldPath, newPath);
}
/**
 * Flattens a nested SiteMap into a single array of SiteNode.
 * @param siteMap - The nested SiteMap to be flattened.
 * @returns The flattened array of SiteNode.
 */
export function flattenSiteMap(siteMap: SiteMap): SiteNode[] {
	const result: SiteNode[] = [];

	const flatten = (nodes: SiteMap) => {
		for (const node of nodes) {
			result.push(node);
			if ("children" in node && node.children) {
				flatten(node.children);
			}
		}
	};

	flatten(siteMap);
	return result;
}

export function getSiteFolders(site: string) {
	const rootDir = join(DIR.Sites, site);
	return {
		rootDir,
		srcDir: join(rootDir, "src"),
		postsDir: join(rootDir, "posts"),
		widgetsDir: join(rootDir, "widgets"),
		buildDir: join(rootDir, "build")
	};
}
