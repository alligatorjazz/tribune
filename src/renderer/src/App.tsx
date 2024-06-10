import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ConnectionStatus, SiteMap } from "tribune-types";
import { AppContext } from "./App.lib";
import { PreviewFrame } from "./components/PreviewFrame";
import { devURL } from "./global";

export function App(): JSX.Element {
	const [theme, setTheme] = useState<"light" | "dark">("dark");
	const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
	const [activeSite, setActiveSite] = useState<string | undefined>("Testy Test");
	const [siteMap, setSiteMap] = useState<SiteMap | "loading">();
	const [previewRoute, setpreviewRoute] = useState<string>("/");

	const location = useLocation();
	console.log(location);
	useEffect(() => {
		if (activeSite && !siteMap) {
			setSiteMap("loading");
			window.api
				.getSiteMap(activeSite)
				.then((map) => setSiteMap(map))
				.catch((err) => {
					console.error("Error fetching sitemap:", err);
					setSiteMap(undefined);
				});
		}
	}, [activeSite, siteMap]);

	// sets <html className={theme}>
	useEffect(() => {
		document.documentElement.className = theme;
	}, [theme]);

	// updates sitemap
	useEffect(() => {
		window.api.onAutoReload(() => {
			window.api.getSiteMap("Testy Test").then((map) => {
				setSiteMap(map as SiteMap);
			});
		});
	}, []);

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
		<AppContext.Provider
			value={{
				theme,
				setTheme,
				connectionStatus,
				siteMap,
				activeSite,
				previewRoute,
				setpreviewRoute
			}}
		>
			<div className="w-full h-full flex">
				<Outlet />
				<div className="flex-1">
					<PreviewFrame route={previewRoute} />
				</div>
			</div>
		</AppContext.Provider>
	);
}
