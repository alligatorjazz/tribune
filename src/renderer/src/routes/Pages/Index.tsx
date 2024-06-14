import { basename } from "path-browserify";
import { HTMLAttributes, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SiteNode } from "tribune-types";
import { useAppContext } from "../../App.lib";
import LoadingIndicator from "../../components/LoadingIndicator";
import { SidebarLayout } from "../../components/SidebarLayout";

export function Pages() {
	const { activeSite, siteMap, previewRoute, setpreviewRoute } = useAppContext();
	const navigate = useNavigate();
	const tree = useMemo(() => {
		if (!siteMap || siteMap === "loading" || !activeSite) {
			return null;
		}

		const RouteDisplay = ({ route }: { route: string }) => (
			<span className="opacity-50 text-sm">{route}</span>
		);

		const Branch = ({ className, children, ...props }: HTMLAttributes<HTMLLIElement>) => (
			<li className={["ml-4 flex gap-1 items-center", className].join(" ")} {...props}>
				{children}
			</li>
		);

		const PageButton = ({
			className,
			children,
			node,
			...props
		}: HTMLAttributes<HTMLDivElement> & { node: SiteNode }) => (
			<div
				{...props}
				className={["hover:text-accentColor cursor-pointer", className].join(" ")}
				onClick={() => setpreviewRoute(node.route)}
			>
				{children}
			</div>
		);

		const EditButton = ({
			node,
			className,
			...props
		}: HTMLAttributes<HTMLDivElement> & { node: SiteNode }) => {
			return (
				<div className={["flex-1 flex justify-end", className].join(" ")} {...props}>
					<button
						onClick={() =>
							navigate(`edit?${new URLSearchParams({ route: node.route })}`)
						}
						className="bg-inherit text-2xl hover:text-accentColor"
					>
						✎
					</button>
				</div>
			);
		};

		const buildBranch = (children: SiteNode[], title: string, icon?: string) => {
			return (
				<ul className="flex flex-col w-full">
					<div className="font-bold flex gap-1 items-center">
						{icon ? <span>{icon}</span> : null}
						{title}
						{/* {<RouteDisplay route={title} />} */}
					</div>
					{children
						.map((node) => {
							const isCurrent = previewRoute === node.route;
							// folders
							if (node.children) {
								return (
									<Branch key={node.route} className="select-none">
										{buildBranch(node.children, node.route, "📁")}
									</Branch>
								);
							}
							// indexes
							if (node.index) {
								return (
									<Branch
										key={"index"}
										className={[
											"italic",
											isCurrent ? "backdrop-brightness-75" : ""
										].join(" ")}
									>
										<PageButton node={node}>Index</PageButton>{" "}
										<RouteDisplay route="/" />
										<EditButton node={node} />
									</Branch>
								);
							}

							// pages
							return (
								<Branch
									key={node.route}
									className={isCurrent ? "backdrop-brightness-75" : ""}
								>
									<PageButton node={node}>{node.title}</PageButton>
									<RouteDisplay route={"/" + basename(node.route, ".html")} />
									<EditButton node={node} />
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

		return buildBranch(siteMap, activeSite, "🌎");
	}, [activeSite, navigate, previewRoute, setpreviewRoute, siteMap]);

	return (
		<SidebarLayout
			title="Pages"
			description="Add, edit, and restructure the pages on your site."
		>
			<div>{tree ?? <LoadingIndicator />}</div>
		</SidebarLayout>
	);
}
