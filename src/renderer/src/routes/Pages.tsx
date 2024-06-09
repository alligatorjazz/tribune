import { HTMLAttributes, useMemo } from "react";
import { SiteNode } from "tribune-types";
import { useAppContext } from "../App.lib";
import LoadingIndicator from "../components/LoadingIndicator";
import { SidebarLayout } from "../components/SidebarLayout";
import { toTitleCase } from "../lib";

export function Pages() {
	// TODO: write tree view component
	const { activeSite, siteMap } = useAppContext();
	console.log(activeSite, siteMap);
	const tree = useMemo(() => {
		if (!siteMap || siteMap === "loading" || !activeSite) {
			return null;
		}

		const RouteDisplay = ({ route }: { route: string }) => (
			<span className="opacity-50 text-sm">{route}</span>
		);

		const Branch = ({ className, children, ...props }: HTMLAttributes<HTMLLIElement>) => (
			<li className={["ml-4", className].join(" ")} {...props}>
				{children}
			</li>
		);
		const buildBranch = (children: SiteNode[], title: string, icon?: boolean) => {
			return (
				<ul className="flex flex-col">
					<div className="font-bold flex gap-1 items-center">
						{icon ? <span>📁</span> : null}
						{toTitleCase(title)}
						{<RouteDisplay route={"/" + title} />}
					</div>
					{children
						.map((node) => {
							if (node.children) {
								return (
									<Branch key={"/" + node.route}>
										{buildBranch(node.children, node.route, true)}
									</Branch>
								);
							}
							if (node.index) {
								return (
									<Branch key={"index"} className="italic">
										Index <RouteDisplay route="/" />
									</Branch>
								);
							}

							return (
								<Branch key={node.route}>
									{node.title} <RouteDisplay route={"/" + node.route} />
								</Branch>
							);
						})
						.sort((node1) => {
							if (node1.key === "index") {
								return -1;
							}
							return 0;
						})}
				</ul>
			);
		};

		return buildBranch(siteMap, activeSite);
	}, [activeSite, siteMap]);

	return (
		<SidebarLayout
			title="Pages"
			description="Add, edit, and restructure the pages on your site."
		>
			<div>{tree ?? <LoadingIndicator />}</div>
		</SidebarLayout>
	);
}
