import { useEffect, useState } from "react";
import { SidebarLayout } from "../components/SidebarLayout";
import { WidgetData } from "tribune-types";
import { useAppContext } from "../App.lib";

export function Widgets() {
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

	return (
		<SidebarLayout
			title="Widgets"
			description="Create reusable pieces of HTML for your site's pages."
		>
			<div>{JSON.stringify(widgets)}</div>
			<button
				className="p-4"
				onClick={() => {
					if (activeSite)
						window.api
							.saveWidget(activeSite, {
								tag: "test-widget",
								content: "hello!"
							})
							.then(() => setWidgets())
							.catch((err) => console.error(err));
				}}
			>
				+ New Widget
			</button>
		</SidebarLayout>
	);
}
