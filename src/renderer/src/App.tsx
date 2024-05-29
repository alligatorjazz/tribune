import { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar";

export function App(): JSX.Element {
	const [theme, setTheme] = useState<"light" | "dark">("dark");
	useEffect(() => {
		document.documentElement.className = theme;
	}, [theme]);

	return (
		<div className="w-full h-full flex">
			<Sidebar />
			<main>
				<button
					className="p-4 bg-fgColor"
					onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
				>
					Change Theme
				</button>
			</main>
		</div>
	);
}
