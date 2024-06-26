import chokidar from "chokidar";
import { mkdir, readFile, readdir, rename, writeFile } from "fs/promises";
import { basename, join } from "path";
import { WidgetData, WidgetDataSchema } from "../shared";
import { DIR } from "./refs";
import { InjectedScript } from "./server";

let watcher: chokidar.FSWatcher | null = null;

export function buildWidget(data: WidgetData): InjectedScript {
	const action = ([tag, content]: string[]) => {
		const WidgetElement = class extends HTMLElement {
			constructor() {
				super();
			}
			connectedCallback() {
				const container = document.createElement("div");
				container.innerHTML = content;
				this.appendChild(container);
			}
		};
		customElements.define(tag, WidgetElement);
	};

	return { action, params: [data.tag, data.content] };
}

export function watchWidgets(dir: string, onChange: () => void) {
	const watchList = watcher?.getWatched();
	if (!watchList) {
		watcher = chokidar.watch(dir).on("all", () => {
			console.log("widget change");
			onChange();
		});
	} else if (Object.keys(watchList).includes(dir)) {
		watcher?.close().then(
			() =>
				(watcher = chokidar.watch(dir).on("all", () => {
					console.log("widget change");
					onChange();
				}))
		);
	}
}

export type GetWidgetResult = { widgets: WidgetData[]; errors?: { path: string; cause: string }[] };
export async function getWidgets(site: string): Promise<GetWidgetResult> {
	const siteDir = join(DIR.Sites, site);
	const widgetDir = join(siteDir, "widgets");
	// make widget dir if it doesn't exist
	await mkdir(widgetDir, { recursive: true });
	const widgetFiles = await readdir(widgetDir);

	const widgets: WidgetData[] = [];
	const errors: { path: string; cause: string }[] = [];

	await Promise.all(
		widgetFiles.map(async (file) => {
			try {
				const content = (await readFile(join(widgetDir, file))).toString("utf-8");
				const parseResult = WidgetDataSchema.safeParse({
					tag: basename(file, ".html"),
					content
				});
				if (parseResult.success) {
					widgets.push(parseResult.data);
				} else {
					errors.push({ path: file, cause: JSON.stringify(parseResult.error, null, 4) });
				}
			} catch (error) {
				errors.push({ path: file, cause: JSON.stringify(error, null, 4) });
			}
		})
	);
	if (errors.length > 0) {
		console.error(errors);
	}
	return { widgets, errors };
}

export async function saveWidget(site: string, widget: WidgetData) {
	const siteDir = join(DIR.Sites, site);
	const widgetDir = join(siteDir, "widgets");
	await mkdir(widgetDir, { recursive: true });
	await writeFile(join(widgetDir, `${widget.tag}.html`), widget.content);
}

export async function renameWidget(site: string, oldTag: string, newTag: string) {
	const siteDir = join(DIR.Sites, site);
	const widgetDir = join(siteDir, "widgets");
	const oldPath = join(widgetDir, oldTag, ".html");
	const newPath = join(widgetDir, newTag, ".html");
	return await rename(oldPath, newPath);
}
