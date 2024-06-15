import { IpcRendererEvent, ipcRenderer } from "electron";
import { WidgetData } from "tribune-types";
import { GetWidgetResult } from "../main/widgets";
// Custom APIs for renderer
export const api = {
	createSite: (siteTitle: string): Promise<void> => ipcRenderer.invoke("create-site", siteTitle),
	startServer: (siteTitle: string): Promise<void> =>
		ipcRenderer.invoke("start-server", siteTitle),
	getSiteMap: (siteTitle: string) => ipcRenderer.invoke("get-site-map", siteTitle),
	getServerStatus: (): Promise<boolean> => ipcRenderer.invoke("get-server-status"),
	getSourceCode: (localPath: string): Promise<string> =>
		ipcRenderer.invoke("get-source-code", localPath),
	saveSourceCode: (localPath: string, content: string): Promise<void> =>
		ipcRenderer.invoke("save-source-code", localPath, content),
	getWidgets: (site: string): Promise<GetWidgetResult> => {
		return ipcRenderer.invoke("get-widgets", site);
	},
	saveWidget: (site: string, widget: WidgetData): Promise<void> => {
		return ipcRenderer.invoke("save-widget", site, widget);
	},
	onAutoReload: (callback: (event: IpcRendererEvent) => void) =>
		ipcRenderer.on("auto-reload", callback)
};

export type TribuneAPI = typeof api;
