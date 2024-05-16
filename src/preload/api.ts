import { ipcRenderer } from "electron";

// Custom APIs for renderer
export const api = {
	createSite: (siteTitle: string): void => ipcRenderer.send("create-site", siteTitle)
};

export type TribuneAPI = typeof api;
