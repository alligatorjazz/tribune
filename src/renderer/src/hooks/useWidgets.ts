import { useCallback, useEffect, useState } from "react";
import { WidgetData } from "tribune-types";
import { useAppContext } from "../App.lib";
import { dirname, join } from "path-browserify";

export function useWidgets(siteMap) {
	const [widgets, setWidgets] = useState<WidgetData[] | "loading" | undefined>();
	const { activeSite } = useAppContext();

	useEffect(() => {
		if (!widgets) {
			setWidgets("loading");
		}

		if (widgets === "loading" && activeSite) {
			console.log("loading widgets");
			window.api
				.getWidgets(activeSite)
				.then(({ widgets, errors }) => {
					errors?.map((err) => console.error(err));
					setWidgets(widgets);
				})
				.catch((err) => console.error(err));
		}
	}, [activeSite, widgets]);
	const getWidgetPath = useCallback(
		(tag: string) => {
			if (!Array.isArray(siteMap) || !Array.isArray(widgets)) {
				return null;
			}
			const widget = widgets?.find((item) => item.tag === tag);
			if (!widget) {
				return null;
			}
			const indexRoute = siteMap.find((node) => node.index)?.localPath;
			if (!indexRoute) {
				console.warn("Could not find index route in sitemap", siteMap);
				return null;
			}
			const siteDir = dirname(indexRoute);
			return join(siteDir, "widgets", widget.tag + ".html");
		},
		[siteMap, widgets]
	);

	return { widgets, setWidgets, getWidgetPath };
}
