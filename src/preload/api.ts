import { IpcRendererEvent, ipcRenderer } from "electron";
// Custom APIs for renderer
export const api = {
	createSite: (siteTitle: string): Promise<void> => ipcRenderer.invoke("create-site", siteTitle),
	startServer: (siteTitle: string): Promise<void> =>
		ipcRenderer.invoke("start-server", siteTitle),
	getSiteMap: (siteTitle: string) => ipcRenderer.invoke("get-site-map", siteTitle),
	getServerStatus: (): Promise<boolean> => ipcRenderer.invoke("get-server-status"),
	getSourceCode: (localPath: string): Promise<string> =>
		ipcRenderer.invoke("get-source-code", localPath),
	saveSourceCode: (localPath: string, content: string) =>
		ipcRenderer.invoke("save-source-code", localPath, content),
	onAutoReload: (callback: (event: IpcRendererEvent) => void) =>
		ipcRenderer.on("auto-reload", callback)
};

export type TribuneAPI = typeof api;
