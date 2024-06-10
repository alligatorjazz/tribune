import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { SiteMap } from "tribune-types";
import { AppContext } from "./App.lib";
import { PreviewFrame } from "./components/PreviewFrame";

export function App(): JSX.Element {
	const [theme, setTheme] = useState<"light" | "dark">("dark");

	const [activeSite] = useState<string | undefined>("Testy Test");
	const [siteMap, setSiteMap] = useState<SiteMap | "loading">();
	const [previewRoute, setpreviewRoute] = useState<string>("/");

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

	return (
		<AppContext.Provider
			value={{
				theme,
				setTheme,
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
