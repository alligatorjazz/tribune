import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { IndexSiteNode, NamedSiteNode } from "tribune-types";
import { useAppContext } from "../../App.lib";
import LoadingIndicator from "../../components/LoadingIndicator";
import { SidebarLayout } from "../../components/SidebarLayout";
import { flattenSiteMap } from "../../lib";
export function Edit() {
	const [searchParams, setSearchParams] = useSearchParams();
	const route = searchParams.get("route");
	const { siteMap } = useAppContext();

	const node = useMemo((): IndexSiteNode | NamedSiteNode | null => {
		if (!Array.isArray(siteMap)) {
			return null;
		}
		const result = flattenSiteMap(siteMap).find(
			(node) => !node.children && node.route === route
		);
		if (result && !result.children) {
			return result;
		}
		return null;
	}, [route, siteMap]);

	return (
		<SidebarLayout
			title={node ? (node.index ? "Index" : node.title) : "Not Found"}
			description={route ?? ""}
		>
			{!node && <LoadingIndicator />}
		</SidebarLayout>
	);
}
