import { ipcRenderer } from "electron";

// Custom APIs for renderer
export const api = {
	createSite: (siteTitle: string): Promise<void> => ipcRenderer.invoke("create-site", siteTitle),
	startServer: (siteTitle: string): Promise<void> =>
		ipcRenderer.invoke("start-server", siteTitle),
	stopServer: (): Promise<void> => ipcRenderer.invoke("stop-server")
};

export type TribuneAPI = typeof api;
