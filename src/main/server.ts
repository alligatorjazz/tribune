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
	// check if given path is an html file
	if (extname(path) != ".html") {
		console.warn(`Can't attach dev script to ${path} - not an html file`);
		return path;
	}

	// load html as string, then convert to jsdom
	const dom = new JSDOM(readFileSync(path));
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
	console.log("starting server...");
	const siteDir = join(DIR.Sites, siteName);
	const app: Application = express();
	app.use(cors({ origin: "*" }));
	// serve index.html at the root
	app.get("/", (_req: Request, res: Response) => {
		res.send(attachDevScripts(join(siteDir, "index.html")));
	});

	// TODO: allow for custom port
	// Start the server on a specified port
	const port = process.env.PORT || 3000;

	const startup = () => {
		console.log("starting server...");
		server = app.listen(port, () => {
			console.log(`Server is running on http://localhost:${port}`);
		});

		watcher = chokidar.watch(siteDir).on("all", (e, path) => {
			if (server) {
				console.log(`change detected (${path}, ${e}): queuing autoreload`);
				reloadCallback();
			}
		});
	};
	if (server) {
		console.log("waiting for previous server to close...");
		server.close(startup);
	} else {
		startup();
	}
}

export async function stopServer() {
	console.log("stopping server...");
	if (server) {
		server.close(() => {
			server = null;
			console.log("server stopped.");
		});
	}

	if (watcher) {
		return watcher.close();
	}
}

export function setReload(value: boolean) {
	reload = value;
}
