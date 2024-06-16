import { WidgetData } from "tribune-types";
import { useAppContext } from "../App.lib";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";

export function useWidgets() {
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

	return { widgets, setWidgets };
}
