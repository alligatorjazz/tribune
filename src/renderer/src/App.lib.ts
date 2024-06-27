import { Dispatch, SetStateAction, createContext, useContext } from "react";
import { SiteMap } from "../../shared/types";

type Theme = "light" | "dark";
interface IAppContext {
	theme: Theme;
	setTheme: Dispatch<SetStateAction<Theme>>;
	siteMap?: SiteMap | "loading";
	activeSite?: string;
	previewRoute: string;
	setPreviewRoute: Dispatch<SetStateAction<string>>;
	triggerRefresh: (() => void) | undefined;
	handleRefresh: Dispatch<SetStateAction<(() => void) | undefined>>;
}

export const AppContext = createContext<IAppContext | undefined>(undefined);

export function useAppContext() {
	const ctx = useContext(AppContext);
	if (!ctx) {
		throw new Error("Cannot useAppContext before App is initialized.");
	}
	return ctx;
}
