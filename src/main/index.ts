import { electronApp, is, optimizer } from "@electron-toolkit/utils";
import { BrowserWindow, app, ipcMain, shell } from "electron";
import { join } from "path";
import icon from "../../resources/icon.png?asset";
import { closeServer, getServerStatus, startServer } from "./server";
import { createSite, getSiteMap, getSourceCode, renameSourceCode, saveSourceCode } from "./sites";
import { getWidgets, watchWidgets } from "./widgets";
import { getPosts, savePost } from "./posts";
import { PartialBy, PostMetadata } from "../shared/types";

function createWindow() {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		width: 900,
		height: 670,
		show: false,
		autoHideMenuBar: true,
		...(process.platform === "linux" ? { icon } : {}),
		webPreferences: {
			preload: join(__dirname, "../preload/index.js"),
			sandbox: false
		}
	});

	mainWindow.on("ready-to-show", () => {
		mainWindow.show();
	});

	mainWindow.on("close", closeServer);

	mainWindow.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details.url);
		return { action: "deny" };
	});

	mainWindow.webContents.openDevTools({ mode: "right" });
	// HMR for renderer base on electron-vite cli.
	// Load the remote URL for development or the local html file for production.
	if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
		mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
	} else {
		mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
	}

	return mainWindow;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	// Set app user model id for windows
	electronApp.setAppUserModelId("com.electron");

	// Default open or close DevTools by F12 in development
	// and ignore CommandOrControl + R in production.
	// see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
	app.on("browser-window-created", (_, window) => {
		optimizer.watchWindowShortcuts(window);
	});

	createWindow();

	// SITE COMMANDS
	ipcMain.handle("create-site", (_event, siteTitle: string) => {
		createSite(siteTitle);
	});

	ipcMain.handle("get-site-map", (_event, siteTitle: string) => {
		return getSiteMap(siteTitle);
	});

	// SERVER COMMANDS
	ipcMain.handle("start-server", (event, siteTitle: string) => {
		startServer(siteTitle, () =>
			BrowserWindow.fromWebContents(event.sender)?.webContents.send("auto-reload")
		);
		watchWidgets(siteTitle, () =>
			BrowserWindow.fromWebContents(event.sender)?.webContents.send("widget-change")
		);
	});

	ipcMain.handle("get-server-status", () => {
		return getServerStatus();
	});

	ipcMain.handle("get-widgets", (_event, site: string) => {
		return getWidgets(site);
	});

	// FILE COMMANDS
	ipcMain.handle("get-source-code", (_event, localPath) => {
		return getSourceCode(localPath);
	});

	ipcMain.handle("save-source-code", (_event, localPath, content) => {
		return saveSourceCode(localPath, content);
	});

	ipcMain.handle("rename-source-code", (_event, oldPath: string, newPath: string) => {
		return renameSourceCode(oldPath, newPath);
	});

	// POST COMMANDS
	ipcMain.handle("get-posts", (_event, site: string) => {
		return getPosts(site);
	});

	ipcMain.handle(
		"save-post",
		(_event, site: string, metadata: PartialBy<PostMetadata, "title">, content: string) => {
			return savePost(site, metadata, content);
		}
	);

	app.on("activate", function () {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	closeServer().then(() => {
		if (process.platform !== "darwin") {
			app.quit();
		}
	});
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
