import { useAppContext } from "../App.lib";

export function Dashboard() {
	const { theme, setTheme } = useAppContext();

	return (
		<button className="p-4" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
			Change Theme
		</button>
	);
}
