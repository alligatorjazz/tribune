import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { AppContext } from "./App.lib";
import { Sidebar } from "./components/Sidebar";

export function App(): JSX.Element {
	const [theme, setTheme] = useState<"light" | "dark">("dark");

	useEffect(() => {
		document.documentElement.className = theme;
	}, [theme]);

	return (
		<AppContext.Provider value={{ theme, setTheme }}>
			<div className="w-full h-full flex">
				<Sidebar className="flex-0" />
				<div className="flex-1">
					<Outlet />
				</div>
			</div>
		</AppContext.Provider>
	);
}
