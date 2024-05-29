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
				<Sidebar />
				<main className="p-4">
					<Outlet />
				</main>
			</div>
		</AppContext.Provider>
	);
}
