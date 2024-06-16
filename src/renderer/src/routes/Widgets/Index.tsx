import { faker } from "@faker-js/faker";
import { Link } from "react-router-dom";
import { useAppContext } from "../../App.lib";
import { SidebarLayout } from "../../components/SidebarLayout";
import { useWidgets } from "../../hooks/useWidgets";

export function Widgets() {
	const { widgets, setWidgets } = useWidgets();
	const { activeSite } = useAppContext();

	return (
		<SidebarLayout
			title="Widgets"
			description="Create reusable pieces of HTML for your site's pages."
		>
			{Array.isArray(widgets) && (
				<ul>
					{widgets.map((widget) => {
						return (
							<li key={widget.tag} className=" border-b last-of-type:border-0">
								<Link
									to={"edit?" + new URLSearchParams(widget)}
									className="hover:bg-bgColor p-2 flex justify-between"
								>
									<span>{widget.tag}</span>
									<button className="bg-transparent">✎</button>
								</Link>
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
