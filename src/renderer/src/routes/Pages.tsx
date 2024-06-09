import { useCallback } from "react";
import { SidebarLayout } from "../components/SidebarLayout";
import { SiteMap, SiteNode } from "tribune-types";

const dummyMap: SiteMap = [
	{
		title: "Home",
		route: "/"
	},
	{
		title: "About",
		route: "/about"
	},
	{
		title: "Wiki",
		route: "/wiki",
		children: [
			{
				title: "Mario",
				route: "/mario",
				children: [
					{
						title: "Wario",
						route: "/wario"
					},
					{
						title: "Knuckles",
						route: "/knuckles"
					},
					{
						title: "Tingle",
						route: "/tingle"
					}
				]
			},
			{
				title: "Sonic",
				route: "/sonic"
			},
			{
				title: "Zelda",
				route: "/zelda"
			}
		]
	}
];

export function Pages() {
	// TODO: write tree view component\
	const buildTree = useCallback((node: SiteNode, isChild = true) => {
		if (!node.children) {
			return (
				<li key={node.route} className="flex gap-1">
					{isChild && <div>↳</div>}
					<div className="flex gap-1 items-center">
						{node.title} <span className="text-xs opacity-50">{node.route}</span>
					</div>
				</li>
			);
		}

		return (
			<li key={node.route}>
				<div>{node.title}</div>
				<ul className="ml-4">{node.children.map((child) => buildTree(child))}</ul>
			</li>
		);
	}, []);

	return (
		<SidebarLayout
			title="Pages"
			description="Add, edit, and restructure the pages on your site."
		>
			<div>
				<ul className="flex flex-col">{dummyMap.map((node) => buildTree(node, false))}</ul>
			</div>
		</SidebarLayout>
	);
}
