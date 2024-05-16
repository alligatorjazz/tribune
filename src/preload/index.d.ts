import { ElectronAPI } from "@electron-toolkit/preload";
import { TribuneAPI } from "./api";

declare global {
	interface Window {
		electron: ElectronAPI;
		api: TribuneAPI;
	}
}
