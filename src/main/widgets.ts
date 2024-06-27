import chokidar from "chokidar";
import { mkdir, readFile, readdir, rename, writeFile } from "fs/promises";
import { basename, join } from "path";
import { WidgetData, WidgetDataSchema } from "../shared";
import { InjectedScript } from "./server";
import { getSiteFolders } from "./sites";

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
	const { widgetsDir } = getSiteFolders(site);
	// make widget dir if it doesn't exist
	await mkdir(widgetsDir, { recursive: true });
	const widgetFiles = await readdir(widgetsDir);

	const widgets: WidgetData[] = [];
	const errors: { path: string; cause: string }[] = [];

	await Promise.all(
		widgetFiles.map(async (file) => {
			try {
				const content = (await readFile(join(widgetsDir, file))).toString("utf-8");
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
	const { widgetsDir } = getSiteFolders(site);
	await mkdir(widgetsDir, { recursive: true });
	await writeFile(join(widgetsDir, `${widget.tag}.html`), widget.content);
}

export async function renameWidget(site: string, oldTag: string, newTag: string) {
	const { widgetsDir } = getSiteFolders(site);
	const oldPath = join(widgetsDir, oldTag, ".html");
	const newPath = join(widgetsDir, newTag, ".html");
	return await rename(oldPath, newPath);
}
