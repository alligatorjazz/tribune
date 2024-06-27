import { IpcRendererEvent, ipcRenderer } from "electron";
import { GetWidgetResult } from "../main/widgets";
import { PartialBy, PostMetadata, PostQueryResponse, WidgetData } from "../shared/types";
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
	renameSourceCode: (localPath: string, newPath: string): Promise<void> =>
		ipcRenderer.invoke("rename-source-code", localPath, newPath),
	getWidgets: (site: string): Promise<GetWidgetResult> => {
		return ipcRenderer.invoke("get-widgets", site);
	},
	saveWidget: (site: string, widget: WidgetData): Promise<void> => {
		return ipcRenderer.invoke("save-widget", site, widget);
	},
	getPosts: (site: string): Promise<{ posts: PostQueryResponse; errors: string[] }> =>
		ipcRenderer.invoke("get-posts", site),
	savePost: (
		site: string,
		metadata: PartialBy<PostMetadata, "title">,
		content: string
	): Promise<string> => ipcRenderer.invoke("save-post", site, metadata, content),
	onAutoReload: (callback: (event: IpcRendererEvent) => void) =>
		ipcRenderer.on("auto-reload", callback),
	onWidgetChange: (callback: (event: IpcRendererEvent) => void) =>
		ipcRenderer.on("widget-change", callback)
};

export type TribuneAPI = typeof api;
