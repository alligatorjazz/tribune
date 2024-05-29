import chokidar from "chokidar";
import express, { Application, Request, Response } from "express";
import { readFileSync } from "fs";
import { IncomingMessage, Server, ServerResponse } from "http";
import { JSDOM } from "jsdom";
import { extname, join } from "path";
import { DIR } from "./refs";
import { autoReload } from "./scripts/autoReload";

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

	// load autoreload script as string
	const script = document.createElement("script");
	script.innerHTML = `${autoReload.toString()}\n${autoReload.name}()`;
	document.body.appendChild(script);

	// return serialized dom
	return dom.serialize();
}

export function startServer(siteName: string, reloadCallback: () => void) {
	console.log("starting server...");
	const siteDir = join(DIR.Sites, siteName);
	const app: Application = express();

	// serve index.html at the root
	app.get("/", (_req: Request, res: Response) => {
		res.send(attachDevScripts(join(siteDir, "index.html")));
	});

	// TODO: add autoreload through server endpt & autoreload script
	// TODO: allow for custom port

	// Start the server on a specified port
	const port = process.env.PORT || 3000;
	console.log("starting server...");
	server?.close();
	app.listen(port, () => {
		console.log(`Server is running on http://localhost:${port}`);
	});

	watcher = chokidar.watch(siteDir).on("all", () => {
		console.log("change detected: queuing autoreload");
		reloadCallback();
	});
}

export async function stopServer() {
	console.log("stopping server...");
	if (server) {
		server.close();
		server = null;
	}

	if (watcher) {
		return watcher.close();
	}
}

export function setReload(value: boolean) {
	reload = value;
}
