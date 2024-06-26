import { faker } from "@faker-js/faker";
import { Link } from "react-router-dom";
import { useAppContext } from "../../App.lib";
import { SidebarLayout } from "../../components/SidebarLayout";
import { useWidgets } from "../../hooks/useWidgets";
import { useState } from "react";
import { WidgetData, WidgetDataSchema } from "tribune-types";

export function Widgets() {
	const { activeSite, siteMap } = useAppContext();
	const { widgets, setWidgets, getWidgetPath } = useWidgets(siteMap);
	const [editingWidget, setEditingWidget] = useState<WidgetData | null>(null);

	return (
		<SidebarLayout
			title="Widgets"
			description="Create reusable pieces of HTML for your site's pages."
		>
			{Array.isArray(widgets) && (
				<ul className="flex flex-col">
					{widgets.map((widget) => {
						if (widget.tag === editingWidget?.tag) {
							return (
								<li
									key={widget.tag}
									className="border-b last-of-type:border-0 flex items-center"
								>
									<form
										className="w-full h-10"
										onSubmit={(e) => {
											e.preventDefault();
											const localPath = getWidgetPath(widget.tag);
											if (!localPath) {
												alert("Could not save widget " + widget.tag);
												return window.location.reload();
											}
											const data = new FormData(e.target as HTMLFormElement);
											try {
												const tag = WidgetDataSchema.shape.tag.parse(
													data.get("tag") ?? widget.tag
												);
												window.api
													.saveSourceCode(
														localPath,
														JSON.stringify({
															...widget,
															tag
														})
													)
													.then(() => window.location.reload())
													.catch((err) =>
														alert(JSON.stringify(err, null, 4))
													);
											} catch (err) {
												alert(JSON.stringify(err, null, 4));
											}
										}}
									>
										<input
											type="text"
											defaultValue={widget.tag}
											name="tag"
											className="bg-bgColor w-full h-10"
										/>
									</form>
								</li>
							);
						}
						return (
							<li
								key={widget.tag}
								className="border-b last-of-type:border-0 flex items-center hover:bg-bgColor"
							>
								<Link to={"edit?" + new URLSearchParams(widget)} className="flex-1">
									{widget.tag}
								</Link>
								<button
									className="hover:bg-accentColor bg-transparent h-10"
									onClick={() => setEditingWidget(widget)}
								>
									<span className="text-sm border-b border-dotted">abc</span>
								</button>
							</li>
						);
					})}
				</ul>
			)}
			<button
				className="p-4"
				onClick={() => {
					if (activeSite)
						window.api
							.saveWidget(activeSite, {
								tag: faker.animal.bear().split(" ").join("-").toLowerCase(),
								content: "hello!"
							})
							.then(() => setWidgets(undefined))
							.catch((err) => console.error(err));
				}}
			>
				+ New Widget
			</button>
		</SidebarLayout>
	);
}
