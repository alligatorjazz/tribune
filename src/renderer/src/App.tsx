import { useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { AppContext } from "./App.lib";
import { Sidebar } from "./components/Sidebar";
import { devURL } from "./global";
import { ConnectionStatus } from "./types";

export function App(): JSX.Element {
	const [theme, setTheme] = useState<"light" | "dark">("dark");
	const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
	// sets <html className={theme}>
	useEffect(() => {
		document.documentElement.className = theme;
	}, [theme]);

	// TODO: figure out how to smoothly auto-reconnect
	// health check
	const healthCheck = useCallback(() => {
		const timeout = 3000;
		const retry = () =>
			setTimeout(() => {
				console.log(`healthCheck: retrying connection in ${timeout / 1000} sec...`);
				healthCheck();
			}, timeout);
		fetch(devURL)
			.then((response) => {
				if (response.ok) {
					setConnectionStatus((prev) => {
						if (prev !== "connected") {
							console.log(
								"healthCheck: successfully established connection to dev server"
							);
						}
						return "connected";
					});
				} else {
					response.json().then((json) => {
						console.error("health check: dev server connection failed:\n", json);
						retry();
					});
				}
			})
			.catch((err) => {
				console.error("health check: fetch failed:\n", err);
				retry();
			});
	}, []);

	useEffect(() => {
		if (connectionStatus === "disconnected") {
			window.api.startServer("Testy Test").then(() => {
				setConnectionStatus("loading");
				healthCheck();
			});
		}
	}, [connectionStatus, healthCheck]);

	return (
		<AppContext.Provider value={{ theme, setTheme, connectionStatus }}>
			<div className="w-full h-full flex">
				<Sidebar className="flex-0" />
				<div className="flex-1">
					<Outlet />
				</div>
			</div>
		</AppContext.Provider>
	);
}
