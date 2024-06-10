import { Dispatch, createContext, useContext } from "react";
import { ConnectionStatus, SiteMap } from "tribune-types";

type Theme = "light" | "dark";
interface IAppContext {
	theme: Theme;
	setTheme: Dispatch<Theme>;
	connectionStatus: ConnectionStatus;
	siteMap?: SiteMap | "loading";
	activeSite?: string;
	previewRoute: string;
	setpreviewRoute: Dispatch<string>;
}

export const AppContext = createContext<IAppContext | undefined>(undefined);

export function useAppContext() {
	const ctx = useContext(AppContext);
	if (!ctx) {
		throw new Error("Cannot useAppContext before App is initialized.");
	}
	return ctx;
}
