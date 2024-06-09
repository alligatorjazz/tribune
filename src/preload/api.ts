import { IpcRendererEvent, ipcRenderer } from "electron";
// Custom APIs for renderer
export const api = {
	createSite: (siteTitle: string): Promise<void> => ipcRenderer.invoke("create-site", siteTitle),
	startServer: (siteTitle: string): Promise<void> =>
		ipcRenderer.invoke("start-server", siteTitle),
	stopServer: (): Promise<void> => ipcRenderer.invoke("stop-server"),
	getSiteMap: (siteTitle: string) => ipcRenderer.invoke("get-site-map", siteTitle),
	onAutoReload: (callback: (event: IpcRendererEvent) => void) =>
		ipcRenderer.on("auto-reload", callback)
};

export type TribuneAPI = typeof api;
