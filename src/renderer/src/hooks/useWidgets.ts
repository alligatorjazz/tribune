import { dirname, join } from "path-browserify";
import { useCallback, useEffect, useState } from "react";
import { useAppContext } from "../App.lib";
import { SiteMap, WidgetData } from "../../../shared";

export function useWidgets() {
	const [widgets, setWidgets] = useState<WidgetData[] | "loading" | undefined>();
	const { activeSite, siteMap } = useAppContext();
	const loadWidgets = useCallback(() => {
		if (!activeSite) {
			throw new Error("Widget file watcher is open, but there is no active site selected.");
		}
		window.api
			.getWidgets(activeSite)
			.then(({ widgets, errors }) => {
				errors?.map((err) => console.error(err));
				setWidgets(widgets);
			})
			.catch((err) => console.error(err));
	}, [activeSite]);

	// updates widgets on change
	useEffect(() => {
		window.api.onAutoReload(loadWidgets);
	}, [activeSite, loadWidgets]);

	useEffect(() => {
		if (!widgets) {
			setWidgets("loading");
		}

		if (widgets === "loading" && activeSite) {
			loadWidgets();
		}
	}, [activeSite, loadWidgets, widgets]);

	const getWidgetPath = useCallback(
		(tag: string) => {
			const map: SiteMap | null = Array.isArray(siteMap) ? siteMap : null;
			const indexRoute = map?.find((node) => node.index)?.localPath;
			if (!indexRoute) {
				console.warn("Could not find index route in sitemap", map);
				return null;
			}
			const srcDir = dirname(indexRoute);
			return join(srcDir, "..", "widgets", tag + ".html");
		},
		[siteMap]
	);

	return { widgets, setWidgets, getWidgetPath };
}
