import chokidar from "chokidar";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import { readFileSync } from "fs";
import { IncomingMessage, Server, ServerResponse } from "http";
import { JSDOM } from "jsdom";
import { extname, join } from "path";
import { DIR } from "./refs";
import { autoReload } from "./scripts/autoReload";
// import { broadcastStyle } from "./scripts/broadcastStyle";

let server: Server<typeof IncomingMessage, typeof ServerResponse> | null = null;
let watcher: chokidar.FSWatcher | null = null;
export let reload = false;

// returns a path to new version of an html file with dev scripts attached
function attachDevScripts(path: string): string {
	// check if given path is an html file]
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
	const addScript = (func: () => void) => {
		const script = document.createElement("script");
		script.innerHTML = `${func.toString()}\n${func.name}()`;
		document.body.appendChild(script);
	};
	// loads dev scripts
	addScript(autoReload);
	// addScript(broadcastStyle);

	// return serialized dom
	return dom.serialize();
}

export function startServer(siteName: string, reloadCallback: () => void) {
	const siteDir = join(DIR.Sites, siteName);
	const app: Application = express();
	app.use(cors({ origin: "*" }));
	// serve index.html at the root
	app.use(express.static(join(siteDir)));
	app.get("*", (req: Request, res: Response) => {
		const localPath = join(siteDir, req.path);
		res.send(attachDevScripts(localPath));
	});

	// TODO: allow for custom port
	// Start the server on a specified port
	const port = process.env.PORT || 3000;

	const startup = () => {
		console.log("starting server...");
		server = app.listen(port, () => {
			console.log(`Server is running on http://localhost:${port}`);
		});
		const onChange = (e: "add" | "addDir" | "change", path: string) => {
			if (server) {
				console.log(`change detected (${JSON.stringify(path)}, ${e}): queuing autoreload`);
				reloadCallback();
			}
		};
		watcher = chokidar.watch(siteDir).on("change", onChange);
	};
	if (server) {
		server.close(startup);
	} else {
		startup();
	}
}

export async function stopServer() {
	if (server) {
		server.close(() => {
			server = null;
		});
	}

	if (watcher) {
		return watcher.close();
	}
}

export function setReload(value: boolean) {
	reload = value;
}
