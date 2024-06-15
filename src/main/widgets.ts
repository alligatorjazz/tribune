import { join } from "path";
import { WidgetData, WidgetDataSchema } from "tribune-types";
import { DIR } from "./refs";
import { InjectedScript } from "./server";
import { mkdir, readFile, readdir, writeFile } from "fs/promises";

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

export type GetWidgetResult = { widgets: WidgetData[]; errors?: { path: string; cause: string }[] };
export async function getWidgets(site: string): Promise<GetWidgetResult> {
	const siteDir = join(DIR.Sites, site);
	const widgetDir = join(siteDir, "widgets");
	await mkdir(widgetDir, { recursive: true });
	const widgetFiles = await readdir(widgetDir);
	const widgets: WidgetData[] = [];
	const errors: { path: string; cause: string }[] = [];
	await Promise.all(
		widgetFiles.map(async (file) => {
			try {
				const data = JSON.parse((await readFile(join(widgetDir, file))).toString("utf-8"));
				const parseResult = WidgetDataSchema.safeParse(data);
				if (parseResult.success) {
					console.log(parseResult);
					widgets.push(parseResult.data);
				} else {
					errors.push({ path: file, cause: JSON.stringify(parseResult.error, null, 4) });
				}
			} catch (error) {
				errors.push({ path: file, cause: JSON.stringify(error, null, 4) });
			}
		})
	);
	console.log(widgets, errors);
	return { widgets, errors };
}

export async function saveWidget(site: string, widget: WidgetData) {
	const siteDir = join(DIR.Sites, site);
	const widgetDir = join(siteDir, "widgets");
	await mkdir(widgetDir, { recursive: true });
	await writeFile(join(widgetDir, `${widget.tag}.json`), JSON.stringify(widget, null, 4));
}
