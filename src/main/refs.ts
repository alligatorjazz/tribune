import { app } from "electron";
import { join } from "path";

const dev = true;
export const APP_NAME = "Tribune";
export const DIR = {
	Sites: dev
		? join(app.getAppPath(), "sandbox", "appData")
		: join(app.getPath("appData"), APP_NAME),
	Cache: dev ? join(app.getAppPath(), "sandbox", "temp") : join(app.getPath("temp"), APP_NAME)
};
