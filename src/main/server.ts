import express, { Application, Request, Response } from "express";
import { mkdirSync, readFileSync, readdirSync, watch, writeFileSync } from "fs";
import { IncomingMessage, Server, ServerResponse } from "http";
import { JSDOM } from "jsdom";
import { basename, dirname, extname, join } from "path";
import { DIR } from "./refs";
import { autoReload } from "./scripts/autoReload";

let server: Server<typeof IncomingMessage, typeof ServerResponse> | null = null;
let reload = false;

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

	// save modified file in cache folder
	const outputPath = join(DIR.Cache, basename(path));
	mkdirSync(dirname(outputPath), { recursive: true });
	writeFileSync(outputPath, dom.serialize());
	return outputPath;
}

export function startServer(siteName: string) {
	console.log("starting server...");
	const siteDir = join(DIR.Sites, siteName);
	const app: Application = express();

	// serve index.html at the root
	app.get("/", (_req: Request, res: Response) => {
		res.sendFile(attachDevScripts(join(siteDir, "index.html")));
	});

	app.get("/devhook", (_, res) => {
		res.send({ reload });
		if (reload) {
			reload = false;
		}
	});

	// TODO: add autoreload through server endpt & autoreload script
	// Start the server on a specified port
	const port = process.env.PORT || 3000;
	console.log("starting server...");
	server?.close();
	app.listen(port, () => {
		console.log(`Server is running on http://localhost:${port}`);
	});

	watch(siteDir, () => {
		console.log("change detected: queuing autoreload");
		setReload(true);
	});
}

export function stopServer() {
	console.log("stopping server...");
	if (server) {
		server.close();
		server = null;
	}
}

export function setReload(value: boolean) {
	reload = value;
}
