import chokidar from "chokidar";
import cors from "cors";
import express, { Application } from "express";
import { readFileSync, statSync } from "fs";
import { IncomingMessage, Server, ServerResponse } from "http";
import { JSDOM } from "jsdom";
import { extname, join } from "path";
import { flattenSiteMap, getSiteFolders, getSiteMap } from "./sites";
import { buildWidget, getWidgets } from "./widgets";
// import { broadcastStyle } from "./scripts/broadcastStyle";
export type InjectedScript = {
	action: (params: string[]) => void;
	params: string[];
};
let server: Server<typeof IncomingMessage, typeof ServerResponse> | null = null;
let watcher: chokidar.FSWatcher | null = null;
const onFileChange = (_e: string, _path: string, cb: () => void) => {
	// console.log(`change detected (${JSON.stringify(path)}, ${e}): queuing autoreload`);
	try {
		cb();
	} catch (err) {
		console.error("could not run file change callback\n", err);
	}
};

export function startServer(site: string, reloadCallback: () => void) {
	const init = () => {
		// console.log("starting server...");
		const { srcDir } = getSiteFolders(site);
		const app: Application = express();
		app.use(cors({ origin: "*" }));
		// build html routes based on site map
		// const siteMap = getSiteMap(site);
		// const nodeList = flattenSiteMap(siteMap);

		// TODO: switch back to static routing; remove html extension
		app.use((req, res) => {
			const localPath = join(srcDir, req.url);
			// console.log([localPath, req.url, extname(localPath)]);
			if (extname(localPath) === ".html") {
				if (statSync(join(localPath))) {
					loadFeatures(localPath, site)
						.then((content) => res.send(content))
						.catch((err) => {
							console.error(err);
							res.status(500).send("<h1>Internal Server Error</h1>");
						});
				} else {
					res.status(404).send("<h1>404</h1>");
				}
			} else if (extname(localPath) === "") {
				const indexPath = join(localPath, "index.html");
				if (statSync(indexPath)) {
					loadFeatures(indexPath, site)
						.then((content) => res.send(content))
						.catch((err) => {
							console.error(err);
							res.status(500).send("<h1>Internal Server Error</h1>");
						});
				} else {
					res.status(404).send("<h1>404</h1>");
				}
			} else {
				res.send(readFileSync(localPath));
			}
		});
		// app.use(express.static(srcDir, { extensions: ["html"] }));
		// nodeList.map((node) => {
		// 	if (!node.children) {
		// 		// console.log("adding server route: GET ", node.route, ` (${node.localPath})`);
		// 		app.get(node.route, (_req, res) => {
		// 			loadFeatures(node.localPath, site).then((content) => res.send(content));
		// 		});
		// 		app.get(node.route.replace("index.html", ""), (_req, res) => {
		// 			loadFeatures(node.localPath, site).then((content) => res.send(content));
		// 		});
		// 	}
		// });
		// TODO: allow for custom port
		const port = process.env.PORT || 3000;

		server = app.listen(port, () => {
			// console.log(`Server is running on http://localhost:${port}`);
			if (!watcher) {
				// TODO: ignore widgets path
				watcher = chokidar
					.watch(srcDir)
					.on("all", (e, path) => onFileChange(e, path, reloadCallback));
			} else {
				watcher
					.removeAllListeners()
					.close()
					.then(() => {
						watcher = chokidar
							.watch(srcDir)
							.on("all", (e, path) => onFileChange(e, path, reloadCallback));
					});
			}
		});
	};

	if (!server) {
		return init();
	}

	server.close(init);
}

export function closeServer() {
	return new Promise<void>((resolve, reject) => {
		watcher
			?.removeAllListeners()
			?.close()
			.then(() =>
				server?.close(() => {
					server = null;
					watcher = null;
					resolve();
				})
			)
			.catch((err) => reject(err));
	});
}
export function getServerStatus() {
	return Boolean(server);
}
// returns a path to new version of an html file with scripts attached
async function loadFeatures(path: string, site: string): Promise<string> {
	const fileContent = readFileSync(path);
	if (extname(path) != ".html") {
		console.warn(`Can't attach dev script to ${path} - not an html file`);
		return fileContent.toString();
	}

	// load html as string, then convert to jsdom
	const dom = new JSDOM(fileContent);
	const document = dom.window.document;

	// loads default css
	const styleElement = document.createElement("style");
	styleElement.appendChild(document.createTextNode("body { background: white }"));
	document.head.appendChild(styleElement);
	const addScript = ({ action, params }: InjectedScript) => {
		const script = document.createElement("script");
		const id = "devScript" + Math.floor(1000 * Math.random()).toString();
		script.innerHTML = `const ${id} = ${action.toString()}\n${id}([${params.map((param) => `\`${param}\``).join(", ")}])`;
		document.body.appendChild(script);
	};

	// loads dev scripts
	const { widgets } = await getWidgets(site);
	widgets.map((widget) => addScript(buildWidget(widget)));

	// return serialized dom
	return dom.serialize();
}
