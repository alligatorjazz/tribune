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
const onFileChange = (e: string, path: string, cb: () => void) => {
	// console.log(`change detected (${JSON.stringify(path)}, ${e}): queuing autoreload`);
	try {
		cb();
	} catch (err) {
		console.error("could not run file change callback\n", err);
	}
};

export function startServer(siteName: string, reloadCallback: () => void) {
	const init = () => {
		console.log("starting server...");
		const siteDir = join(DIR.Sites, siteName);
		const app: Application = express();
		app.use(cors({ origin: "*" }));
		// build html routes based on site folder structure
		app.use(express.static(join(siteDir)));
		app.get("*", (req: Request, res: Response) => {
			const localPath = join(siteDir, req.path);
			res.send(attachDevScripts(localPath));
		});

		// TODO: allow for custom port
		const port = process.env.PORT || 3000;

		server = app.listen(port, () => {
			console.log(`Server is running on http://localhost:${port}`);
			if (!watcher) {
				watcher = chokidar
					.watch(siteDir)
					.on("all", (e, path) => onFileChange(e, path, reloadCallback));
			} else {
				watcher
					.removeAllListeners()
					.close()
					.then(() => {
						watcher = chokidar
							.watch(siteDir)
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
