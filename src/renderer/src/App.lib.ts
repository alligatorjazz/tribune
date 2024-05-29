import { Dispatch, createContext, useContext } from "react";

type Theme = "light" | "dark";
interface IAppContext {
	theme: Theme;
	setTheme: Dispatch<Theme>;
}

export const AppContext = createContext<IAppContext | undefined>(undefined);

export function useAppContext() {
	const ctx = useContext(AppContext);
	if (!ctx) {
		throw new Error("Cannot useAppContext before App is initialized.");
	}
	return ctx;
}
