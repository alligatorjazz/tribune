import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { WidgetData } from "../../../../shared";
import { useAppContext } from "../../App.lib";
import { SidebarLayout } from "../../components/SidebarLayout";
import { useWidgets } from "../../hooks/useWidgets";

export function Widgets() {
	const { activeSite, siteMap } = useAppContext();
	const { widgets, getWidgetPath } = useWidgets(siteMap);
	const [editingWidget, setEditingWidget] = useState<WidgetData | null>(null);

	const rename = useCallback(
		async (newTag: string) => {
			if (!editingWidget || !activeSite) {
				return;
			}
			// clones currently edited widget
			const widget = { ...editingWidget };
			const oldPath = getWidgetPath(widget.tag);
			const newPath = getWidgetPath(newTag);

			if (!oldPath) {
				alert(
					`Could not find path of widget ${widget.tag}. If the problem persists, restart Tribune.`
				);
				return window.location.reload();
			}

			if (!newPath) {
				alert(
					`Could not rename widget ${widget.tag}. If the problem persists, restart Tribune.`
				);
				return window.location.reload();
			}
			// gets data from form
			try {
				return window.api
					.renameSourceCode(oldPath, newPath)
					.catch((err) => alert(JSON.stringify(err, null, 4)));
			} catch (err) {
				alert(JSON.stringify(err, null, 4));
			}
		},
		[activeSite, editingWidget, getWidgetPath]
	);

	if (!activeSite) {
		return null;
	}

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
											const newTag = new FormData(
												e.target as HTMLFormElement
											).get("tag");
											if (newTag) {
												rename(newTag.toString());
											}
											setEditingWidget(null);
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
					if (activeSite) {
						const path = getWidgetPath("new-widget");
						if (!path) {
							throw new Error("Could not create new widget.");
						}
						window.api
							.saveSourceCode(path, `<div>Hello World!</div>`)
							.catch((err) => console.error(err));
					}
				}}
			>
				+ New Widget
			</button>
		</SidebarLayout>
	);
}
