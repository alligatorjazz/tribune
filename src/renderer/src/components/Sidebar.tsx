import { Link, useLocation } from "react-router-dom";
import { topLevelNav } from "../global";
import { HTMLAttributes } from "react";
import { useAppContext } from "../App.lib";

export function Sidebar({ className, ...extraProps }: HTMLAttributes<HTMLDivElement>) {
	const location = useLocation();
	// console.log(location);
	const { theme, setTheme } = useAppContext();
	return (
		<div className={[className, "h-full bg-fgColor p-4 w-48"].join(" ")} {...extraProps}>
			<nav className="flex flex-col w-full gap-2">
				{topLevelNav.map(({ title, route }) => (
					<Link
						key={route}
						className={`
							p-2 rounded-sm select-none 
							hover:bg-bgColor hover:brightness-125
						`}
						to={route}
					>
						{title}
					</Link>
				))}
				<button className="px-4 py-2" onClick={() => window.api.startServer("Testy Test")}>
					Start Server
				</button>
				<button className="px-4 py-2" onClick={() => window.api.stopServer()}>
					Stop Server
				</button>
				<button
					className="px-4 py-2"
					onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
				>
					Change Theme
				</button>
			</nav>
		</div>
	);
}
