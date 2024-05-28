import { app } from "electron";
import { join } from "path";
export const APP_NAME = "Tribune";
export const DIR = {
	Sites: join(app.getPath("appData"), APP_NAME),
	Cache: join(app.getPath("temp"), APP_NAME)
};
